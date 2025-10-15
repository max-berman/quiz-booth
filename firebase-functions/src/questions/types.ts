import { Question } from '@shared/firebase-types';

/**
 * Interface for LLM Provider implementations
 */
export interface LLMProvider {
  name: string;
  isAvailable(): boolean;
  generateQuestions(prompt: string, batchSize: number): Promise<any[]>;
  generateSingleQuestion(prompt: string): Promise<any>;
  generatePlainText(prompt: string): Promise<string>;
}

/**
 * Question generation result
 */
export interface QuestionGenerationResult {
  questions: Question[];
  llmProvider: string;
}

/**
 * Batch generation context
 */
export interface BatchGenerationContext {
  batchIndex: number;
  totalBatches: number;
  batchSize: number;
  gameId: string;
  gameData: any;
}

/**
 * Error handling result
 */
export interface ErrorHandlingResult {
  userMessage: string;
  shouldRetry: boolean;
  errorType: string;
  fallbackPossible: boolean;
}
