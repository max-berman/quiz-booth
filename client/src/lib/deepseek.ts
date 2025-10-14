import { getFunctions, httpsCallable } from "firebase/functions";
import { auth } from "./firebase";
import app from "./firebase";

export interface TriviaQuestion {
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export async function generateQuestions(gameId: string): Promise<TriviaQuestion[]> {
  const functions = getFunctions(app);
  const generateQuestionsFunction = httpsCallable(functions, 'generateQuestions');
  const result = await generateQuestionsFunction({ gameId });
  return result.data as TriviaQuestion[];
}

export async function generateSingleQuestion(gameId: string, existingQuestions: any[] = []): Promise<TriviaQuestion> {
  const functions = getFunctions(app);
  const generateSingleQuestionFunction = httpsCallable(functions, 'generateSingleQuestion');
  const result = await generateSingleQuestionFunction({
    gameId,
    existingQuestions
  });
  return result.data as TriviaQuestion;
}
