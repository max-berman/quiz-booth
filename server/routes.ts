import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGameSchema, insertQuestionSchema, insertPlayerSchema } from "@shared/firebase-types";
import { z } from "zod";
import { verifyFirebaseToken, optionalFirebaseAuth, type AuthenticatedRequest } from "./firebase-auth";
import { logger } from "./lib/logger";
import { gameCache, questionsCache, leaderboardCache, userGamesCache, cacheKeys, withCache } from "./lib/cache";

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

// Helper function to check if a question is a duplicate of existing questions
function isQuestionDuplicate(newQuestionText: string, existingQuestions: any[]): boolean {
  const normalizedNew = newQuestionText.toLowerCase().trim();

  return existingQuestions.some(existingQuestion => {
    const normalizedExisting = existingQuestion.questionText.toLowerCase().trim();

    // Check for exact matches or very similar questions
    if (normalizedNew === normalizedExisting) {
      return true;
    }

    // Check for questions that are too similar (e.g., minor wording differences)
    const similarityThreshold = 0.8; // 80% similarity
    const similarity = calculateTextSimilarity(normalizedNew, normalizedExisting);

    return similarity > similarityThreshold;
  });
}

// Simple text similarity calculation using Levenshtein distance
function calculateTextSimilarity(text1: string, text2: string): number {
  const longer = text1.length > text2.length ? text1 : text2;
  const shorter = text1.length > text2.length ? text2 : text1;

  if (longer.length === 0) return 1.0;

  // Calculate Levenshtein distance
  const distance = levenshteinDistance(longer, shorter);

  // Calculate similarity ratio
  return (longer.length - distance) / longer.length;
}

// Levenshtein distance implementation
function levenshteinDistance(s: string, t: string): number {
  if (s.length === 0) return t.length;
  if (t.length === 0) return s.length;

  const matrix = [];

  // Increment along the first column of each row
  for (let i = 0; i <= t.length; i++) {
    matrix[i] = [i];
  }

  // Increment each column in the first row
  for (let j = 0; j <= s.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= t.length; i++) {
    for (let j = 1; j <= s.length; j++) {
      if (t.charAt(i - 1) === s.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[t.length][s.length];
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a new game (with optional Firebase auth)
  app.post("/api/games", optionalFirebaseAuth, async (req: AuthenticatedRequest, res) => {
    try {
      logger.api.request('POST', '/api/games', req.body);
      logger.log('User authenticated?', !!req.user);

      const gameData = insertGameSchema.parse(req.body);
      logger.log('Parsed game data:', gameData);

      // Pass userId if authenticated, otherwise use legacy creator key approach
      const game = await storage.createGame(gameData, req.user?.uid);
      res.json(game);
    } catch (error) {
      logger.error('Game creation error:', error);
      if (error instanceof Error) {
        logger.error('Error stack:', error.stack);
      }
      res.status(400).json({ message: "Invalid game data", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Get game by ID (with caching)
  app.get("/api/games/:id", async (req, res) => {
    try {
      const gameId = req.params.id;
      const game = await withCache(
        gameCache,
        cacheKeys.game(gameId),
        () => storage.getGame(gameId),
        2 * 60 * 1000 // 2 minutes TTL for games
      );

      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.json(game);
    } catch (error) {
      res.status(500).json({ message: "Failed to get game", error: error instanceof Error ? error.message : String(error) });
    }
  });


  // Get games by authenticated user (Firebase auth)
  app.get("/api/user/games", verifyFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const games = await storage.getGamesByUser(req.user.uid);
      res.json(games);
    } catch (error) {
      logger.error('User games fetch error:', error);
      res.status(500).json({ message: "Failed to get user games" });
    }
  });


  // Generate questions using DeepSeek API
  app.post("/api/games/:id/generate-questions", async (req, res) => {
    try {
      const game = await storage.getGame(req.params.id);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      // Call DeepSeek API to generate questions
      const deepseekApiKey = process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY;
      if (!deepseekApiKey) {
        return res.status(500).json({ message: "DeepSeek API key not configured" });
      }

      // Determine if company name contains a website URL
      const isWebsite = game.companyName.includes('.') && (game.companyName.startsWith('http') || game.companyName.includes('.com') || game.companyName.includes('.org') || game.companyName.includes('.net'));
      const companyInfo = isWebsite ? `Company website: ${game.companyName}` : `Company name: ${game.companyName}`;
      const websiteInstruction = isWebsite ? 'IMPORTANT: If a website is provided, use your knowledge about that company from the web to create more accurate and specific questions about their business, products, services, and history.' : '';

      // Create category-specific instructions
      const categoryInstructions = game.categories.map(category => {
        switch (category) {
          case "Company Facts":
            return `Create questions specifically about ${game.companyName} and their business practices, history, products, or services. ${isWebsite ? 'Use information from the provided website to create accurate company-specific questions.' : ''}`;
          case "Industry Knowledge":
            return `Create questions about the ${game.industry} industry in general, including trends, terminology, best practices, key players, innovations, and industry-specific knowledge.`;
          case "Fun Facts":
            return `Create entertaining trivia questions with fun or historical facts about the ${game.industry} industry, interesting stories, lesser-known facts, or amusing industry-related trivia.`;
          case "General Knowledge":
            return `Create general knowledge questions that any visitor might enjoy answering, not specifically related to the company or industry.`;
          default:
            return `Create questions about: ${category} (related to ${game.industry} industry context)`;
        }
      }).join(" ");

      const prompt = `Generate ${game.questionCount} multiple choice trivia questions based on these requirements:
      
      ${companyInfo}
      Industry: ${game.industry}
      Company description: ${game.productDescription || 'Not provided'}
      Difficulty: ${game.difficulty}
      
      ${websiteInstruction}
      
      IMPORTANT - Question Category Instructions:
      ${categoryInstructions}
      
      Return ONLY a JSON object with a "questions" array containing the questions in this exact format:
      {
        "questions": [
          {
            "questionText": "Question here?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": 0,
            "explanation": "Brief explanation of the answer"
          }
        ]
      }
      
      Make sure:
      - Follow the category instructions precisely - if "Company Facts" is selected, questions must be about the specific company; if "Industry Knowledge" is selected, questions must be about the industry in general; if "Fun Facts" is selected, questions must be entertaining industry-related trivia
      - Each question has exactly 4 options
      - correctAnswer is the index (0-3) of the correct option
      - Include a brief explanation for each answer
      - Vary the position of correct answers
      - Return valid JSON only, no additional text`;

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${deepseekApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
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

      const data = await response.json();
      logger.log('DeepSeek API response:', data);

      let generatedQuestions;

      try {
        const content = data.choices[0].message.content;
        logger.log('DeepSeek content:', content);

        // Try to parse the JSON response
        const parsed = JSON.parse(content);
        logger.log('Parsed JSON:', parsed);

        // Handle different response formats
        if (Array.isArray(parsed)) {
          generatedQuestions = parsed;
        } else if (parsed.questions && Array.isArray(parsed.questions)) {
          generatedQuestions = parsed.questions;
        } else if (parsed.question || parsed.questionText) {
          // Single question object
          generatedQuestions = [parsed];
        } else {
          throw new Error(`Unexpected response format: ${JSON.stringify(parsed)}`);
        }

        logger.log('Generated questions:', generatedQuestions);

      } catch (parseError) {
        logger.error('JSON Parse error:', parseError);
        throw new Error(`Failed to parse DeepSeek response as JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
      }

      // Validate and create questions with better error handling
      const questionsToInsert = generatedQuestions.map((q: any, index: number) => {
        // Shuffle the options to ensure random correct answer position for each question
        const { shuffled: shuffledOptions, newIndex: newCorrectAnswer } = shuffleArrayAndTrackIndex(
          q.options || q.choices || [],
          typeof q.correctAnswer === 'number' ? q.correctAnswer : (q.correct || 0)
        );

        const questionData = {
          gameId: game.id,
          questionText: q.questionText || q.question || q.text,
          options: shuffledOptions,
          correctAnswer: newCorrectAnswer,
          explanation: q.explanation || q.answer_explanation || '',
          order: index + 1,
        };

        logger.log(`Question ${index + 1}:`, questionData);
        return questionData;
      });

      // Validate each question
      const validatedQuestions = questionsToInsert.map((q: any) => insertQuestionSchema.parse(q));

      const questions = await storage.createQuestions(validatedQuestions);
      res.json(questions);
    } catch (error) {
      logger.error('Question generation error:', error);
      res.status(500).json({
        message: "Failed to generate questions",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Generate a single question using DeepSeek API (returns question data without saving to database)
  app.post("/api/games/:id/generate-single-question", async (req, res) => {
    try {
      const game = await storage.getGame(req.params.id);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      // Use existing questions from request body to avoid database query
      const existingQuestions = req.body.existingQuestions || [];
      logger.log(`Received ${existingQuestions.length} existing questions for duplicate checking`);

      // Call DeepSeek API to generate a single question
      const deepseekApiKey = process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY;
      if (!deepseekApiKey) {
        return res.status(500).json({ message: "DeepSeek API key not configured" });
      }

      // Determine if company name contains a website URL
      const isWebsite = game.companyName.includes('.') && (game.companyName.startsWith('http') || game.companyName.includes('.com') || game.companyName.includes('.org') || game.companyName.includes('.net'));
      const companyInfo = isWebsite ? `Company website: ${game.companyName}` : `Company name: ${game.companyName}`;
      const websiteInstruction = isWebsite ? 'IMPORTANT: If a website is provided, use your knowledge about that company from the web to create more accurate and specific questions about their business, products, services, and history.' : '';

      // Create category-specific instructions
      const categoryInstructions = game.categories.map(category => {
        switch (category) {
          case "Company Facts":
            return `Create a question specifically about ${game.companyName} and their business practices, history, products, or services. ${isWebsite ? 'Use information from the provided website to create accurate company-specific questions.' : ''}`;
          case "Industry Knowledge":
            return `Create a question about the ${game.industry} industry in general, including trends, terminology, best practices, key players, innovations, and industry-specific knowledge.`;
          case "Fun Facts":
            return `Create an entertaining trivia question with fun or historical facts about the ${game.industry} industry, interesting stories, lesser-known facts, or amusing industry-related trivia.`;
          case "General Knowledge":
            return `Create a general knowledge question that any visitor might enjoy answering, not specifically related to the company or industry.`;
          default:
            return `Create a question about: ${category} (related to ${game.industry} industry context)`;
        }
      }).join(" ");

      const prompt = `Generate exactly ONE multiple choice trivia question based on these requirements:
      
      ${companyInfo}
      Industry: ${game.industry}
      Company description: ${game.productDescription || 'Not provided'}
      Difficulty: ${game.difficulty}
      
      ${websiteInstruction}
      
      IMPORTANT - Question Category Instructions:
      ${categoryInstructions}
      
      CRITICAL - UNIQUENESS REQUIREMENT:
      This question must be completely unique and not duplicate any existing questions for this game.
      Avoid repeating similar question structures, topics, or phrasing from previous questions.
      
      Return ONLY a JSON object with a single question in this exact format:
      {
        "questionText": "Question here?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 0,
        "explanation": "Brief explanation of the answer"
      }
      
      Make sure:
      - Follow the category instructions precisely
      - The question has exactly 4 options
      - correctAnswer is the index (0-3) of the correct option
      - Include a brief explanation for the answer
      - Ensure the question is completely unique and not similar to existing content
      - Return valid JSON only, no additional text`;

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${deepseekApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
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

      const data = await response.json();
      logger.log('DeepSeek API response:', data);

      let generatedQuestion;

      try {
        const content = data.choices[0].message.content;
        logger.log('DeepSeek content:', content);

        // Try to parse the JSON response
        const parsed = JSON.parse(content);
        logger.log('Parsed JSON:', parsed);

        // Handle different response formats
        if (parsed.questionText && parsed.options) {
          generatedQuestion = parsed;
        } else if (parsed.question || parsed.text) {
          // Handle alternative formats
          generatedQuestion = {
            questionText: parsed.questionText || parsed.question || parsed.text,
            options: parsed.options || parsed.choices || [],
            correctAnswer: typeof parsed.correctAnswer === 'number' ? parsed.correctAnswer : (parsed.correct || 0),
            explanation: parsed.explanation || parsed.answer_explanation || '',
          };
        } else {
          throw new Error(`Unexpected response format: ${JSON.stringify(parsed)}`);
        }

        logger.log('Generated question:', generatedQuestion);

      } catch (parseError) {
        logger.error('JSON Parse error:', parseError);
        throw new Error(`Failed to parse DeepSeek response as JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
      }

      // Validate the question structure
      if (!generatedQuestion.questionText || !Array.isArray(generatedQuestion.options) || generatedQuestion.options.length !== 4) {
        throw new Error('Invalid question format received from AI');
      }

      // Shuffle the options to ensure random correct answer position
      const { shuffled: shuffledOptions, newIndex: newCorrectAnswer } = shuffleArrayAndTrackIndex(
        generatedQuestion.options,
        generatedQuestion.correctAnswer
      );

      const randomizedQuestion = {
        ...generatedQuestion,
        options: shuffledOptions,
        correctAnswer: newCorrectAnswer
      };

      logger.log('Randomized question:', randomizedQuestion);

      // Check for duplicates against existing questions
      if (isQuestionDuplicate(randomizedQuestion.questionText, existingQuestions)) {
        logger.warn('Duplicate question detected:', randomizedQuestion.questionText);
        return res.status(409).json({
          message: "Generated question is too similar to existing questions",
          error: "Please try generating again to get a unique question"
        });
      }

      logger.log('Question is unique, returning generated question');
      res.json(randomizedQuestion);
    } catch (error) {
      logger.error('Single question generation error:', error);
      res.status(500).json({
        message: "Failed to generate question",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Get questions for a game (with caching)
  app.get("/api/games/:id/questions", async (req, res) => {
    try {
      const gameId = req.params.id;
      const questions = await withCache(
        questionsCache,
        cacheKeys.questions(gameId),
        () => storage.getQuestionsByGameId(gameId),
        1 * 60 * 1000 // 1 minute TTL for questions (shorter since they change more frequently)
      );
      res.json(questions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get questions", error: error instanceof Error ? error.message : String(error) });
    }
  });


  // Update a question (Firebase auth)
  app.put("/api/user/questions/:id", verifyFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const questionId = req.params.id;
      const updates = req.body;

      // Validate the updates
      const allowedFields = ['questionText', 'options', 'correctAnswer', 'explanation'];
      const filteredUpdates = Object.keys(updates)
        .filter(key => allowedFields.includes(key))
        .reduce((obj: any, key) => {
          obj[key] = updates[key];
          return obj;
        }, {});

      const updatedQuestion = await storage.updateQuestionByUser(questionId, filteredUpdates, req.user.uid);
      res.json(updatedQuestion);
    } catch (error) {
      logger.error('Question update error:', error);
      if (error instanceof Error && error.message.includes("Unauthorized")) {
        res.status(403).json({ message: "Access denied. Only the game creator can edit questions." });
      } else if (error instanceof Error && error.message.includes("not found")) {
        res.status(404).json({ message: "Question not found" });
      } else {
        res.status(500).json({ message: "Failed to update question" });
      }
    }
  });

  // Delete a question (Firebase auth)
  app.delete("/api/user/questions/:id", verifyFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const questionId = req.params.id;
      await storage.deleteQuestionByUser(questionId, req.user.uid);
      res.json({ message: "Question deleted successfully" });
    } catch (error) {
      logger.error('Question delete error:', error);
      if (error instanceof Error && error.message.includes("Unauthorized")) {
        res.status(403).json({ message: "Access denied. Only the game creator can delete questions." });
      } else if (error instanceof Error && error.message.includes("not found")) {
        res.status(404).json({ message: "Question not found" });
      } else {
        res.status(500).json({ message: "Failed to delete question" });
      }
    }
  });


  // Submit player score
  app.post("/api/games/:id/players", async (req, res) => {
    try {
      const playerData = insertPlayerSchema.parse({
        ...req.body,
        gameId: req.params.id
      });
      const player = await storage.createPlayer(playerData);
      res.json(player);
    } catch (error) {
      res.status(400).json({ message: "Invalid player data", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Get leaderboard for a specific game (with caching)
  app.get("/api/games/:id/leaderboard", async (req, res) => {
    try {
      const gameId = req.params.id;
      const leaderboard = await withCache(
        leaderboardCache,
        cacheKeys.leaderboard(gameId),
        () => storage.getLeaderboardByGameId(gameId),
        30 * 1000 // 30 seconds TTL for leaderboard (frequently updated)
      );
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to get leaderboard", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Get global leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getAllLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to get global leaderboard", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Get players for a specific game (creator key authentication)
  app.get("/api/games/:id/players", async (req, res) => {
    try {
      const gameId = req.params.id;
      const creatorKey = req.headers['x-creator-key'] as string;

      if (!creatorKey) {
        return res.status(401).json({ message: "Creator key required" });
      }

      const players = await storage.getAllPlayersForGame(gameId, creatorKey);
      res.json(players);
    } catch (error) {
      logger.error('Get players error:', error);
      if (error instanceof Error && error.message.includes("Unauthorized")) {
        res.status(403).json({ message: "Access denied. Only the game creator can view submissions." });
      } else if (error instanceof Error && error.message.includes("not found")) {
        res.status(404).json({ message: "Game not found" });
      } else {
        res.status(500).json({ message: "Failed to get players", error: error instanceof Error ? error.message : String(error) });
      }
    }
  });


  // Add single question to game (authenticated users only)
  app.post("/api/games/:id/add-question", verifyFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const gameId = req.params.id;
      const questionData = req.body;

      // Validate required fields
      if (!questionData.questionText || !questionData.options || questionData.correctAnswer === undefined) {
        return res.status(400).json({ message: "Missing required fields: questionText, options, correctAnswer" });
      }

      if (!Array.isArray(questionData.options) || questionData.options.length !== 4) {
        return res.status(400).json({ message: "Options must be an array of exactly 4 strings" });
      }

      if (questionData.correctAnswer < 0 || questionData.correctAnswer > 3) {
        return res.status(400).json({ message: "Correct answer must be between 0 and 3" });
      }

      const question = await storage.addQuestionToGame(gameId, questionData, req.user.uid);
      res.json(question);
    } catch (error) {
      logger.error('Add question error:', error);
      if (error instanceof Error && error.message.includes("Unauthorized")) {
        res.status(403).json({ message: "Access denied. Only the game creator can add questions." });
      } else if (error instanceof Error && error.message.includes("not found")) {
        res.status(404).json({ message: "Game not found" });
      } else {
        res.status(500).json({ message: "Failed to add question" });
      }
    }
  });

  // Update game prizes (authenticated users only)
  app.put("/api/games/:id/prizes", verifyFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const gameId = req.params.id;
      const { prizes } = req.body;

      // Validate prizes data
      if (!Array.isArray(prizes)) {
        return res.status(400).json({ message: "Prizes must be an array" });
      }

      // Validate each prize has required fields
      for (const prize of prizes) {
        if (!prize.placement || !prize.prize) {
          return res.status(400).json({ message: "Each prize must have placement and prize fields" });
        }
      }

      const updatedGame = await storage.updateGamePrizes(gameId, prizes, req.user.uid);
      res.json(updatedGame);
    } catch (error) {
      logger.error('Update prizes error:', error);
      if (error instanceof Error && error.message.includes("Unauthorized")) {
        res.status(403).json({ message: "Access denied. Only the game creator can edit prizes." });
      } else if (error instanceof Error && error.message.includes("not found")) {
        res.status(404).json({ message: "Game not found" });
      } else {
        res.status(500).json({ message: "Failed to update prizes" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
