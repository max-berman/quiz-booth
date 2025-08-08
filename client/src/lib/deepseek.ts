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
