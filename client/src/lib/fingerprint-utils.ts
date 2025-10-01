/**
 * Player identification and submission tracking utilities
 */

/**
 * Generate a simple fingerprint for the player
 * This is a basic implementation - consider using a more robust fingerprinting library for production
 */
export function generatePlayerFingerprint(gameId: string): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    navigator.hardwareConcurrency?.toString() || 'unknown',
    screen.width.toString(),
    screen.height.toString(),
    gameId,
  ];

  const fingerprintString = components.join('|');

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprintString.length; i++) {
    const char = fingerprintString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return `player_${Math.abs(hash).toString(36)}`;
}

/**
 * Get submission tracking key for localStorage
 */
export function getSubmissionKey(gameId: string): string {
  return `quizbooth_submission_${gameId}`;
}

/**
 * Check if player has already submitted a score for this game
 */
export function hasSubmittedScore(gameId: string): boolean {
  const submissionKey = getSubmissionKey(gameId);

  try {
    const stored = localStorage.getItem(submissionKey);
    return stored === 'true';
  } catch (error) {
    console.error('Failed to check submission status:', error);
    return false;
  }
}

/**
 * Mark that player has submitted a score for this game
 */
export function markScoreSubmitted(gameId: string): void {
  const submissionKey = getSubmissionKey(gameId);

  try {
    localStorage.setItem(submissionKey, 'true');
  } catch (error) {
    console.error('Failed to mark score as submitted:', error);
  }
}

/**
 * Get all submitted games (for debugging/admin purposes)
 */
export function getSubmittedGames(): string[] {
  const submittedGames: string[] = [];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('quizbooth_submission_')) {
        const gameId = key.replace('quizbooth_submission_', '');
        submittedGames.push(gameId);
      }
    }
  } catch (error) {
    console.error('Failed to get submitted games:', error);
  }

  return submittedGames;
}

/**
 * Clear submission for a specific game (for testing/debugging)
 */
export function clearSubmission(gameId: string): void {
  const submissionKey = getSubmissionKey(gameId);

  try {
    localStorage.removeItem(submissionKey);
  } catch (error) {
    console.error('Failed to clear submission:', error);
  }
}
