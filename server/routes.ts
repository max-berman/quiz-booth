import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGameSchema, insertQuestionSchema, insertPlayerSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a new game
  app.post("/api/games", async (req, res) => {
    try {
      const gameData = insertGameSchema.parse(req.body);
      const game = await storage.createGame(gameData);
      res.json(game);
    } catch (error) {
      res.status(400).json({ message: "Invalid game data", error: error.message });
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
      res.status(500).json({ message: "Failed to get game", error: error.message });
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

      const prompt = `Generate ${game.questionCount} multiple choice trivia questions about ${game.companyName} in the ${game.industry} industry. 
      Company description: ${game.productDescription || 'Not provided'}
      Difficulty: ${game.difficulty}
      Categories: ${game.categories.join(', ')}
      
      Return ONLY a JSON array with this exact format:
      [
        {
          "questionText": "Question here?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 0,
          "explanation": "Brief explanation of the answer"
        }
      ]
      
      Make sure:
      - Questions are relevant to the company/industry
      - Each question has exactly 4 options
      - correctAnswer is the index (0-3) of the correct option
      - Include a brief explanation for each answer
      - Vary the position of correct answers`;

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
      let generatedQuestions;

      try {
        const content = data.choices[0].message.content;
        // Try to parse the JSON response
        const parsed = JSON.parse(content);
        generatedQuestions = Array.isArray(parsed) ? parsed : parsed.questions || [parsed];
      } catch (parseError) {
        throw new Error("Failed to parse DeepSeek response as JSON");
      }

      // Validate and create questions
      const questionsToInsert = generatedQuestions.map((q: any, index: number) => ({
        gameId: game.id,
        questionText: q.questionText || q.question,
        options: q.options || [],
        correctAnswer: q.correctAnswer || 0,
        explanation: q.explanation || '',
        order: index + 1,
      }));

      // Validate each question
      const validatedQuestions = questionsToInsert.map(q => insertQuestionSchema.parse(q));
      
      const questions = await storage.createQuestions(validatedQuestions);
      res.json(questions);
    } catch (error) {
      console.error('Question generation error:', error);
      res.status(500).json({ 
        message: "Failed to generate questions", 
        error: error.message 
      });
    }
  });

  // Get questions for a game
  app.get("/api/games/:id/questions", async (req, res) => {
    try {
      const questions = await storage.getQuestionsByGameId(req.params.id);
      res.json(questions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get questions", error: error.message });
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
      res.status(400).json({ message: "Invalid player data", error: error.message });
    }
  });

  // Get leaderboard for a specific game
  app.get("/api/games/:id/leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboardByGameId(req.params.id);
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to get leaderboard", error: error.message });
    }
  });

  // Get global leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getAllLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to get global leaderboard", error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
