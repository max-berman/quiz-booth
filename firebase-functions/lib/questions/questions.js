"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addQuestion = exports.deleteQuestion = exports.updateQuestion = exports.getQuestions = exports.generateSingleQuestion = exports.generateQuestions = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const crypto_1 = require("crypto");
const firestore_1 = require("firebase-admin/firestore");
const rate_limit_1 = require("../lib/rate-limit");
const api_config_1 = require("../config/api-config");
const db = admin.firestore();
// Helper function to track usage
async function trackUsage(userId, eventType, metadata) {
    try {
        await db.collection('usageEvents').add({
            userId,
            eventType,
            metadata: metadata || {},
            timestamp: firestore_1.Timestamp.now(),
            costUnits: 0,
        });
        // Update counters
        const counterRef = db.collection('usageCounters').doc(userId);
        await counterRef.set({
            [getCounterField(eventType)]: firestore_1.FieldValue.increment(1),
            lastResetDate: firestore_1.Timestamp.now(),
            updatedAt: firestore_1.Timestamp.now(),
        }, { merge: true });
    }
    catch (error) {
        console.error('Usage tracking error:', error);
    }
}
function getCounterField(eventType) {
    const fieldMap = {
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
function shuffleArrayAndTrackIndex(array, trackedIndex) {
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
function isWebsiteURL(text) {
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
        if (index === -1)
            return false;
        const afterTLD = text.substring(index + tld.length);
        const beforeTLD = text.substring(0, index);
        const isValidPosition = afterTLD.length === 0 ||
            afterTLD.startsWith('/') ||
            afterTLD.startsWith('?') ||
            afterTLD.startsWith('#') ||
            afterTLD.startsWith('.');
        const hasDomainName = beforeTLD.length > 0;
        return isValidPosition && hasDomainName;
    });
}
// Generate questions using DeepSeek API
exports.generateQuestions = functions.https.onCall(async (data, context) => {
    var _a;
    const { gameId } = data;
    try {
        // Rate limiting check for AI generation
        await (0, rate_limit_1.withRateLimit)(rate_limit_1.rateLimitConfigs.aiGeneration)(data, context);
        // Get game data
        const gameDoc = await db.collection('games').doc(gameId).get();
        if (!gameDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Game not found');
        }
        const gameData = gameDoc.data();
        // Track AI question generation usage for authenticated users
        if (gameData === null || gameData === void 0 ? void 0 : gameData.userId) {
            await trackUsage(gameData.userId, 'ai_question_generated', {
                questionCount: gameData.questionCount,
                gameId: gameId
            });
        }
        // Call DeepSeek API to generate questions
        const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
        if (!deepseekApiKey) {
            throw new functions.https.HttpsError('internal', 'DeepSeek API key not configured');
        }
        // Generate game title first if not already set
        let gameTitle = gameData === null || gameData === void 0 ? void 0 : gameData.gameTitle;
        if (!gameTitle) {
            const titlePrompt = `Generate a short, creative game title (max 3-5 words) for a trivia game with these characteristics:
- Company: ${gameData === null || gameData === void 0 ? void 0 : gameData.companyName}
- Industry: ${gameData === null || gameData === void 0 ? void 0 : gameData.industry}
- Description: ${(gameData === null || gameData === void 0 ? void 0 : gameData.productDescription) || 'Not provided'}
- Categories: ${(_a = gameData === null || gameData === void 0 ? void 0 : gameData.categories) === null || _a === void 0 ? void 0 : _a.join(', ')}

Return ONLY the title as plain text, no JSON or additional formatting.`;
            const titleResponse = await fetch(`${api_config_1.DEEPSEEK_API_CONFIG.BASE_URL}${api_config_1.DEEPSEEK_API_CONFIG.CHAT_COMPLETIONS_ENDPOINT}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${deepseekApiKey}`,
                    'Content-Type': api_config_1.API_HEADERS.CONTENT_TYPE,
                },
                body: JSON.stringify({
                    model: api_config_1.DEEPSEEK_API_CONFIG.DEFAULT_MODEL,
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
                    modifiedAt: firestore_1.Timestamp.now(),
                });
            }
        }
        // Determine if company name contains a website URL
        const isWebsite = isWebsiteURL((gameData === null || gameData === void 0 ? void 0 : gameData.companyName) || '');
        const companyInfo = isWebsite ? `Company website: ${gameData === null || gameData === void 0 ? void 0 : gameData.companyName}` : `Company name: ${gameData === null || gameData === void 0 ? void 0 : gameData.companyName}`;
        const websiteInstruction = isWebsite ? 'IMPORTANT: If a website is provided, use your knowledge about that company from the web to create more accurate and specific questions about their business, products, services, and history.' : '';
        // Create category-specific instructions
        const categoryInstructions = ((gameData === null || gameData === void 0 ? void 0 : gameData.categories) || []).map((category) => {
            switch (category) {
                case "Company Facts":
                    return `Create questions specifically about ${gameData === null || gameData === void 0 ? void 0 : gameData.companyName} and their business practices, history, products, or services. ${isWebsite ? 'Use information from the provided website to create accurate company-specific questions.' : ''}`;
                case "Industry Knowledge":
                    return `Create questions about the ${gameData === null || gameData === void 0 ? void 0 : gameData.industry} industry in general, including trends, terminology, best practices, key players, innovations, and industry-specific knowledge.`;
                case "Fun Facts":
                    return `Create entertaining trivia questions with fun or historical facts about the ${gameData === null || gameData === void 0 ? void 0 : gameData.industry} industry, interesting stories, lesser-known facts, or amusing industry-related trivia.`;
                case "General Knowledge":
                    return `Create general knowledge questions that any visitor might enjoy answering, not specifically related to the company or industry.`;
                default:
                    return `Create questions about: ${category} (related to ${gameData === null || gameData === void 0 ? void 0 : gameData.industry} industry context)`;
            }
        }).join(" ");
        const prompt = `Generate ${gameData === null || gameData === void 0 ? void 0 : gameData.questionCount} multiple choice trivia questions based on these requirements:
    
    ${companyInfo}
    Industry: ${gameData === null || gameData === void 0 ? void 0 : gameData.industry}
    Company description: ${(gameData === null || gameData === void 0 ? void 0 : gameData.productDescription) || 'Not provided'}
    Difficulty: ${gameData === null || gameData === void 0 ? void 0 : gameData.difficulty}
    
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
        const response = await fetch(`${api_config_1.DEEPSEEK_API_CONFIG.BASE_URL}${api_config_1.DEEPSEEK_API_CONFIG.CHAT_COMPLETIONS_ENDPOINT}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${deepseekApiKey}`,
                'Content-Type': api_config_1.API_HEADERS.CONTENT_TYPE,
            },
            body: JSON.stringify({
                model: api_config_1.DEEPSEEK_API_CONFIG.DEFAULT_MODEL,
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
        const dataResponse = await response.json();
        let generatedQuestions;
        try {
            const content = dataResponse.choices[0].message.content;
            const parsed = JSON.parse(content);
            // Handle different response formats
            if (Array.isArray(parsed)) {
                generatedQuestions = parsed;
            }
            else if (parsed.questions && Array.isArray(parsed.questions)) {
                generatedQuestions = parsed.questions;
            }
            else if (parsed.question || parsed.questionText) {
                generatedQuestions = [parsed];
            }
            else {
                throw new Error(`Unexpected response format: ${JSON.stringify(parsed)}`);
            }
        }
        catch (parseError) {
            throw new Error(`Failed to parse DeepSeek response as JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
        }
        // Create questions with shuffled options
        const questionsToInsert = generatedQuestions.map((q, index) => {
            const { shuffled: shuffledOptions, newIndex: newCorrectAnswer } = shuffleArrayAndTrackIndex(q.options || q.choices || [], typeof q.correctAnswer === 'number' ? q.correctAnswer : (q.correct || 0));
            return {
                id: (0, crypto_1.randomUUID)(),
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
        questionsToInsert.forEach((question) => {
            const questionRef = db.collection('questions').doc(question.id);
            batch.set(questionRef, question);
        });
        await batch.commit();
        return questionsToInsert;
    }
    catch (error) {
        console.error('Generate questions error:', error);
        throw new functions.https.HttpsError('internal', 'Failed to generate questions');
    }
});
// Generate a single question
exports.generateSingleQuestion = functions.https.onCall(async (data, context) => {
    const { gameId } = data;
    try {
        // Rate limiting check for AI generation
        await (0, rate_limit_1.withRateLimit)(rate_limit_1.rateLimitConfigs.aiGeneration)(data, context);
        // Get game data
        const gameDoc = await db.collection('games').doc(gameId).get();
        if (!gameDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Game not found');
        }
        const gameData = gameDoc.data();
        // Track AI question generation usage for authenticated users
        if (gameData === null || gameData === void 0 ? void 0 : gameData.userId) {
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
        const isWebsite = isWebsiteURL((gameData === null || gameData === void 0 ? void 0 : gameData.companyName) || '');
        const companyInfo = isWebsite ? `Company website: ${gameData === null || gameData === void 0 ? void 0 : gameData.companyName}` : `Company name: ${gameData === null || gameData === void 0 ? void 0 : gameData.companyName}`;
        const websiteInstruction = isWebsite ? 'IMPORTANT: If a website is provided, use your knowledge about that company from the web to create more accurate and specific questions about their business, products, services, and history.' : '';
        // Create category-specific instructions
        const categoryInstructions = ((gameData === null || gameData === void 0 ? void 0 : gameData.categories) || []).map((category) => {
            switch (category) {
                case "Company Facts":
                    return `Create a question specifically about ${gameData === null || gameData === void 0 ? void 0 : gameData.companyName} and their business practices, history, products, or services. ${isWebsite ? 'Use information from the provided website to create accurate company-specific questions.' : ''}`;
                case "Industry Knowledge":
                    return `Create a question about the ${gameData === null || gameData === void 0 ? void 0 : gameData.industry} industry in general, including trends, terminology, best practices, key players, innovations, and industry-specific knowledge.`;
                case "Fun Facts":
                    return `Create an entertaining trivia question with fun or historical facts about the ${gameData === null || gameData === void 0 ? void 0 : gameData.industry} industry, interesting stories, lesser-known facts, or amusing industry-related trivia.`;
                case "General Knowledge":
                    return `Create a general knowledge question that any visitor might enjoy answering, not specifically related to the company or industry.`;
                default:
                    return `Create a question about: ${category} (related to ${gameData === null || gameData === void 0 ? void 0 : gameData.industry} industry context)`;
            }
        }).join(" ");
        const prompt = `Generate exactly ONE multiple choice trivia question based on these requirements:
    
    ${companyInfo}
    Industry: ${gameData === null || gameData === void 0 ? void 0 : gameData.industry}
    Company description: ${(gameData === null || gameData === void 0 ? void 0 : gameData.productDescription) || 'Not provided'}
    Difficulty: ${gameData === null || gameData === void 0 ? void 0 : gameData.difficulty}
    
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
      "questionText": "Clear and concise question? 🎯",
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
        const response = await fetch(`${api_config_1.DEEPSEEK_API_CONFIG.BASE_URL}${api_config_1.DEEPSEEK_API_CONFIG.CHAT_COMPLETIONS_ENDPOINT}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${deepseekApiKey}`,
                'Content-Type': api_config_1.API_HEADERS.CONTENT_TYPE,
            },
            body: JSON.stringify({
                model: api_config_1.DEEPSEEK_API_CONFIG.DEFAULT_MODEL,
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
        const dataResponse = await response.json();
        let generatedQuestion;
        try {
            const content = dataResponse.choices[0].message.content;
            const parsed = JSON.parse(content);
            // Handle different response formats
            if (parsed.questionText && parsed.options) {
                generatedQuestion = parsed;
            }
            else if (parsed.question || parsed.text) {
                generatedQuestion = {
                    questionText: parsed.questionText || parsed.question || parsed.text,
                    options: parsed.options || parsed.choices || [],
                    correctAnswer: typeof parsed.correctAnswer === 'number' ? parsed.correctAnswer : (parsed.correct || 0),
                    explanation: parsed.explanation || parsed.answer_explanation || '',
                };
            }
            else {
                throw new Error(`Unexpected response format: ${JSON.stringify(parsed)}`);
            }
        }
        catch (parseError) {
            throw new Error(`Failed to parse DeepSeek response as JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
        }
        // Validate the question structure
        if (!generatedQuestion.questionText || !Array.isArray(generatedQuestion.options) || generatedQuestion.options.length !== 4) {
            throw new Error('Invalid question format received from AI');
        }
        // Shuffle the options
        const { shuffled: shuffledOptions, newIndex: newCorrectAnswer } = shuffleArrayAndTrackIndex(generatedQuestion.options, generatedQuestion.correctAnswer);
        const randomizedQuestion = Object.assign(Object.assign({}, generatedQuestion), { options: shuffledOptions, correctAnswer: newCorrectAnswer });
        return randomizedQuestion;
    }
    catch (error) {
        console.error('Generate single question error:', error);
        throw new functions.https.HttpsError('internal', 'Failed to generate question');
    }
});
// Get questions for a game
exports.getQuestions = functions.https.onCall(async (data, context) => {
    const { gameId } = data;
    try {
        // Verify game exists and user has access
        const gameDoc = await db.collection('games').doc(gameId).get();
        if (!gameDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Game not found');
        }
        const gameData = gameDoc.data();
        // Check if game is public or user has access
        if (!(gameData === null || gameData === void 0 ? void 0 : gameData.isPublic) && (!context.auth || (gameData === null || gameData === void 0 ? void 0 : gameData.userId) !== context.auth.uid)) {
            throw new functions.https.HttpsError('permission-denied', 'Access denied');
        }
        const questionsSnapshot = await db
            .collection('questions')
            .where('gameId', '==', gameId)
            .get();
        const questions = questionsSnapshot.docs.map(doc => doc.data());
        // Sort by order
        return questions.sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    catch (error) {
        console.error('Get questions error:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Failed to get questions');
    }
});
// Update a question
exports.updateQuestion = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
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
        const gameDoc = await db.collection('games').doc(questionData === null || questionData === void 0 ? void 0 : questionData.gameId).get();
        if (!gameDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Game not found');
        }
        const gameData = gameDoc.data();
        if ((gameData === null || gameData === void 0 ? void 0 : gameData.userId) !== userId) {
            throw new functions.https.HttpsError('permission-denied', 'Access denied');
        }
        // Update the question
        await db.collection('questions').doc(questionId).update(updates);
        // Update game's modifiedAt timestamp
        await db.collection('games').doc(questionData === null || questionData === void 0 ? void 0 : questionData.gameId).update({
            modifiedAt: firestore_1.Timestamp.now()
        });
        // Return updated question
        const updatedQuestionDoc = await db.collection('questions').doc(questionId).get();
        return updatedQuestionDoc.data();
    }
    catch (error) {
        console.error('Update question error:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Failed to update question');
    }
});
// Delete a question
exports.deleteQuestion = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
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
        const gameDoc = await db.collection('games').doc(questionData === null || questionData === void 0 ? void 0 : questionData.gameId).get();
        if (!gameDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Game not found');
        }
        const gameData = gameDoc.data();
        if ((gameData === null || gameData === void 0 ? void 0 : gameData.userId) !== userId) {
            throw new functions.https.HttpsError('permission-denied', 'Access denied');
        }
        // Delete the question
        await db.collection('questions').doc(questionId).delete();
        // Update game's modifiedAt timestamp
        await db.collection('games').doc(questionData === null || questionData === void 0 ? void 0 : questionData.gameId).update({
            modifiedAt: firestore_1.Timestamp.now()
        });
        return { success: true };
    }
    catch (error) {
        console.error('Delete question error:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Failed to delete question');
    }
});
// Add a question to a game
exports.addQuestion = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
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
        if ((gameData === null || gameData === void 0 ? void 0 : gameData.userId) !== userId) {
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
        const questionId = (0, crypto_1.randomUUID)();
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
            modifiedAt: firestore_1.Timestamp.now()
        });
        // Add the question
        await db.collection('questions').doc(questionId).set(question);
        return question;
    }
    catch (error) {
        console.error('Add question error:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Failed to add question');
    }
});
//# sourceMappingURL=questions.js.map