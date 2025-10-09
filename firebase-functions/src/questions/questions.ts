import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { randomUUID } from 'crypto';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { rateLimitConfigs, withRateLimit } from '../lib/rate-limit';
import { DEEPSEEK_API_CONFIG, API_HEADERS } from '../config/api-config';

const db = admin.firestore();

// Type definitions for better type safety
interface Question {
  id: string;
  gameId: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  order: number;
}

interface GeneratedQuestion {
  questionText?: string;
  question?: string;
  text?: string;
  options?: string[];
  choices?: string[];
  correctAnswer?: number;
  correct?: number;
  explanation?: string;
  answer_explanation?: string;
}

interface UsageMetadata {
  questionCount?: number;
  gameId?: string;
  singleQuestion?: boolean;
}


interface ShuffleResult<T> {
  shuffled: T[];
  newIndex: number;
}

// Performance: Configuration for timeouts and retries
const API_CONFIG = {
  TIMEOUT_MS: 30000, // 30 seconds timeout for API calls
  MAX_RETRIES: 3, // Maximum number of retry attempts
  RETRY_DELAY_MS: 1000, // Initial retry delay in milliseconds
  MAX_RETRY_DELAY_MS: 10000, // Maximum retry delay in milliseconds
} as const;

// Performance: Helper function for exponential backoff with jitter
function calculateRetryDelay(attempt: number): number {
  const baseDelay = API_CONFIG.RETRY_DELAY_MS * Math.pow(2, attempt);
  const jitter = Math.random() * 1000; // Add up to 1 second of jitter
  return Math.min(baseDelay + jitter, API_CONFIG.MAX_RETRY_DELAY_MS);
}

// Performance: Helper function to sleep for a specified duration
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Security: Input sanitization functions
function sanitizePromptInput(input: string): string {
  if (!input) return '';

  // Remove or escape potentially dangerous characters for prompt injection
  return input
    .replace(/[{}[\]\\]/g, '') // Remove JSON/control characters
    .replace(/["']/g, '') // Remove quotes that could break JSON
    .replace(/[\n\r\t]/g, ' ') // Normalize whitespace
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim()
    .substring(0, 500); // Limit length to prevent abuse
}



function validateGameData(gameData: any): void {
  if (!gameData) {
    throw new functions.https.HttpsError('invalid-argument', 'Game data is required');
  }

  // Validate required fields
  if (!gameData.companyName?.trim()) {
    throw new functions.https.HttpsError('invalid-argument', 'Company name is required');
  }

  if (!gameData.industry?.trim()) {
    throw new functions.https.HttpsError('invalid-argument', 'Industry is required');
  }

  // Validate question count
  const questionCount = gameData.questionCount || 0;
  if (questionCount < 1 || questionCount > 50) {
    throw new functions.https.HttpsError('invalid-argument', 'Question count must be between 1 and 50');
  }

  // Validate categories
  if (!Array.isArray(gameData.categories) || gameData.categories.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'At least one category is required');
  }

  // Validate difficulty
  const validDifficulties = ['Easy', 'Medium', 'Hard'];
  if (!validDifficulties.includes(gameData.difficulty)) {
    throw new functions.https.HttpsError('invalid-argument', 'Difficulty must be Easy, Medium, or Hard');
  }
}


// Helper functions to reduce code duplication
interface PromptOptions {
  isSingleQuestion: boolean;
  gameData: any;
  isWebsite: boolean;
}

function buildPrompt(options: PromptOptions): string {
  const { isSingleQuestion, gameData, isWebsite } = options;

  // Security: Sanitize all user inputs to prevent prompt injection
  const sanitizedCompanyName = sanitizePromptInput(gameData?.companyName || '');
  const sanitizedIndustry = sanitizePromptInput(gameData?.industry || '');
  const sanitizedCustomCategoryDescription = sanitizePromptInput(gameData?.customCategoryDescription || '');
  const sanitizedCategories = (gameData?.categories || []).map((cat: string) => sanitizePromptInput(cat));

  const companyInfo = isWebsite ? `Company website: ${sanitizedCompanyName}` : `Company name: ${sanitizedCompanyName}`;
  const websiteInstruction = isWebsite ? 'IMPORTANT: If a website is provided, use your knowledge about that company from the web to create more accurate and specific questions about their business, products, services, and history.' : '';

  // Create category-specific instructions
  const categoryInstructions = sanitizedCategories.map((category: string) => {
    switch (category) {
      case "Company Facts":
        return `${isSingleQuestion ? 'Create a question' : 'Create questions'} specifically about ${sanitizedCompanyName} and their business practices, history, products, or services. ${isWebsite ? 'Use information from the provided website to create accurate company-specific questions.' : ''}`;
      case "Industry Knowledge":
        return `${isSingleQuestion ? 'Create a question' : 'Create questions'} about the ${sanitizedIndustry} industry in general, including trends, terminology, best practices, key players, innovations, and industry-specific knowledge.`;
      case "Fun Facts":
        return `${isSingleQuestion ? 'Create an entertaining trivia question' : 'Create entertaining trivia questions'} with fun or historical facts about the ${sanitizedIndustry} industry, interesting stories, lesser-known facts, or amusing industry-related trivia.`;
      case "General Knowledge":
        return `${isSingleQuestion ? 'Create a general knowledge question' : 'Create general knowledge questions'} that any visitor might enjoy answering, not specifically related to the company or industry.`;
      case "Custom Questions":
        const customDesc = sanitizedCustomCategoryDescription || 'custom topics';
        return `${isSingleQuestion ? 'Create a question' : 'Create questions'} about: ${customDesc} (related to ${sanitizedIndustry} industry context)`;
      default:
        return `${isSingleQuestion ? 'Create a question' : 'Create questions'} about: ${category} (related to ${sanitizedIndustry} industry context)`;
    }
  }).join(" ");

  const questionCountText = isSingleQuestion ? 'exactly ONE' : `${gameData?.questionCount}`;
  const uniquenessRequirement = isSingleQuestion ? `
    
    CRITICAL - UNIQUENESS REQUIREMENT:
    - Ensure the question is clear and unambiguous
    - This question must be completely unique and not duplicate any existing questions for this game.
    - Question should be interesting, educational, and factually accurate` : '';

  const responseFormat = isSingleQuestion ? `{
      "questionText": "Clear and concise question? 🎯",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief educational explanation citing verifiable facts"
    }` : `{
      "questions": [
        {
          "questionText": "Question here?🌟",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 0,
          "explanation": "Brief explanation of the answer"
        }
      ]
    }`;

  return `Generate ${questionCountText} multiple choice trivia question${isSingleQuestion ? '' : 's'} based on these requirements:
    
    ${companyInfo}
    Industry: ${gameData?.industry}
    Products or services description: ${gameData?.productDescription || 'Not provided'}
    Difficulty: ${gameData?.difficulty}
    
    ${websiteInstruction}
    
    IMPORTANT - Question Category Instructions:
    ${categoryInstructions}
    ${uniquenessRequirement}

    CRITICAL - ENHANCEMENT REQUIREMENTS:
    - Approximately 15% of questions should include one relevant emoji in the question text
    - Use emojis sparingly and only when they enhance engagement or clarity
    - The emoji should complement the question topic without being distracting
    - Never use emojis in answer options or explanations
    - Appropriate emoji contexts: science/tech 🧪, nature 🌿, history 🏛️, geography 🌍, pop culture 🎬, etc.
    - Ensure questions are engaging, educational, and factually accurate
    - Vary the position of correct answers randomly
    
    Return ONLY a JSON object ${isSingleQuestion ? 'with a single question' : 'with a "questions" array containing the questions'} in this exact format:
    ${responseFormat}

    
    Make sure:
    - Follow the category instructions precisely
    - ${isSingleQuestion ? 'The question has' : 'Each question has'} exactly 4 options
    - correctAnswer is the index (0-3) of the correct option
    - Include a brief explanation for ${isSingleQuestion ? 'the answer' : 'each answer'}
    - Vary the position of correct answers
    - Approximately 15% of questions include a relevant emoji in questionText
    - Return valid JSON only, no additional text${isSingleQuestion ? ' or formatting' : ''}`;
}

async function callDeepSeekAPI(prompt: string, deepseekApiKey: string): Promise<any> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= API_CONFIG.MAX_RETRIES; attempt++) {
    try {
      // Performance: Create AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);

      try {
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
          // Performance: Retry on 5xx errors, fail fast on 4xx errors
          if (response.status >= 500) {
            throw new functions.https.HttpsError('internal', `DeepSeek API error: ${response.status} ${response.statusText}`);
          } else {
            throw new functions.https.HttpsError('internal', `DeepSeek API error: ${response.status} ${response.statusText}`);
          }
        }

        return await response.json();
      } catch (fetchError) {
        clearTimeout(timeoutId);

        // Performance: Handle timeout and network errors
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new functions.https.HttpsError('deadline-exceeded', `DeepSeek API request timed out after ${API_CONFIG.TIMEOUT_MS}ms`);
        }
        throw fetchError;
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Performance: Don't retry on client errors or authentication issues
      if (error instanceof functions.https.HttpsError) {
        if (error.code === 'deadline-exceeded' || error.code === 'internal') {
          // Retry on timeout or server errors
          if (attempt < API_CONFIG.MAX_RETRIES) {
            const delay = calculateRetryDelay(attempt);
            console.warn(`DeepSeek API attempt ${attempt + 1} failed, retrying in ${delay}ms:`, error.message);
            await sleep(delay);
            continue;
          }
        } else {
          // Don't retry on other HttpsErrors (permission, not-found, etc.)
          throw error;
        }
      } else {
        // Retry on network errors
        if (attempt < API_CONFIG.MAX_RETRIES) {
          const delay = calculateRetryDelay(attempt);
          console.warn(`DeepSeek API attempt ${attempt + 1} failed, retrying in ${delay}ms:`, lastError.message);
          await sleep(delay);
          continue;
        }
      }

      // If we've exhausted all retries, throw the last error
      if (attempt === API_CONFIG.MAX_RETRIES) {
        if (lastError instanceof functions.https.HttpsError) {
          throw lastError;
        } else {
          throw new functions.https.HttpsError('internal', `DeepSeek API failed after ${API_CONFIG.MAX_RETRIES + 1} attempts: ${lastError.message}`);
        }
      }
    }
  }

  // This should never be reached, but TypeScript requires it
  throw new functions.https.HttpsError('internal', 'Unexpected error in callDeepSeekAPI');
}

function parseAIResponse(content: string, isSingleQuestion: boolean): GeneratedQuestion[] {
  try {
    const parsed = JSON.parse(content);

    if (isSingleQuestion) {
      // Handle single question response formats
      if (parsed.questionText && parsed.options) {
        return [parsed];
      } else if (parsed.question || parsed.text) {
        return [{
          questionText: parsed.questionText || parsed.question || parsed.text,
          options: parsed.options || parsed.choices || [],
          correctAnswer: typeof parsed.correctAnswer === 'number' ? parsed.correctAnswer : (parsed.correct || 0),
          explanation: parsed.explanation || parsed.answer_explanation || '',
        }];
      } else {
        throw new functions.https.HttpsError('internal', `Unexpected response format: ${JSON.stringify(parsed)}`);
      }
    } else {
      // Handle multiple questions response formats
      if (Array.isArray(parsed)) {
        return parsed;
      } else if (parsed.questions && Array.isArray(parsed.questions)) {
        return parsed.questions;
      } else if (parsed.question || parsed.questionText) {
        return [parsed];
      } else {
        throw new functions.https.HttpsError('internal', `Unexpected response format: ${JSON.stringify(parsed)}`);
      }
    }
  } catch (parseError) {
    throw new functions.https.HttpsError('internal', `Failed to parse DeepSeek response as JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
  }
}

// Helper function to track usage
async function trackUsage(userId: string, eventType: string, metadata?: UsageMetadata): Promise<void> {
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
function shuffleArrayAndTrackIndex<T>(array: T[], trackedIndex: number): ShuffleResult<T> {
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

// Helper function to generate mock questions when AI service is unavailable
function generateMockQuestions(gameId: string, gameData: any): Question[] {
  const questionCount = gameData.questionCount || 5;
  const companyName = gameData.companyName || 'Company';
  const industry = gameData.industry || 'Industry';

  const mockQuestions: Question[] = [];

  for (let i = 0; i < questionCount; i++) {
    const questionId = randomUUID();
    const questionNumber = i + 1;

    mockQuestions.push({
      id: questionId,
      gameId: gameId,
      questionText: `Sample question ${questionNumber} about ${companyName} in the ${industry} industry?`,
      options: [
        'Option A - Correct answer',
        'Option B - Incorrect',
        'Option C - Incorrect',
        'Option D - Incorrect'
      ],
      correctAnswer: 0,
      explanation: `This is a sample question about ${companyName} in the ${industry} industry. In a real scenario, this would be generated by AI.`,
      order: questionNumber
    });
  }

  return mockQuestions;
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

// Generate questions using DeepSeek API
export const generateQuestions = functions.https.onCall(async (data, context) => {
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

    // Security: Validate game data before processing
    validateGameData(gameData);

    // Track AI question generation usage for authenticated users
    if (gameData?.userId) {
      await trackUsage(gameData.userId, 'ai_question_generated', {
        questionCount: gameData.questionCount,
        gameId: gameId
      });
    }

    // Call DeepSeek API to generate questions
    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    if (!deepseekApiKey) {
      console.error('DeepSeek API key not configured. Please set DEEPSEEK_API_KEY environment variable.');

      // Fallback: Generate mock questions when AI service is unavailable
      console.log('Using fallback mock questions generation');
      return generateMockQuestions(gameId, gameData);
    }

    // Generate game title first if not already set
    let gameTitle = gameData?.gameTitle;
    if (!gameTitle) {
      const titlePrompt = `Generate a short, creative game title (max 3-5 words) for a trivia game with these characteristics:
- Company: ${gameData?.companyName}
- Industry: ${gameData?.industry}
- Products or services description: ${gameData?.productDescription || 'Not provided'}
- Categories: ${gameData?.categories?.join(', ')}

Return ONLY the title as plain text, no JSON or additional formatting.`;

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
        const titleData = await titleResponse.json();
        const generatedTitle = titleData.choices[0].message.content.trim();
        gameTitle = generatedTitle.replace(/^["']|["']$/g, '').trim();

        // Update the game with the generated title
        await db.collection('games').doc(gameId).update({
          gameTitle,
          modifiedAt: Timestamp.now(),
        });
      }
    }

    // Determine if company name contains a website URL
    const isWebsite = isWebsiteURL(gameData?.companyName || '');

    // Build prompt using helper function
    const prompt = buildPrompt({
      isSingleQuestion: false,
      gameData,
      isWebsite
    });

    // Call DeepSeek API using helper function
    const dataResponse = await callDeepSeekAPI(prompt, deepseekApiKey);

    // Parse response using helper function
    const generatedQuestions = parseAIResponse(dataResponse.choices[0].message.content, false);

    // Create questions with shuffled options
    const questionsToInsert = generatedQuestions.map((q: GeneratedQuestion, index: number) => {
      const { shuffled: shuffledOptions, newIndex: newCorrectAnswer } = shuffleArrayAndTrackIndex(
        q.options || q.choices || [],
        typeof q.correctAnswer === 'number' ? q.correctAnswer : (q.correct || 0)
      );

      return {
        id: randomUUID(),
        gameId: gameId,
        questionText: q.questionText || q.question || q.text || '',
        options: shuffledOptions,
        correctAnswer: newCorrectAnswer,
        explanation: q.explanation || q.answer_explanation || '',
        order: index + 1,
      };
    });

    // Batch insert questions
    const batch = db.batch();
    questionsToInsert.forEach((question: Question) => {
      const questionRef = db.collection('questions').doc(question.id);
      batch.set(questionRef, question);
    });

    await batch.commit();

    return questionsToInsert;
  } catch (error) {
    console.error('Generate questions error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate questions');
  }
});

// Generate a single question
export const generateSingleQuestion = functions.https.onCall(async (data, context) => {
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

    // Build prompt using helper function
    const prompt = buildPrompt({
      isSingleQuestion: true,
      gameData,
      isWebsite
    });

    // Call DeepSeek API using helper function
    const dataResponse = await callDeepSeekAPI(prompt, deepseekApiKey);

    // Parse response using helper function
    const generatedQuestions = parseAIResponse(dataResponse.choices[0].message.content, true);

    // Get the single question
    const generatedQuestion = generatedQuestions[0];

    // Validate the question structure
    if (!generatedQuestion.questionText || !Array.isArray(generatedQuestion.options) || generatedQuestion.options.length !== 4) {
      throw new functions.https.HttpsError('internal', 'Invalid question format received from AI');
    }

    // Shuffle the options
    const { shuffled: shuffledOptions, newIndex: newCorrectAnswer } = shuffleArrayAndTrackIndex(
      generatedQuestion.options || [],
      generatedQuestion.correctAnswer || 0
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

// Get questions for a game
export const getQuestions = functions.https.onCall(async (data, context) => {
  const { gameId } = data;

  try {
    // Verify game exists and user has access
    const gameDoc = await db.collection('games').doc(gameId).get();
    if (!gameDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Game not found');
    }

    const gameData = gameDoc.data();

    // Check if game is public or user has access
    if (!gameData?.isPublic && (!context.auth || gameData?.userId !== context.auth.uid)) {
      throw new functions.https.HttpsError('permission-denied', 'Access denied');
    }

    const questionsSnapshot = await db
      .collection('questions')
      .where('gameId', '==', gameId)
      .get();

    const questions = questionsSnapshot.docs.map(doc => doc.data());

    // Sort by order
    return questions.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (error) {
    console.error('Get questions error:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to get questions');
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
    // Get the question
    const questionDoc = await db.collection('questions').doc(questionId).get();
    if (!questionDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Question not found');
    }

    const questionData = questionDoc.data();

    // Verify user owns the game that this question belongs to
    const gameDoc = await db.collection('games').doc(questionData?.gameId).get();
    if (!gameDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Game not found');
    }

    const gameData = gameDoc.data();
    if (gameData?.userId !== userId) {
      throw new functions.https.HttpsError('permission-denied', 'Access denied');
    }

    // Update the question
    await db.collection('questions').doc(questionId).update(updates);

    // Update game's modifiedAt timestamp
    await db.collection('games').doc(questionData?.gameId).update({
      modifiedAt: Timestamp.now()
    });

    // Return updated question
    const updatedQuestionDoc = await db.collection('questions').doc(questionId).get();
    return updatedQuestionDoc.data();
  } catch (error) {
    console.error('Update question error:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to update question');
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
    // Get the question
    const questionDoc = await db.collection('questions').doc(questionId).get();
    if (!questionDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Question not found');
    }

    const questionData = questionDoc.data();

    // Verify user owns the game that this question belongs to
    const gameDoc = await db.collection('games').doc(questionData?.gameId).get();
    if (!gameDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Game not found');
    }

    const gameData = gameDoc.data();
    if (gameData?.userId !== userId) {
      throw new functions.https.HttpsError('permission-denied', 'Access denied');
    }

    // Delete the question
    await db.collection('questions').doc(questionId).delete();

    // Update game's modifiedAt timestamp
    await db.collection('games').doc(questionData?.gameId).update({
      modifiedAt: Timestamp.now()
    });

    return { success: true };
  } catch (error) {
    console.error('Delete question error:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to delete question');
  }
});

// Add a question to a game
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

    // Get existing questions to determine order
    const questionsSnapshot = await db
      .collection('questions')
      .where('gameId', '==', gameId)
      .get();

    const existingQuestions = questionsSnapshot.docs.map(doc => doc.data());
    const maxOrder = Math.max(0, ...existingQuestions.map(q => q.order || 0));

    // Create the question
    const questionId = randomUUID();
    const question = {
      id: questionId,
      gameId,
      questionText: questionData.questionText,
      options: questionData.options,
      correctAnswer: questionData.correctAnswer,
      explanation: questionData.explanation || '',
      order: maxOrder + 1,
    };

    // Update game's modifiedAt timestamp
    await db.collection('games').doc(gameId).update({
      modifiedAt: Timestamp.now()
    });

    // Add the question
    await db.collection('questions').doc(questionId).set(question);

    return question;
  } catch (error) {
    console.error('Add question error:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to add question');
  }
});
