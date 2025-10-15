import * as functions from 'firebase-functions';
import { rateLimitConfigs, withRateLimit } from '../lib/rate-limit';
import { getLLMService } from './llm-service';
import { trackUsage, isWebsiteURL, shuffleArrayAndTrackIndex } from './utils';
import { handleLLMError } from './error-handler';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * Generate a single question
 */
export const generateSingleQuestion = functions.runWith({
  timeoutSeconds: 60, // 1 minute for single question generation
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
      "questionText": "Clear and concise question? ",
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

    console.log('Generating single question with LLM service');

    try {
      // Use the LLM service with fallback capability
      const generatedQuestion = await getLLMService().generateSingleQuestionWithFallback(
        prompt,
        (from: string, to: string) => {
          console.log(`Provider switched from ${from} to ${to} for single question generation`);
        }
      );

      console.log('Successfully generated single question');

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
      console.error('LLM service error for single question:', error);

      // Use enhanced error handling to provide better error messages
      const errorInfo = handleLLMError(error);

      // Create a user-friendly error with the enhanced classification
      const enhancedError = new Error(errorInfo.userMessage);
      (enhancedError as any).errorType = errorInfo.errorType;
      throw enhancedError;
    }
  } catch (error) {
    console.error('Generate single question error:', error);

    // Enhanced error handling for the main function
    let errorMessage = `Failed to generate question: ${error instanceof Error ? error.message : String(error)}`;

    // Check for specific error types and provide better messages
    if (errorMessage.includes('deadline-exceeded') || errorMessage.includes('timeout')) {
      errorMessage = 'Question generation timed out. The AI service is taking too long to respond. Please try again.';
    } else if (errorMessage.includes('network') || errorMessage.includes('ECONNREFUSED') || errorMessage.includes('ENOTFOUND')) {
      errorMessage = 'Network connection issue. Please check your internet connection and try again.';
    }

    throw new functions.https.HttpsError('internal', errorMessage);
  }
});
