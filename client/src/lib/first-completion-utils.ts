/**
 * First completion tracking utilities to prevent score manipulation
 * by locking the first completed score for each game
 */

export interface FirstCompletionData {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  streak: number;
  gameId: string;
  sessionId: string;
  completedAt: number;
  submissionHash: string; // Hash to detect tampering
}

/**
 * Get first completion storage key for localStorage
 */
export function getFirstCompletionKey(gameId: string): string {
  return `quizbooth_first_completion_${gameId}`;
}

/**
 * Generate a submission hash for tamper detection
 */
export function generateSubmissionHash(data: Omit<FirstCompletionData, 'submissionHash'>): string {
  const hashString = [
    data.gameId,
    data.sessionId,
    data.score.toString(),
    data.correctAnswers.toString(),
    data.totalQuestions.toString(),
    data.timeSpent.toString(),
    data.streak.toString(),
    data.completedAt.toString(),
  ].join('|');

  // Simple hash function for tamper detection
  let hash = 0;
  for (let i = 0; i < hashString.length; i++) {
    const char = hashString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return `hash_${Math.abs(hash).toString(36)}`;
}

/**
 * Check if first completion exists for a game
 */
export function hasFirstCompletion(gameId: string): boolean {
  const completionKey = getFirstCompletionKey(gameId);

  try {
    const stored = localStorage.getItem(completionKey);
    if (!stored) return false;

    const completionData: FirstCompletionData = JSON.parse(stored);

    // Verify the hash to detect tampering
    const { submissionHash, ...dataWithoutHash } = completionData;
    const expectedHash = generateSubmissionHash(dataWithoutHash);

    return submissionHash === expectedHash;
  } catch (error) {
    console.error('Failed to check first completion:', error);
    return false;
  }
}

/**
 * Get first completion data for a game
 */
export function getFirstCompletion(gameId: string): FirstCompletionData | null {
  const completionKey = getFirstCompletionKey(gameId);

  try {
    const stored = localStorage.getItem(completionKey);
    if (!stored) return null;

    const completionData: FirstCompletionData = JSON.parse(stored);

    // Verify the hash to detect tampering
    const { submissionHash, ...dataWithoutHash } = completionData;
    const expectedHash = generateSubmissionHash(dataWithoutHash);

    if (submissionHash !== expectedHash) {
      console.warn('First completion data tampering detected for game:', gameId);
      clearFirstCompletion(gameId);
      return null;
    }

    return completionData;
  } catch (error) {
    console.error('Failed to get first completion:', error);
    return null;
  }
}

/**
 * Save first completion data (can only be set once per game)
 */
export function saveFirstCompletion(data: Omit<FirstCompletionData, 'submissionHash'>): boolean {
  const completionKey = getFirstCompletionKey(data.gameId);

  try {
    // Check if first completion already exists
    if (hasFirstCompletion(data.gameId)) {
      console.warn('First completion already exists for game:', data.gameId);
      return false;
    }

    // Generate submission hash for tamper detection
    const submissionHash = generateSubmissionHash(data);
    const completionData: FirstCompletionData = {
      ...data,
      submissionHash,
    };

    // Save permanently (no expiration for first completion)
    localStorage.setItem(completionKey, JSON.stringify(completionData));

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('First completion saved:', {
        gameId: data.gameId,
        score: data.score,
        completedAt: new Date(data.completedAt).toISOString(),
      });
    }

    return true;
  } catch (error) {
    console.error('Failed to save first completion:', error);
    return false;
  }
}

/**
 * Clear first completion data (for testing/debugging)
 */
export function clearFirstCompletion(gameId: string): void {
  const completionKey = getFirstCompletionKey(gameId);

  try {
    localStorage.removeItem(completionKey);

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('First completion cleared for game:', gameId);
    }
  } catch (error) {
    console.error('Failed to clear first completion:', error);
  }
}

/**
 * Check if current session is the first completion
 * Returns true if this is the first completion, false if it's a replay
 */
export function isFirstCompletion(gameId: string, sessionId: string): boolean {
  const firstCompletion = getFirstCompletion(gameId);

  if (!firstCompletion) {
    // No first completion exists yet, so this is the first completion
    return true;
  }

  // Check if this session matches the first completion session
  return firstCompletion.sessionId === sessionId;
}

/**
 * Get locked results for display (used when game is replayed)
 */
export function getLockedResults(gameId: string): Omit<FirstCompletionData, 'submissionHash'> | null {
  const firstCompletion = getFirstCompletion(gameId);

  if (!firstCompletion) {
    return null;
  }

  // Return data without the hash for display purposes
  const { submissionHash, ...results } = firstCompletion;
  return results;
}
