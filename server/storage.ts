import { type Game, type InsertGame, type Question, type InsertQuestion, type Player, type InsertPlayer, games, questions, players } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc, asc } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  async createGame(insertGame: InsertGame): Promise<Game> {
    const creatorKey = randomUUID(); // Generate a unique access key
    const [game] = await db
      .insert(games)
      .values({
        ...insertGame,
        creatorKey: creatorKey,
      } as any)
      .returning();
    return game;
  }

  async verifyGameAccess(gameId: string, creatorKey: string): Promise<boolean> {
    const [game] = await db
      .select({ creatorKey: games.creatorKey })
      .from(games)
      .where(eq(games.id, gameId))
      .limit(1);
    return game?.creatorKey === creatorKey;
  }

  async getGame(id: string): Promise<Game | undefined> {
    const [game] = await db
      .select()
      .from(games)
      .where(eq(games.id, id))
      .limit(1);
    return game || undefined;
  }

  async createQuestions(insertQuestions: InsertQuestion[]): Promise<Question[]> {
    const createdQuestions = await db
      .insert(questions)
      .values(insertQuestions as any)
      .returning();
    return createdQuestions;
  }

  async getQuestionsByGameId(gameId: string): Promise<Question[]> {
    return await db
      .select()
      .from(questions)
      .where(eq(questions.gameId, gameId))
      .orderBy(questions.order);
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const [player] = await db
      .insert(players)
      .values(insertPlayer)
      .returning();
    return player;
  }

  async getPlayersByGameId(gameId: string): Promise<Player[]> {
    return await db
      .select()
      .from(players)
      .where(eq(players.gameId, gameId));
  }

  async getLeaderboardByGameId(gameId: string): Promise<Player[]> {
    return await db
      .select()
      .from(players)
      .where(eq(players.gameId, gameId))
      .orderBy(desc(players.score), asc(players.timeSpent));
  }

  async getAllLeaderboard(): Promise<Player[]> {
    return await db
      .select()
      .from(players)
      .orderBy(desc(players.score), asc(players.timeSpent));
  }

  async getAllPlayersForGame(gameId: string, creatorKey?: string): Promise<Player[]> {
    // Only return data if creator key is provided and valid
    if (!creatorKey || !(await this.verifyGameAccess(gameId, creatorKey))) {
      throw new Error("Unauthorized access to game submissions");
    }
    
    return await db
      .select()
      .from(players)
      .where(eq(players.gameId, gameId))
      .orderBy(desc(players.completedAt));
  }
}

export const storage = new DatabaseStorage();
