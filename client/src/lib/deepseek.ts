import { apiRequest } from "./queryClient";

export interface TriviaQuestion {
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export async function generateQuestions(gameId: string): Promise<TriviaQuestion[]> {
  const response = await apiRequest("POST", `/api/games/${gameId}/generate-questions`);
  return response.json();
}

export async function generateSingleQuestion(gameId: string, existingQuestions: any[] = []): Promise<TriviaQuestion> {
  const response = await apiRequest("POST", `/api/games/${gameId}/generate-single-question`, {
    existingQuestions
  });
  return response.json();
}
