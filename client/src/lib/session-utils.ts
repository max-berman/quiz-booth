/**
 * Game session management utilities for persisting game state
 */

export interface GameSessionState {
  sessionId: string;
  gameId: string;
  currentQuestionIndex: number;
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  streak: number;
  totalTime: number;
  answeredQuestions: number[]; // Track which questions were answered
  selectedAnswers: Record<number, number>; // questionIndex -> selectedAnswer
  startTime: number;
  lastUpdated: number;
  isCompleted?: boolean;
  questionStartTimes: Record<number, number>; // questionIndex -> start timestamp
  currentQuestionTimeLeft?: number; // Time left for current question when session was saved
}

export interface GameSessionData {
  state: GameSessionState;
  expiresAt: number; // Timestamp when session expires
}

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get session key for localStorage
 */
export function getSessionKey(gameId: string): string {
  return `quizbooth_game_session_${gameId}`;
}

/**
 * Save game session to localStorage
 */
export function saveGameSession(gameId: string, state: GameSessionState): void {
  const sessionKey = getSessionKey(gameId);
  const sessionData: GameSessionData = {
    state,
    expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours from now
  };

  try {
    localStorage.setItem(sessionKey, JSON.stringify(sessionData));
  } catch (error) {
    console.error('Failed to save game session:', error);
  }
}

/**
 * Load game session from localStorage
 */
export function loadGameSession(gameId: string): GameSessionState | null {
  const sessionKey = getSessionKey(gameId);

  try {
    const stored = localStorage.getItem(sessionKey);
    if (!stored) return null;

    const sessionData: GameSessionData = JSON.parse(stored);

    // Check if session has expired
    if (Date.now() > sessionData.expiresAt) {
      clearGameSession(gameId);
      return null;
    }

    return sessionData.state;
  } catch (error) {
    console.error('Failed to load game session:', error);
    clearGameSession(gameId);
    return null;
  }
}

/**
 * Clear game session from localStorage
 */
export function clearGameSession(gameId: string): void {
  const sessionKey = getSessionKey(gameId);
  try {
    localStorage.removeItem(sessionKey);
  } catch (error) {
    console.error('Failed to clear game session:', error);
  }
}

/**
 * Check if a valid session exists for a game
 */
export function hasValidSession(gameId: string): boolean {
  return loadGameSession(gameId) !== null;
}

/**
 * Create initial session state
 */
export function createInitialSessionState(gameId: string): GameSessionState {
  return {
    sessionId: generateSessionId(),
    gameId,
    currentQuestionIndex: 0,
    score: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    streak: 0,
    totalTime: 0,
    answeredQuestions: [],
    selectedAnswers: {},
    questionStartTimes: {},
    startTime: Date.now(),
    lastUpdated: Date.now(),
    isCompleted: false,
  };
}
