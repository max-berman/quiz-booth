import { type Game, type InsertGame, type Question, type InsertQuestion, type Player, type InsertPlayer, type PrizePlacement } from "@shared/firebase-types";
import { randomUUID } from "crypto";
import { db, collections } from "./firebase";
import { Timestamp } from 'firebase-admin/firestore';

export interface IStorage {
  // Game methods
  createGame(game: InsertGame, userId?: string): Promise<Game>;
  getGame(id: string): Promise<Game | undefined>;
  verifyGameAccess(gameId: string, creatorKey: string): Promise<boolean>;
  verifyGameAccessByUser(gameId: string, userId: string): Promise<boolean>;
  getGamesByCreator(creatorKey: string): Promise<Game[]>;
  getGamesByUser(userId: string): Promise<Game[]>;
  updateGamePrizes(gameId: string, prizes: PrizePlacement[], userId: string): Promise<Game>;

  // Question methods
  createQuestions(questions: InsertQuestion[]): Promise<Question[]>;
  addQuestionToGame(gameId: string, questionData: Omit<InsertQuestion, 'gameId'>, userId: string): Promise<Question>;
  getQuestionsByGameId(gameId: string): Promise<Question[]>;
  updateQuestion(id: string, updates: Partial<Question>, creatorKey: string): Promise<Question>;
  updateQuestionByUser(id: string, updates: Partial<Question>, userId: string): Promise<Question>;
  deleteQuestionByUser(id: string, userId: string): Promise<void>;
  getQuestion(id: string): Promise<Question | undefined>;

  // Player methods
  createPlayer(player: InsertPlayer): Promise<Player>;
  getPlayersByGameId(gameId: string): Promise<Player[]>;
  getLeaderboardByGameId(gameId: string): Promise<Player[]>;
  getAllLeaderboard(): Promise<Player[]>;
  getAllPlayersForGame(gameId: string, creatorKey?: string): Promise<Player[]>;
  getAllPlayersForGameByUser(gameId: string, userId: string): Promise<Player[]>;
}

export class FirebaseStorage implements IStorage {
  async createGame(insertGame: InsertGame, userId?: string): Promise<Game> {
    try {
      const id = randomUUID();
      const creatorKey = randomUUID(); // Generate a unique access key
      const now = new Date();
      const gameData: any = {
        id,
        companyName: insertGame.companyName,
        industry: insertGame.industry,
        productDescription: insertGame.productDescription || null,
        questionCount: insertGame.questionCount,
        difficulty: insertGame.difficulty,
        categories: insertGame.categories,
        firstPrize: insertGame.firstPrize || null,
        secondPrize: insertGame.secondPrize || null,
        thirdPrize: insertGame.thirdPrize || null,
        prizes: insertGame.prizes || null,
        creatorKey,
        createdAt: Timestamp.fromDate(now),
        modifiedAt: Timestamp.fromDate(now), // Set modifiedAt to creation time initially
      };

      // Only add userId if it exists (avoid undefined fields in Firestore)
      if (userId) {
        gameData.userId = userId;
      }

      const game: Game = {
        id: gameData.id,
        companyName: gameData.companyName,
        industry: gameData.industry,
        productDescription: gameData.productDescription,
        questionCount: gameData.questionCount,
        difficulty: gameData.difficulty,
        categories: gameData.categories,
        firstPrize: gameData.firstPrize,
        secondPrize: gameData.secondPrize,
        thirdPrize: gameData.thirdPrize,
        prizes: gameData.prizes || null,
        creatorKey: gameData.creatorKey,
        userId: gameData.userId,
        createdAt: now, // For the returned object, use JS Date
        modifiedAt: now, // Set modifiedAt to creation time initially
      };

      console.log('Creating game in Firebase:', JSON.stringify(gameData, null, 2));
      console.log('Game data keys:', Object.keys(gameData));
      console.log('Game data types:', Object.keys(gameData).map(key => `${key}: ${typeof gameData[key as keyof typeof gameData]}`));
      await db.collection(collections.games).doc(id).set(gameData);
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

  async verifyGameAccessByUser(gameId: string, userId: string): Promise<boolean> {
    const gameDoc = await db.collection(collections.games).doc(gameId).get();
    if (!gameDoc.exists) return false;
    const game = gameDoc.data() as Game;
    return game.userId === userId;
  }

  async getGamesByCreator(creatorKey: string): Promise<Game[]> {
    const gamesSnapshot = await db
      .collection(collections.games)
      .where('creatorKey', '==', creatorKey)
      .get();

    const games = gamesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
        modifiedAt: data.modifiedAt?.toDate ? data.modifiedAt.toDate() : new Date(data.modifiedAt || data.createdAt),
      } as Game;
    });

    // Sort by creation date (newest first)
    return games.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getGamesByUser(userId: string): Promise<Game[]> {
    const gamesSnapshot = await db
      .collection(collections.games)
      .where('userId', '==', userId)
      .get();

    const games = gamesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
        modifiedAt: data.modifiedAt?.toDate ? data.modifiedAt.toDate() : new Date(data.modifiedAt || data.createdAt),
      } as Game;
    });

    // Sort by creation date (newest first)
    return games.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getGame(id: string): Promise<Game | undefined> {
    const gameDoc = await db.collection(collections.games).doc(id).get();
    if (!gameDoc.exists) return undefined;
    const data = gameDoc.data();
    if (!data) return undefined;

    // Convert Firestore Timestamp to JavaScript Date
    return {
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
      modifiedAt: data.modifiedAt?.toDate ? data.modifiedAt.toDate() : new Date(data.modifiedAt || data.createdAt),
    } as Game;
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
    const now = new Date();
    const playerData = {
      id,
      ...insertPlayer,
      company: insertPlayer.company || null,
      completedAt: Timestamp.fromDate(now),
    };

    await db.collection(collections.players).doc(id).set(playerData);

    return {
      ...playerData,
      completedAt: now, // Return JS Date for the response
    } as Player;
  }

  async getPlayersByGameId(gameId: string): Promise<Player[]> {
    const playersSnapshot = await db
      .collection(collections.players)
      .where('gameId', '==', gameId)
      .get();

    return playersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        completedAt: data.completedAt?.toDate ? data.completedAt.toDate() : new Date(data.completedAt),
      } as Player;
    });
  }

  async getLeaderboardByGameId(gameId: string): Promise<Player[]> {
    const playersSnapshot = await db
      .collection(collections.players)
      .where('gameId', '==', gameId)
      .get();

    const players = playersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        completedAt: data.completedAt?.toDate ? data.completedAt.toDate() : new Date(data.completedAt),
      } as Player;
    });

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

    const players = playersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        completedAt: data.completedAt?.toDate ? data.completedAt.toDate() : new Date(data.completedAt),
      } as Player;
    });

    // Sort by score (desc) and then timeSpent (asc) in memory
    return players.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score; // Higher score first
      }
      return a.timeSpent - b.timeSpent; // Lower time first (faster completion)
    });
  }

  async updateQuestionByUser(id: string, updates: Partial<Question>, userId: string): Promise<Question> {
    // First verify the user owns the game that this question belongs to
    const question = await this.getQuestion(id);
    if (!question) {
      throw new Error("Question not found");
    }

    const hasAccess = await this.verifyGameAccessByUser(question.gameId, userId);
    if (!hasAccess) {
      throw new Error("Unauthorized access to question");
    }

    const updatedQuestion = {
      ...question,
      ...updates,
      id, // Ensure ID cannot be changed
      gameId: question.gameId, // Ensure gameId cannot be changed
    };

    // Update game's modifiedAt timestamp
    const now = new Date();
    await db.collection(collections.games).doc(question.gameId).update({
      modifiedAt: Timestamp.fromDate(now)
    });

    await db.collection(collections.questions).doc(id).update(updates);
    return updatedQuestion;
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

    const players = playersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        completedAt: data.completedAt?.toDate ? data.completedAt.toDate() : new Date(data.completedAt),
      } as Player;
    });

    // Sort by completedAt (desc) in memory
    return players.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
  }

  async getAllPlayersForGameByUser(gameId: string, userId: string): Promise<Player[]> {
    // Only return data if user owns the game
    const hasAccess = await this.verifyGameAccessByUser(gameId, userId);
    if (!hasAccess) {
      throw new Error("Unauthorized access to game submissions");
    }

    const playersSnapshot = await db
      .collection(collections.players)
      .where('gameId', '==', gameId)
      .get();

    const players = playersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        completedAt: data.completedAt?.toDate ? data.completedAt.toDate() : new Date(data.completedAt),
      } as Player;
    });

    // Sort by completedAt (desc) in memory
    return players.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
  }

  async addQuestionToGame(gameId: string, questionData: Omit<InsertQuestion, 'gameId'>, userId: string): Promise<Question> {
    // Verify user owns the game
    const hasAccess = await this.verifyGameAccessByUser(gameId, userId);
    if (!hasAccess) {
      throw new Error('Unauthorized: Only the game creator can add questions');
    }

    // Get existing questions to determine order
    const existingQuestions = await this.getQuestionsByGameId(gameId);
    const maxOrder = Math.max(0, ...existingQuestions.map(q => q.order || 0));

    const id = randomUUID();
    const question: Question = {
      id,
      gameId,
      questionText: questionData.questionText,
      options: questionData.options,
      correctAnswer: questionData.correctAnswer,
      explanation: questionData.explanation || null,
      order: maxOrder + 1,
    };

    // Update game's modifiedAt timestamp
    const now = new Date();
    await db.collection(collections.games).doc(gameId).update({
      modifiedAt: Timestamp.fromDate(now)
    });

    await db.collection(collections.questions).doc(id).set(question);
    return question;
  }

  async deleteQuestionByUser(id: string, userId: string): Promise<void> {
    // First verify the user owns the game that this question belongs to
    const question = await this.getQuestion(id);
    if (!question) {
      throw new Error("Question not found");
    }

    const hasAccess = await this.verifyGameAccessByUser(question.gameId, userId);
    if (!hasAccess) {
      throw new Error("Unauthorized access to delete question");
    }

    // Update game's modifiedAt timestamp
    const now = new Date();
    await db.collection(collections.games).doc(question.gameId).update({
      modifiedAt: Timestamp.fromDate(now)
    });

    // Delete the question from Firestore
    await db.collection(collections.questions).doc(id).delete();
  }

  async updateGamePrizes(gameId: string, prizes: PrizePlacement[], userId: string): Promise<Game> {
    // Verify user owns the game
    const hasAccess = await this.verifyGameAccessByUser(gameId, userId);
    if (!hasAccess) {
      throw new Error('Unauthorized: Only the game creator can update prizes');
    }

    // Get the current game
    const game = await this.getGame(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    // Update prizes in Firestore
    await db.collection(collections.games).doc(gameId).update({
      prizes: prizes
    });

    // Return updated game
    return {
      ...game,
      prizes: prizes
    };
  }
}

export const storage = new FirebaseStorage();
