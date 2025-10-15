import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { randomUUID } from 'crypto';
import { Timestamp } from 'firebase-admin/firestore';
import { rateLimitConfigs, withRateLimit } from '../lib/rate-limit';
import { ProgressTracker } from '../lib/progress-tracker';
import { getLLMService } from './llm-service';
import { trackUsage, isWebsiteURL, shuffleArrayAndTrackIndex } from './utils';

const db = admin.firestore();

/**
 * Generate questions in batches to avoid timeout
 */
async function generateQuestionsInBatches(
  gameId: string,
  gameData: any,
  questionCount: number,
  progressTracker: ProgressTracker,
  batchSize: number = 5
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

/**
 * Generate a single batch of questions
 */
async function generateSingleBatch(
  gameId: string,
  gameData: any,
  batchSize: number,
  batchIndex: number,
  totalBatches: number
): Promise<any[]> {
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

  console.log(`Generating batch ${batchIndex + 1}/${totalBatches} with ${batchSize} questions`);

  // Log the prompt details
  console.log(`=== LLM PROMPT DETAILS ===`);
  console.log(`Batch: ${batchIndex + 1}/${totalBatches}`);
  console.log(`Questions in batch: ${batchSize}`);
  console.log(`Prompt length: ${prompt.length} characters`);
  console.log(`Prompt preview: ${prompt.substring(0, 200)}...`);
  console.log(`==========================`);

  try {
    // Use the LLM service with fallback capability
    const generatedQuestions = await getLLMService().generateQuestionsWithFallback(
      prompt,
      batchSize,
      (from, to) => {
        console.log(`Provider switched from ${from} to ${to} for batch ${batchIndex + 1}`);
      }
    );

    console.log(`Successfully generated ${generatedQuestions.length} questions for batch ${batchIndex + 1}`);

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

    return generatedQuestions;
  } catch (error) {
    console.error(`Failed to generate batch ${batchIndex + 1}:`, error);
    throw error;
  }
}

/**
 * Generate multiple questions using AI with progress tracking and batching
 */
export const generateQuestions = functions.runWith({
  timeoutSeconds: 120, // 2 minutes for AI generation
  memory: '512MB'
}).https.onCall(async (data, context) => {
  const { gameId } = data;
  const progressTracker = new ProgressTracker(gameId);

  try {
    // Rate limiting check for AI generation
    await withRateLimit(rateLimitConfigs.aiGeneration)(data, context);

    // Initialize progress tracking
    await progressTracker.startGeneration();

    // Get game data
    const gameDoc = await db.collection('games').doc(gameId).get();
    if (!gameDoc.exists) {
      await progressTracker.error('Game not found');
      throw new functions.https.HttpsError('not-found', 'Game not found');
    }

    const gameData = gameDoc.data();
    const questionCount = gameData?.questionCount || 5;

    // Check if any LLM provider is available
    if (!getLLMService().getProviderOrder().some(provider => provider.includes('DeepSeek') || provider.includes('OpenAI'))) {
      await progressTracker.error('AI service configuration error');
      throw new functions.https.HttpsError('internal', 'AI service not configured');
    }

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

      try {
        // Use the LLM service for plain text generation
        const titleText = await getLLMService().generatePlainTextWithFallback(
          titlePrompt,
          (from, to) => {
            console.log(`Provider switched from ${from} to ${to} for title generation`);
          }
        );

        if (titleText) {
          gameTitle = titleText.trim().replace(/^["']|["']$/g, '').trim();

          // Update the game with the generated title
          await db.collection('games').doc(gameId).update({
            gameTitle,
            modifiedAt: Timestamp.now(),
          });
          console.log(`Generated game title: ${gameTitle}`);
        }
      } catch (error) {
        console.error('Failed to generate game title:', error);
        // Continue without title if generation fails
      }
    }

    // Generate questions in batches to avoid timeout
    const generatedQuestions = await generateQuestionsInBatches(
      gameId,
      gameData,
      questionCount,
      progressTracker
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

    // Update the game's actualQuestionCount field and track LLM provider
    const llmProvider = getLLMService().getLastUsedProvider();
    await db.collection('games').doc(gameId).update({
      actualQuestionCount: questionsToInsert.length,
      modifiedAt: Timestamp.now(),
      llm: llmProvider || 'Unknown'
    });
    console.log(`Updated actualQuestionCount to ${questionsToInsert.length} for game ${gameId}, LLM: ${llmProvider || 'Unknown'}`);

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
