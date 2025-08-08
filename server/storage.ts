import { type Game, type InsertGame, type Question, type InsertQuestion, type Player, type InsertPlayer } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Game methods
  createGame(game: InsertGame): Promise<Game>;
  getGame(id: string): Promise<Game | undefined>;
  
  // Question methods
  createQuestions(questions: InsertQuestion[]): Promise<Question[]>;
  getQuestionsByGameId(gameId: string): Promise<Question[]>;
  
  // Player methods
  createPlayer(player: InsertPlayer): Promise<Player>;
  getPlayersByGameId(gameId: string): Promise<Player[]>;
  getLeaderboardByGameId(gameId: string): Promise<Player[]>;
  getAllLeaderboard(): Promise<Player[]>;
}

export class MemStorage implements IStorage {
  private games: Map<string, Game>;
  private questions: Map<string, Question>;
  private players: Map<string, Player>;

  constructor() {
    this.games = new Map();
    this.questions = new Map();
    this.players = new Map();
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
    const id = randomUUID();
    const game: Game = {
      ...insertGame,
      id,
      createdAt: new Date(),
    };
    this.games.set(id, game);
    return game;
  }

  async getGame(id: string): Promise<Game | undefined> {
    return this.games.get(id);
  }

  async createQuestions(insertQuestions: InsertQuestion[]): Promise<Question[]> {
    const questions: Question[] = [];
    
    for (const insertQuestion of insertQuestions) {
      const id = randomUUID();
      const question: Question = {
        ...insertQuestion,
        id,
      };
      this.questions.set(id, question);
      questions.push(question);
    }
    
    return questions;
  }

  async getQuestionsByGameId(gameId: string): Promise<Question[]> {
    return Array.from(this.questions.values())
      .filter(question => question.gameId === gameId)
      .sort((a, b) => a.order - b.order);
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = randomUUID();
    const player: Player = {
      ...insertPlayer,
      id,
      completedAt: new Date(),
    };
    this.players.set(id, player);
    return player;
  }

  async getPlayersByGameId(gameId: string): Promise<Player[]> {
    return Array.from(this.players.values())
      .filter(player => player.gameId === gameId);
  }

  async getLeaderboardByGameId(gameId: string): Promise<Player[]> {
    return Array.from(this.players.values())
      .filter(player => player.gameId === gameId)
      .sort((a, b) => {
        // Sort by score descending, then by time ascending (faster is better)
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return a.timeSpent - b.timeSpent;
      });
  }

  async getAllLeaderboard(): Promise<Player[]> {
    return Array.from(this.players.values())
      .sort((a, b) => {
        // Sort by score descending, then by time ascending (faster is better)
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return a.timeSpent - b.timeSpent;
      });
  }
}

export const storage = new MemStorage();
