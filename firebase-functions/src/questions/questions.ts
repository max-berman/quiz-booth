import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { randomUUID } from 'crypto';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { rateLimitConfigs, withRateLimit } from '../lib/rate-limit';
import { DEEPSEEK_API_CONFIG, API_HEADERS } from '../config/api-config';
import { ProgressTracker } from '../lib/progress-tracker';

const db = admin.firestore();

// Helper function to track usage
async function trackUsage(userId: string, eventType: string, metadata?: any): Promise<void> {
  try {
    await db.collection('usageEvents').add({
      userId,
      eventType,
      metadata: metadata || {},
      timestamp: Timestamp.now(),
      costUnits: 0,
    });

    // Update counters
    const counterRef = db.collection('usageCounters').doc(userId);
    await counterRef.set(
      {
        [getCounterField(eventType)]: FieldValue.increment(1),
        lastResetDate: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Usage tracking error:', error);
  }
}

function getCounterField(eventType: string): string {
  const fieldMap: Record<string, string> = {
    game_created: 'currentPeriodGamesCreated',
    question_generated: 'currentPeriodQuestionsGenerated',
    ai_question_generated: 'currentPeriodAiQuestions',
    player_submission: 'currentPeriodPlayerSubmissions',
    analytics_viewed: 'currentPeriodAnalyticsViews',
    export_used: 'currentPeriodExports',
    custom_theme_applied: 'currentPeriodCustomThemes',
  };
  return fieldMap[eventType] || 'currentPeriodGamesCreated';
}

// Helper function to shuffle array and track the new position of an element
function shuffleArrayAndTrackIndex<T>(array: T[], trackedIndex: number): { shuffled: T[], newIndex: number } {
  const shuffled = [...array];
  const originalValue = shuffled[trackedIndex];

  // Fisher-Yates shuffle algorithm
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Find the new position of the original correct answer
  const newIndex = shuffled.indexOf(originalValue);
  return { shuffled, newIndex };
}

// Helper function to detect if a string contains a website URL
function isWebsiteURL(text: string): boolean {
  if (!text.includes('.')) {
    return false;
  }

  // Check if it starts with http/https protocol
  if (text.startsWith('http://') || text.startsWith('https://')) {
    return true;
  }

  // Common TLDs that are likely to be websites
  const commonTLDs = [
    '.com', '.org', '.net', '.io', '.co', '.dev', '.app', '.tech', '.ai', '.me',
    '.info', '.biz', '.us', '.uk', '.ca', '.au', '.de', '.fr', '.jp', '.cn',
    '.edu', '.gov', '.mil', '.xyz', '.online', '.site', '.store', '.blog',
    '.club', '.design', '.space', '.world', '.digital', '.cloud', '.tools'
  ];

  return commonTLDs.some(tld => {
    const index = text.indexOf(tld);
    if (index === -1) return false;

    const afterTLD = text.substring(index + tld.length);
    const beforeTLD = text.substring(0, index);

    const isValidPosition =
      afterTLD.length === 0 ||
      afterTLD.startsWith('/') ||
      afterTLD.startsWith('?') ||
      afterTLD.startsWith('#') ||
      afterTLD.startsWith('.');

    const hasDomainName = beforeTLD.length > 0;

    return isValidPosition && hasDomainName;
  });
}

// Helper function to generate questions in batches to avoid timeout
async function generateQuestionsInBatches(
  gameId: string,
  gameData: any,
  questionCount: number,
  progressTracker: ProgressTracker,
  batchSize: number = 5 // Increased to 5 for fewer API requests
): Promise<any[]> {
  const allQuestions: any[] = [];
  const batches = Math.ceil(questionCount / batchSize);

  console.log(`Generating ${questionCount} questions in ${batches} batches of ${batchSize} questions each`);

  for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
    const currentBatchSize = Math.min(batchSize, questionCount - (batchIndex * batchSize));
    const batchStart = batchIndex * batchSize;

    console.log(`Starting batch ${batchIndex + 1}/${batches} with ${currentBatchSize} questions`);

    // Update progress for current batch with detailed message including batch info
    await progressTracker.generatingQuestions(questionCount, batchStart, {
      currentBatch: batchIndex + 1,
      totalBatches: batches
    });

    try {
      const batchQuestions = await generateSingleBatch(
        gameId,
        gameData,
        currentBatchSize,
        batchIndex,
        batches
      );

      allQuestions.push(...batchQuestions);

      console.log(`Completed batch ${batchIndex + 1}/${batches}, generated ${batchQuestions.length} questions`);

      // Add a small delay between batches to prevent overwhelming the API
      if (batchIndex < batches - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      }
    } catch (batchError) {
      console.error(`Batch ${batchIndex + 1}/${batches} failed:`, batchError);

      // If a batch fails, try to continue with remaining batches
      if (allQuestions.length > 0) {
        console.log(`Continuing with ${allQuestions.length} questions generated so far`);
        // Update progress to reflect partial completion
        await progressTracker.generatingQuestions(questionCount, allQuestions.length);
      } else {
        // If no questions were generated, rethrow the error
        throw batchError;
      }
    }
  }

  return allQuestions;
}

// Generate a single batch of questions
async function generateSingleBatch(
  gameId: string,
  gameData: any,
  batchSize: number,
  batchIndex: number,
  totalBatches: number
): Promise<any[]> {
  const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
  if (!deepseekApiKey) {
    throw new Error('DeepSeek API key not configured');
  }

  // Determine if company name contains a website URL
  const isWebsite = isWebsiteURL(gameData?.companyName || '');
  const companyInfo = isWebsite ? `Company website: ${gameData?.companyName}` : `Company name: ${gameData?.companyName}`;
  const websiteInstruction = isWebsite ? 'IMPORTANT: If a website is provided, use your knowledge about that company from the web to create more accurate and specific questions about their business, products, services, and history.' : '';

  // Create category-specific instructions
  const categoryInstructions = (gameData?.categories || []).map((category: string) => {
    switch (category) {
      case "Company Facts":
        return `Create questions specifically about ${gameData?.companyName} and their business practices, history, products, or services. ${isWebsite ? 'Use information from the provided website to create accurate company-specific questions.' : ''}`;
      case "Industry Knowledge":
        return `Create questions about the ${gameData?.industry} industry in general, including trends, terminology, best practices, key players, innovations, and industry-specific knowledge.`;
      case "Fun Facts":
        return `Create entertaining trivia questions with fun or historical facts about the ${gameData?.industry} industry, interesting stories, lesser-known facts, or amusing industry-related trivia.`;
      case "General Knowledge":
        return `Create general knowledge questions that any visitor might enjoy answering, not specifically related to the company or industry.`;
      case "Custom Questions":
        const customDesc = gameData?.customCategoryDescription || 'custom topics';
        return `Create questions about: ${customDesc} (related to ${gameData?.industry} industry context)`;
      default:
        return `Create questions about: ${category} (related to ${gameData?.industry} industry context)`;
    }
  }).join(" ");

  const prompt = `Generate exactly ${batchSize} multiple choice trivia questions based on these requirements:
  
  ${companyInfo}
  Industry: ${gameData?.industry}
  Products or services description: ${gameData?.productDescription || 'Not provided'}
  Difficulty: ${gameData?.difficulty}
  
  ${websiteInstruction}
  
  IMPORTANT - Question Category Instructions:
  ${categoryInstructions}

  CRITICAL - ENHANCEMENT REQUIREMENTS:
  - Approximately 15% of questions should include one relevant emoji in the question text
  - Use emojis sparingly and only when they enhance engagement or clarity
  - The emoji should complement the question topic without being distracting
  - Never use emojis in answer options or explanations
  - Appropriate emoji contexts: science/tech 🧪, nature 🌿, history 🏛️, geography 🌍, pop culture 🎬, etc.
  - Ensure questions are engaging, educational, and factually accurate
  - Vary the position of correct answers randomly
  
  Return ONLY a JSON object with a "questions" array containing the questions in this exact format:
  {
    "questions": [
      {
        "questionText": "Question here?🌟",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 0,
        "explanation": "Brief explanation of the answer"
      }
    ]
  }

  
  Make sure:
  - Follow the category instructions precisely
  - Each question has exactly 4 options
  - correctAnswer is the index (0-3) of the correct option
  - Include a brief explanation for each answer
  - Vary the position of correct answers
  - Approximately 15% of questions include a relevant emoji in questionText
  - Return valid JSON only, no additional text`;

  console.log(`Sending request to DeepSeek API for batch ${batchIndex + 1}/${totalBatches} (${batchSize} questions)`);

  // Log the exact API request details
  console.log(`=== DEEPSEEK API REQUEST DETAILS ===`);
  console.log(`URL: ${DEEPSEEK_API_CONFIG.BASE_URL}${DEEPSEEK_API_CONFIG.CHAT_COMPLETIONS_ENDPOINT}`);
  console.log(`Model: ${DEEPSEEK_API_CONFIG.DEFAULT_MODEL}`);
  console.log(`Batch: ${batchIndex + 1}/${totalBatches}`);
  console.log(`Questions in batch: ${batchSize}`);
  console.log(`Prompt length: ${prompt.length} characters`);
  console.log(`Prompt preview: ${prompt.substring(0, 200)}...`);
  console.log(`====================================`);

  // Add timeout handling for DeepSeek API call with retry logic
  const maxRetries = 1; // Reduced retries for faster timeout
  let retryCount = 0;
  let lastError: Error | null = null;

  while (retryCount <= maxRetries) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // Reduced to 1 minute per batch

    try {
      console.log(`Attempt ${retryCount + 1}/${maxRetries + 1} for batch ${batchIndex + 1}/${totalBatches}`);

      const response = await fetch(`${DEEPSEEK_API_CONFIG.BASE_URL}${DEEPSEEK_API_CONFIG.CHAT_COMPLETIONS_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${deepseekApiKey}`,
          'Content-Type': API_HEADERS.CONTENT_TYPE,
        },
        body: JSON.stringify({
          model: DEEPSEEK_API_CONFIG.DEFAULT_MODEL,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          response_format: { type: 'json_object' }
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`DeepSeek API error for batch ${batchIndex + 1}: ${response.status} ${response.statusText}`);
        console.error(`Error details: ${errorText}`);
        console.error(`Request URL: ${DEEPSEEK_API_CONFIG.BASE_URL}${DEEPSEEK_API_CONFIG.CHAT_COMPLETIONS_ENDPOINT}`);
        console.error(`Request headers: ${JSON.stringify({
          'Authorization': 'Bearer [REDACTED]',
          'Content-Type': API_HEADERS.CONTENT_TYPE,
        })}`);
        console.error(`Request body length: ${prompt.length} characters`);
        console.error(`Batch details: batch ${batchIndex + 1}/${totalBatches}, size: ${batchSize}`);

        // Enhanced error classification
        let errorMessage = `DeepSeek API error: ${response.status} ${response.statusText}`;

        if (response.status === 429) {
          errorMessage = 'AI service is temporarily overloaded. Please try again in a few moments.';
        } else if (response.status >= 500) {
          errorMessage = 'AI service is experiencing technical difficulties. Please try again later.';
        } else if (response.status === 401 || response.status === 403) {
          errorMessage = 'AI service authentication failed. Please contact support.';
        } else if (response.status === 408) {
          errorMessage = 'AI service request timed out. Please try again with fewer questions.';
        }

        lastError = new Error(errorMessage);

        // Don't retry on authentication errors
        if (response.status === 401 || response.status === 403) {
          break;
        }

        // Retry on rate limits and server errors
        if (retryCount < maxRetries && (response.status === 429 || response.status >= 500)) {
          retryCount++;
          console.log(`Retrying batch ${batchIndex + 1} in ${retryCount * 2000}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryCount * 2000));
          continue;
        }

        throw lastError;
      }

      const dataResponse = await response.json() as any;
      console.log(`Received response from DeepSeek API for batch ${batchIndex + 1}`);
      console.log(`Response status: ${response.status}`);
      console.log(`Response ID: ${dataResponse.id}`);
      console.log(`Usage: ${JSON.stringify(dataResponse.usage)}`);

      let generatedQuestions;
      let content: string | null = null;
      try {
        content = dataResponse.choices[0].message.content;
        if (!content) {
          throw new Error('No content received from DeepSeek API');
        }

        console.log(`Raw AI response for batch ${batchIndex + 1}:`, content);

        // Log full response for debugging (truncated if too long)
        if (content.length > 1000) {
          console.log(`Full response (truncated): ${content.substring(0, 1000)}...`);
        } else {
          console.log(`Full response: ${content}`);
        }

        const parsed = JSON.parse(content);

        // Handle different response formats
        if (Array.isArray(parsed)) {
          generatedQuestions = parsed;
        } else if (parsed.questions && Array.isArray(parsed.questions)) {
          generatedQuestions = parsed.questions;
        } else if (parsed.question || parsed.questionText) {
          generatedQuestions = [parsed];
        } else {
          throw new Error(`Unexpected response format: ${JSON.stringify(parsed)}`);
        }

        console.log(`Successfully parsed ${generatedQuestions.length} questions for batch ${batchIndex + 1}`);

        // Validate each question
        generatedQuestions.forEach((q: any, index: number) => {
          if (!q.questionText && !q.question) {
            throw new Error(`Question ${index + 1} missing question text`);
          }
          if (!Array.isArray(q.options) || q.options.length !== 4) {
            throw new Error(`Question ${index + 1} has invalid options: ${JSON.stringify(q.options)}`);
          }
          if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
            throw new Error(`Question ${index + 1} has invalid correct answer: ${q.correctAnswer}`);
          }
        });

      } catch (parseError) {
        console.error(`Failed to parse DeepSeek response for batch ${batchIndex + 1}:`, parseError);
        console.error(`Raw content that failed to parse:`, content || 'No content available');
        throw new Error(`Failed to parse DeepSeek response as JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
      }

      return generatedQuestions;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error as Error;

      if (retryCount < maxRetries && !(error instanceof TypeError && error.message.includes('fetch'))) {
        retryCount++;
        console.log(`Retrying batch ${batchIndex + 1} in ${retryCount * 2000}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryCount * 2000));
        continue;
      }

      throw lastError;
    }
  }

  throw lastError || new Error(`Failed to generate batch ${batchIndex + 1} after ${maxRetries + 1} attempts`);
}

// Generate questions using DeepSeek API with progress tracking and batching
export const generateQuestions = functions.runWith({
  timeoutSeconds: 120, // 2 minutes for AI generation (reduced from 9 minutes)
  memory: '1GB'
}).https.onCall(async (data, context) => {
  const { gameId } = data;
  const progressTracker = new ProgressTracker(gameId);

  // Create progress document immediately to ensure UI can see it even if function times out
  try {
    console.log(`[DEBUG] Step 1: Starting progress tracking for game: ${gameId}`);
    await progressTracker.startGeneration();
    console.log(`[DEBUG] Step 1: Progress tracking started for game: ${gameId}`);

    // Force immediate progress update to ensure UI sees it
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify progress document was created
    const progressDoc = await db.collection('generationProgress').doc(gameId).get();
    if (progressDoc.exists) {
      console.log(`✅ Progress document successfully created for game: ${gameId}`);
    } else {
      console.error(`❌ Progress document NOT created for game: ${gameId}`);
    }
  } catch (progressError) {
    console.error('Failed to create initial progress document:', progressError);
    // Continue anyway - we'll try to update progress later
  }

  try {
    console.log(`[DEBUG] Step 2: Starting question generation for game: ${gameId}`);

    // Rate limiting check for AI generation
    console.log(`[DEBUG] Step 2a: Checking rate limits...`);
    await withRateLimit(rateLimitConfigs.aiGeneration)(data, context);
    console.log(`[DEBUG] Step 2a: Rate limit check passed for game: ${gameId}`);

    // Get game data
    console.log(`[DEBUG] Step 2b: Fetching game data from Firestore...`);
    const gameDoc = await db.collection('games').doc(gameId).get();
    if (!gameDoc.exists) {
      console.error(`Game not found: ${gameId}`);
      await progressTracker.error('Game not found');
      throw new functions.https.HttpsError('not-found', 'Game not found');
    }

    const gameData = gameDoc.data();
    const questionCount = gameData?.questionCount || 5;

    console.log(`[DEBUG] Step 2b: Game data loaded: company=${gameData?.companyName}, industry=${gameData?.industry}, questionCount=${questionCount}`);

    // Check if DeepSeek API key is available
    console.log(`[DEBUG] Step 2c: Checking DeepSeek API key...`);
    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    if (!deepseekApiKey) {
      console.error('DeepSeek API key not configured');
      await progressTracker.error('AI service configuration error');
      throw new functions.https.HttpsError('internal', 'AI service not configured');
    }
    console.log(`[DEBUG] Step 2c: DeepSeek API key is available`);

    // Track AI question generation usage for authenticated users
    if (gameData?.userId) {
      await trackUsage(gameData.userId, 'ai_question_generated', {
        questionCount: questionCount,
        gameId: gameId
      });
    }

    // Generate game title first if not already set
    let gameTitle = gameData?.gameTitle;
    if (!gameTitle) {
      console.log(`Generating game title for: ${gameData?.companyName}`);
      await progressTracker.generatingTitle();

      const titlePrompt = `Generate a short, creative game title (max 3-5 words) for a trivia game with these characteristics:
- Company: ${gameData?.companyName}
- Industry: ${gameData?.industry}
- Products or services description: ${gameData?.productDescription || 'Not provided'}
- Categories: ${gameData?.categories?.join(', ')}

Return ONLY the title as plain text, no JSON or additional formatting.`;

      const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
      if (deepseekApiKey) {
        const titleResponse = await fetch(`${DEEPSEEK_API_CONFIG.BASE_URL}${DEEPSEEK_API_CONFIG.CHAT_COMPLETIONS_ENDPOINT}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${deepseekApiKey}`,
            'Content-Type': API_HEADERS.CONTENT_TYPE,
          },
          body: JSON.stringify({
            model: DEEPSEEK_API_CONFIG.DEFAULT_MODEL,
            messages: [
              {
                role: 'user',
                content: titlePrompt
              }
            ],
            max_tokens: 50,
            temperature: 0.8,
          }),
        });

        if (titleResponse.ok) {
          const titleData = await titleResponse.json() as any;
          const generatedTitle = titleData.choices[0].message.content.trim();
          gameTitle = generatedTitle.replace(/^["']|["']$/g, '').trim();

          // Update the game with the generated title
          await db.collection('games').doc(gameId).update({
            gameTitle,
            modifiedAt: Timestamp.now(),
          });
          console.log(`Generated game title: ${gameTitle}`);
        }
      }
    }

    console.log(`Starting DeepSeek API call for ${questionCount} questions using batched approach (batch size: 5)`);

    // Generate questions in batches to avoid timeout
    const generatedQuestions = await generateQuestionsInBatches(
      gameId,
      gameData,
      questionCount,
      progressTracker,
      5 // Increased to 5 for fewer API requests
    );

    console.log(`Successfully generated ${generatedQuestions.length} questions`);

    // Update progress for saving questions
    await progressTracker.savingQuestions();

    // Create questions with shuffled options
    const questionsToInsert = generatedQuestions.map((q: any, index: number) => {
      const { shuffled: shuffledOptions, newIndex: newCorrectAnswer } = shuffleArrayAndTrackIndex(
        q.options || q.choices || [],
        typeof q.correctAnswer === 'number' ? q.correctAnswer : (q.correct || 0)
      );

      return {
        id: randomUUID(),
        gameId: gameId,
        questionText: q.questionText || q.question || q.text,
        options: shuffledOptions,
        correctAnswer: newCorrectAnswer,
        explanation: q.explanation || q.answer_explanation || '',
        order: index + 1,
      };
    });

    // Batch insert questions
    const batch = db.batch();
    questionsToInsert.forEach((question: any) => {
      const questionRef = db.collection('questions').doc(question.id);
      batch.set(questionRef, question);
    });

    await batch.commit();
    console.log(`Successfully saved ${questionsToInsert.length} questions to database`);

    // Update the game's actualQuestionCount field
    await db.collection('games').doc(gameId).update({
      actualQuestionCount: questionsToInsert.length,
      modifiedAt: Timestamp.now(),
    });
    console.log(`Updated actualQuestionCount to ${questionsToInsert.length} for game ${gameId}`);

    // Mark generation as completed
    await progressTracker.completed();

    // Schedule cleanup
    await progressTracker.cleanup();

    return questionsToInsert;
  } catch (error) {
    console.error('Generate questions error:', error);

    // Enhanced error handling for timeout
    let errorMessage = `Generation failed: ${error instanceof Error ? error.message : String(error)}`;
    if (errorMessage.includes('deadline-exceeded') || errorMessage.includes('timeout')) {
      errorMessage = 'Question generation timed out. The AI service is taking too long to respond. Please try again with fewer questions.';
    }

    await progressTracker.error(errorMessage);
    throw new functions.https.HttpsError('internal', 'Failed to generate questions');
  }
});

// Delete a question
export const deleteQuestion = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const userId = context.auth.uid;
  const { questionId } = data;

  try {
    // Get the question to verify ownership
    const questionDoc = await db.collection('questions').doc(questionId).get();
    if (!questionDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Question not found');
    }

    const questionData = questionDoc.data();
    const gameId = questionData?.gameId;

    // Verify user owns the game that contains this question
    const gameDoc = await db.collection('games').doc(gameId).get();
    if (!gameDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Game not found');
    }

    const gameData = gameDoc.data();
    if (gameData?.userId !== userId) {
      throw new functions.https.HttpsError('permission-denied', 'Access denied');
    }

    // Delete the question
    await db.collection('questions').doc(questionId).delete();

    // Update the game's actualQuestionCount
    const questionsSnapshot = await db
      .collection('questions')
      .where('gameId', '==', gameId)
      .get();

    const newQuestionCount = questionsSnapshot.size;

    await db.collection('games').doc(gameId).update({
      actualQuestionCount: newQuestionCount,
      modifiedAt: Timestamp.fromDate(new Date()),
    });

    console.log(`Question ${questionId} deleted successfully`);
    return { success: true, message: 'Question deleted successfully' };
  } catch (error) {
    console.error('Delete question error:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to delete question');
  }
});

// Update a question
export const updateQuestion = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const userId = context.auth.uid;
  const { questionId, updates } = data;

  try {
    // Get the question to verify ownership
    const questionDoc = await db.collection('questions').doc(questionId).get();
    if (!questionDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Question not found');
    }

    const questionData = questionDoc.data();
    const gameId = questionData?.gameId;

    // Verify user owns the game that contains this question
    const gameDoc = await db.collection('games').doc(gameId).get();
    if (!gameDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Game not found');
    }

    const gameData = gameDoc.data();
    if (gameData?.userId !== userId) {
      throw new functions.https.HttpsError('permission-denied', 'Access denied');
    }

    // Filter out fields that shouldn't be updated
    const allowedUpdates = { ...updates };
    delete (allowedUpdates as any).id;
    delete (allowedUpdates as any).gameId;
    delete (allowedUpdates as any).userId;

    // Update the question
    await db.collection('questions').doc(questionId).update({
      ...allowedUpdates,
    });

    console.log(`Question ${questionId} updated successfully`);
    return { success: true, message: 'Question updated successfully' };
  } catch (error) {
    console.error('Update question error:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to update question');
  }
});

// Add a new question
export const addQuestion = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const userId = context.auth.uid;
  const { gameId, questionData } = data;

  try {
    // Verify user owns the game
    const gameDoc = await db.collection('games').doc(gameId).get();
    if (!gameDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Game not found');
    }

    const gameData = gameDoc.data();
    if (gameData?.userId !== userId) {
      throw new functions.https.HttpsError('permission-denied', 'Access denied');
    }

    // Get current questions to determine the next order
    const questionsSnapshot = await db
      .collection('questions')
      .where('gameId', '==', gameId)
      .get();

    const currentQuestions = questionsSnapshot.docs.map(doc => doc.data());
    const nextOrder = currentQuestions.length + 1;

    // Create the new question
    const questionId = randomUUID();
    const newQuestion = {
      id: questionId,
      gameId,
      questionText: questionData.questionText,
      options: questionData.options,
      correctAnswer: questionData.correctAnswer,
      explanation: questionData.explanation || null,
      order: nextOrder,
    };

    await db.collection('questions').doc(questionId).set(newQuestion);

    // Update the game's actualQuestionCount
    await db.collection('games').doc(gameId).update({
      actualQuestionCount: nextOrder,
      modifiedAt: Timestamp.fromDate(new Date()),
    });

    console.log(`Question ${questionId} added successfully to game ${gameId}`);
    return {
      success: true,
      message: 'Question added successfully',
      question: newQuestion
    };
  } catch (error) {
    console.error('Add question error:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to add question');
  }
});

// Generate a single question
export const generateSingleQuestion = functions.runWith({
  timeoutSeconds: 60, // 1 minute for single question generation (reduced from 3 minutes)
  memory: '512MB'
}).https.onCall(async (data, context) => {
  const { gameId } = data;

  try {
    // Rate limiting check for AI generation
    await withRateLimit(rateLimitConfigs.aiGeneration)(data, context);

    // Get game data
    const gameDoc = await db.collection('games').doc(gameId).get();
    if (!gameDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Game not found');
    }

    const gameData = gameDoc.data();

    // Track AI question generation usage for authenticated users
    if (gameData?.userId) {
      await trackUsage(gameData.userId, 'ai_question_generated', {
        gameId: gameId,
        singleQuestion: true
      });
    }

    // Call DeepSeek API to generate a single question
    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    if (!deepseekApiKey) {
      throw new functions.https.HttpsError('internal', 'DeepSeek API key not configured');
    }

    // Determine if company name contains a website URL
    const isWebsite = isWebsiteURL(gameData?.companyName || '');
    const companyInfo = isWebsite ? `Company website: ${gameData?.companyName}` : `Company name: ${gameData?.companyName}`;
    const websiteInstruction = isWebsite ? 'IMPORTANT: If a website is provided, use your knowledge about that company from the web to create more accurate and specific questions about their business, products, services, and history.' : '';

    // Create category-specific instructions
    const categoryInstructions = (gameData?.categories || []).map((category: string) => {
      switch (category) {
        case "Company Facts":
          return `Create a question specifically about ${gameData?.companyName} and their business practices, history, products, or services. ${isWebsite ? 'Use information from the provided website to create accurate company-specific questions.' : ''}`;
        case "Industry Knowledge":
          return `Create a question about the ${gameData?.industry} industry in general, including trends, terminology, best practices, key players, innovations, and industry-specific knowledge.`;
        case "Fun Facts":
          return `Create an entertaining trivia question with fun or historical facts about the ${gameData?.industry} industry, interesting stories, lesser-known facts, or amusing industry-related trivia.`;
        case "General Knowledge":
          return `Create a general knowledge question that any visitor might enjoy answering, not specifically related to the company or industry.`;
        case "Custom Questions":
          // Use the custom category description if provided, otherwise use generic description
          const customDesc = gameData?.customCategoryDescription || 'custom topics';
          return `Create a question about: ${customDesc} (related to ${gameData?.industry} industry context)`;
        default:
          return `Create a question about: ${category} (related to ${gameData?.industry} industry context)`;
      }
    }).join(" ");

    const prompt = `Generate exactly ONE multiple choice trivia question based on these requirements:
    
    ${companyInfo}
    Industry: ${gameData?.industry}
    Products or services description: ${gameData?.productDescription || 'Not provided'}
    Difficulty: ${gameData?.difficulty}
    
    ${websiteInstruction}
    
    IMPORTANT - Question Category Instructions:
    ${categoryInstructions}
    
    CRITICAL - UNIQUENESS REQUIREMENT:
    - Ensure the question is clear and unambiguous
    - This question must be completely unique and not duplicate any existing questions for this game.
    - Question should be interesting, educational, and factually accurate
    - **Approximately 15% of questions should include one relevant emoji in the question text**
    
    Return ONLY a JSON object with a single question in this exact format:
    {
      "questionText": "Clear and concise question? �",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief educational explanation citing verifiable facts"
    }

    
    Make sure:
    - Follow the category instructions precisely
    - The question has exactly 4 options
    - correctAnswer is the index (0-3) of the correct option
    - Include a brief explanation for the answer
    - Ensure the question is completely unique and appropriate for the specified difficulty level
    - Use emojis sparingly and only when they enhance understanding or engagement
    - Return valid JSON only, no additional text or formatting`;

    const response = await fetch(`${DEEPSEEK_API_CONFIG.BASE_URL}${DEEPSEEK_API_CONFIG.CHAT_COMPLETIONS_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': API_HEADERS.CONTENT_TYPE,
      },
      body: JSON.stringify({
        model: DEEPSEEK_API_CONFIG.DEFAULT_MODEL,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
    }

    const dataResponse = await response.json() as any;
    let generatedQuestion;

    try {
      const content = dataResponse.choices[0].message.content;
      const parsed = JSON.parse(content);

      // Handle different response formats
      if (parsed.questionText && parsed.options) {
        generatedQuestion = parsed;
      } else if (parsed.question || parsed.text) {
        generatedQuestion = {
          questionText: parsed.questionText || parsed.question || parsed.text,
          options: parsed.options || parsed.choices || [],
          correctAnswer: typeof parsed.correctAnswer === 'number' ? parsed.correctAnswer : (parsed.correct || 0),
          explanation: parsed.explanation || parsed.answer_explanation || '',
        };
      } else {
        throw new Error(`Unexpected response format: ${JSON.stringify(parsed)}`);
      }
    } catch (parseError) {
      throw new Error(`Failed to parse DeepSeek response as JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
    }

    // Validate the question structure
    if (!generatedQuestion.questionText || !Array.isArray(generatedQuestion.options) || generatedQuestion.options.length !== 4) {
      throw new Error('Invalid question format received from AI');
    }

    // Shuffle the options
    const { shuffled: shuffledOptions, newIndex: newCorrectAnswer } = shuffleArrayAndTrackIndex(
      generatedQuestion.options,
      generatedQuestion.correctAnswer
    );

    const randomizedQuestion = {
      ...generatedQuestion,
      options: shuffledOptions,
      correctAnswer: newCorrectAnswer
    };

    return randomizedQuestion;
  } catch (error) {
    console.error('Generate single question error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate question');
  }
});
