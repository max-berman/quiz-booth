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
  
  // Player methods
  createPlayer(player: InsertPlayer): Promise<Player>;
  getPlayersByGameId(gameId: string): Promise<Player[]>;
  getLeaderboardByGameId(gameId: string): Promise<Player[]>;
  getAllLeaderboard(): Promise<Player[]>;
  getAllPlayersForGame(gameId: string, creatorKey?: string): Promise<Player[]>;
}

export class FirebaseStorage implements IStorage {
  async createGame(insertGame: InsertGame): Promise<Game> {
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
    
    await db.collection(collections.games).doc(id).set(game);
    return game;
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
      .orderBy('order', 'asc')
      .get();
    
    return questionsSnapshot.docs.map(doc => doc.data() as Question);
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
      .orderBy('score', 'desc')
      .orderBy('timeSpent', 'asc')
      .get();
    
    return playersSnapshot.docs.map(doc => doc.data() as Player);
  }

  async getAllLeaderboard(): Promise<Player[]> {
    const playersSnapshot = await db
      .collection(collections.players)
      .orderBy('score', 'desc')
      .orderBy('timeSpent', 'asc')
      .get();
    
    return playersSnapshot.docs.map(doc => doc.data() as Player);
  }

  async getAllPlayersForGame(gameId: string, creatorKey?: string): Promise<Player[]> {
    // Only return data if creator key is provided and valid
    if (!creatorKey || !(await this.verifyGameAccess(gameId, creatorKey))) {
      throw new Error("Unauthorized access to game submissions");
    }
    
    const playersSnapshot = await db
      .collection(collections.players)
      .where('gameId', '==', gameId)
      .orderBy('completedAt', 'desc')
      .get();
    
    return playersSnapshot.docs.map(doc => doc.data() as Player);
  }
}

export const storage = new FirebaseStorage();
