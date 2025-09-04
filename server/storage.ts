import { type Game, type InsertGame, type Question, type InsertQuestion, type Player, type InsertPlayer } from "@shared/firebase-types";
import { randomUUID } from "crypto";
import { db, collections } from "./firebase";

export interface IStorage {
  // Game methods
  createGame(game: InsertGame): Promise<Game>;
  getGame(id: string): Promise<Game | undefined>;
  verifyGameAccess(gameId: string, creatorKey: string): Promise<boolean>;
  
  // Question methods
  createQuestions(questions: InsertQuestion[]): Promise<Question[]>;
  getQuestionsByGameId(gameId: string): Promise<Question[]>;
  updateQuestion(id: string, updates: Partial<Question>, creatorKey: string): Promise<Question>;
  getQuestion(id: string): Promise<Question | undefined>;
  
  // Player methods
  createPlayer(player: InsertPlayer): Promise<Player>;
  getPlayersByGameId(gameId: string): Promise<Player[]>;
  getLeaderboardByGameId(gameId: string): Promise<Player[]>;
  getAllLeaderboard(): Promise<Player[]>;
  getAllPlayersForGame(gameId: string, creatorKey?: string): Promise<Player[]>;
}

export class FirebaseStorage implements IStorage {
  async createGame(insertGame: InsertGame): Promise<Game> {
    try {
      const id = randomUUID();
      const creatorKey = randomUUID(); // Generate a unique access key
      const game: Game = {
        id,
        ...insertGame,
        productDescription: insertGame.productDescription || null,
        firstPrize: insertGame.firstPrize || null,
        secondPrize: insertGame.secondPrize || null,
        thirdPrize: insertGame.thirdPrize || null,
        creatorKey,
        createdAt: new Date(),
      };
      
      console.log('Creating game in Firebase:', JSON.stringify(game, null, 2));
      await db.collection(collections.games).doc(id).set(game);
      console.log('Game created successfully in Firebase');
      return game;
    } catch (error) {
      console.error('Firebase createGame error:', error);
      throw error;
    }
  }

  async verifyGameAccess(gameId: string, creatorKey: string): Promise<boolean> {
    const gameDoc = await db.collection(collections.games).doc(gameId).get();
    if (!gameDoc.exists) return false;
    const game = gameDoc.data() as Game;
    return game.creatorKey === creatorKey;
  }

  async getGame(id: string): Promise<Game | undefined> {
    const gameDoc = await db.collection(collections.games).doc(id).get();
    if (!gameDoc.exists) return undefined;
    return gameDoc.data() as Game;
  }

  async createQuestions(insertQuestions: InsertQuestion[]): Promise<Question[]> {
    const batch = db.batch();
    const questions: Question[] = [];
    
    for (const insertQuestion of insertQuestions) {
      const id = randomUUID();
      const question: Question = {
        id,
        ...insertQuestion,
        explanation: insertQuestion.explanation || null,
      };
      
      const questionRef = db.collection(collections.questions).doc(id);
      batch.set(questionRef, question);
      questions.push(question);
    }
    
    await batch.commit();
    return questions;
  }

  async getQuestionsByGameId(gameId: string): Promise<Question[]> {
    const questionsSnapshot = await db
      .collection(collections.questions)
      .where('gameId', '==', gameId)
      .get();
    
    const questions = questionsSnapshot.docs.map(doc => doc.data() as Question);
    
    // Sort by order in memory to avoid needing a composite index
    return questions.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  async getQuestion(id: string): Promise<Question | undefined> {
    const questionDoc = await db.collection(collections.questions).doc(id).get();
    if (!questionDoc.exists) return undefined;
    return questionDoc.data() as Question;
  }

  async updateQuestion(id: string, updates: Partial<Question>, creatorKey: string): Promise<Question> {
    // First verify that the user has access to edit this question
    const question = await this.getQuestion(id);
    if (!question) {
      throw new Error("Question not found");
    }
    
    // Verify game access using creator key
    const hasAccess = await this.verifyGameAccess(question.gameId, creatorKey);
    if (!hasAccess) {
      throw new Error("Unauthorized access to edit this question");
    }
    
    // Update the question
    const updatedQuestion: Question = {
      ...question,
      ...updates,
      id, // Ensure ID cannot be changed
      gameId: question.gameId, // Ensure gameId cannot be changed
    };
    
    await db.collection(collections.questions).doc(id).update(updates);
    return updatedQuestion;
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = randomUUID();
    const player: Player = {
      id,
      ...insertPlayer,
      company: insertPlayer.company || null,
      completedAt: new Date(),
    };
    
    await db.collection(collections.players).doc(id).set(player);
    return player;
  }

  async getPlayersByGameId(gameId: string): Promise<Player[]> {
    const playersSnapshot = await db
      .collection(collections.players)
      .where('gameId', '==', gameId)
      .get();
    
    return playersSnapshot.docs.map(doc => doc.data() as Player);
  }

  async getLeaderboardByGameId(gameId: string): Promise<Player[]> {
    const playersSnapshot = await db
      .collection(collections.players)
      .where('gameId', '==', gameId)
      .get();
    
    const players = playersSnapshot.docs.map(doc => doc.data() as Player);
    
    // Sort by score (desc) and then timeSpent (asc) in memory
    return players.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score; // Higher score first
      }
      return a.timeSpent - b.timeSpent; // Lower time first (faster completion)
    });
  }

  async getAllLeaderboard(): Promise<Player[]> {
    const playersSnapshot = await db
      .collection(collections.players)
      .get();
    
    const players = playersSnapshot.docs.map(doc => doc.data() as Player);
    
    // Sort by score (desc) and then timeSpent (asc) in memory
    return players.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score; // Higher score first
      }
      return a.timeSpent - b.timeSpent; // Lower time first (faster completion)
    });
  }

  async getAllPlayersForGame(gameId: string, creatorKey?: string): Promise<Player[]> {
    // Only return data if creator key is provided and valid
    if (!creatorKey || !(await this.verifyGameAccess(gameId, creatorKey))) {
      throw new Error("Unauthorized access to game submissions");
    }
    
    const playersSnapshot = await db
      .collection(collections.players)
      .where('gameId', '==', gameId)
      .get();
    
    const players = playersSnapshot.docs.map(doc => doc.data() as Player);
    
    // Sort by completedAt (desc) in memory
    return players.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
  }
}

export const storage = new FirebaseStorage();
