import { z } from "zod";

// Firebase-compatible types (without Drizzle dependencies)
export interface PrizePlacement {
  placement: string; // e.g., "1st Place", "4th Place", "Top 10", etc.
  prize: string; // Prize description or amount
}

export interface GameCustomization {
  primaryColor: string;    // Main brand color
  secondaryColor: string;  // Accent color  
  tertiaryColor: string;   // Background/neutral color
  customLogoUrl: string;   // Uploaded logo URL
  isCustomized: boolean;   // Track if customization is applied
}

export interface Game {
  id: string;
  gameTitle: string | null; // AI-generated or user-edited game title
  companyName: string;
  industry: string;
  productDescription: string | null;
  questionCount: number;
  difficulty: string;
  categories: string[];
  firstPrize: string | null;
  secondPrize: string | null;
  thirdPrize: string | null;
  prizes: PrizePlacement[] | null; // New flexible prize system
  creatorKey: string;
  userId?: string; // Firebase UID - optional for backward compatibility
  createdAt: Date;
  modifiedAt?: Date; // Track when game was last modified
  isPublic?: boolean; // Whether the game is publicly accessible
  customization?: GameCustomization; // Game customization settings
}

export interface Question {
  id: string;
  gameId: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation: string | null;
  order: number;
}

export interface Player {
  id: string;
  name: string;
  company: string | null;
  gameId: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number; // in seconds
  completedAt: Date;
}

// Insert schemas
export const prizePlacementSchema = z.object({
  placement: z.string(),
  prize: z.string(),
});

export const insertGameSchema = z.object({
  gameTitle: z.string().optional().nullable(),
  companyName: z.string(),
  industry: z.string(),
  productDescription: z.string().optional().nullable(),
  questionCount: z.number().default(10),
  difficulty: z.string().default("easy"),
  categories: z.array(z.string()),
  firstPrize: z.string().optional().nullable(),
  secondPrize: z.string().optional().nullable(),
  thirdPrize: z.string().optional().nullable(),
  prizes: z.array(prizePlacementSchema).optional().nullable(),
});

export const insertQuestionSchema = z.object({
  gameId: z.string(),
  questionText: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.number(),
  explanation: z.string().optional().nullable(),
  order: z.number(),
});

export const insertPlayerSchema = z.object({
  name: z.string(),
  company: z.string().optional().nullable(),
  gameId: z.string(),
  score: z.number().default(0),
  correctAnswers: z.number().default(0),
  totalQuestions: z.number().default(0),
  timeSpent: z.number().default(0),
});

export type InsertGame = z.infer<typeof insertGameSchema>;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
