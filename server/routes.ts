import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGameSchema, insertQuestionSchema, insertPlayerSchema } from "@shared/firebase-types";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a new game
  app.post("/api/games", async (req, res) => {
    try {
      const gameData = insertGameSchema.parse(req.body);
      const game = await storage.createGame(gameData);
      res.json(game);
    } catch (error) {
      res.status(400).json({ message: "Invalid game data", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Get game by ID
  app.get("/api/games/:id", async (req, res) => {
    try {
      const game = await storage.getGame(req.params.id);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.json(game);
    } catch (error) {
      res.status(500).json({ message: "Failed to get game", error: error instanceof Error ? error.message : String(error) });
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

      // Create category-specific instructions
      const categoryInstructions = game.categories.map(category => {
        switch (category) {
          case "Company Facts":
            return `Create questions specifically about ${game.companyName} and their business practices, history, products, or services.`;
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
      
      Company: ${game.companyName}
      Industry: ${game.industry}
      Company description: ${game.productDescription || 'Not provided'}
      Difficulty: ${game.difficulty}
      
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
      console.log('DeepSeek API response:', JSON.stringify(data, null, 2));
      
      let generatedQuestions;

      try {
        const content = data.choices[0].message.content;
        console.log('DeepSeek content:', content);
        
        // Try to parse the JSON response
        const parsed = JSON.parse(content);
        console.log('Parsed JSON:', JSON.stringify(parsed, null, 2));
        
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
        
        console.log('Generated questions:', JSON.stringify(generatedQuestions, null, 2));
        
      } catch (parseError) {
        console.error('JSON Parse error:', parseError);
        throw new Error(`Failed to parse DeepSeek response as JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
      }

      // Validate and create questions with better error handling
      const questionsToInsert = generatedQuestions.map((q: any, index: number) => {
        const questionData = {
          gameId: game.id,
          questionText: q.questionText || q.question || q.text,
          options: q.options || q.choices || [],
          correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : (q.correct || 0),
          explanation: q.explanation || q.answer_explanation || '',
          order: index + 1,
        };
        
        console.log(`Question ${index + 1}:`, JSON.stringify(questionData, null, 2));
        return questionData;
      });

      // Validate each question
      const validatedQuestions = questionsToInsert.map((q: any) => insertQuestionSchema.parse(q));
      
      const questions = await storage.createQuestions(validatedQuestions);
      res.json(questions);
    } catch (error) {
      console.error('Question generation error:', error);
      res.status(500).json({ 
        message: "Failed to generate questions", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Get questions for a game
  app.get("/api/games/:id/questions", async (req, res) => {
    try {
      const questions = await storage.getQuestionsByGameId(req.params.id);
      res.json(questions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get questions", error: error instanceof Error ? error.message : String(error) });
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

  // Get leaderboard for a specific game
  app.get("/api/games/:id/leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboardByGameId(req.params.id);
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

  // Get all players for a game (raw submissions data) - requires creator key
  app.get("/api/games/:id/players", async (req, res) => {
    try {
      const creatorKey = req.headers['x-creator-key'] as string;
      
      if (!creatorKey) {
        return res.status(401).json({ message: "Creator key required for submissions data" });
      }
      
      const players = await storage.getAllPlayersForGame(req.params.id, creatorKey);
      res.json(players);
    } catch (error) {
      console.error('Players fetch error:', error);
      if (error instanceof Error && error.message.includes("Unauthorized")) {
        res.status(403).json({ message: "Access denied. Only the game creator can view submissions." });
      } else {
        res.status(500).json({ message: "Failed to get players" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
