import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  GameSessionState,
  GameFinalResults,
  loadGameSession,
  saveGameSession,
  clearGameSession,
  createInitialSessionState,
  hasValidSession,
  saveGameResults,
  clearGameResults,
} from '@/lib/session-utils';

interface UseGameSessionReturn {
  sessionState: GameSessionState | null;
  isSessionLoaded: boolean;
  hasExistingSession: boolean;
  updateSessionState: (updates: Partial<GameSessionState>) => void;
  completeSession: (finalResults?: GameFinalResults) => void;
  clearCurrentSession: () => void;
}

/**
 * Hook for managing game session state with persistence
 */
export function useGameSession(gameId: string | undefined): UseGameSessionReturn {
  const [sessionState, setSessionState] = useState<GameSessionState | null>(null);
  const [isSessionLoaded, setIsSessionLoaded] = useState(false);
  const sessionStateRef = useRef<GameSessionState | null>(null);

  // Keep ref in sync with state
  useEffect(() => {
    sessionStateRef.current = sessionState;
  }, [sessionState]);

  // Load session on component mount
  useEffect(() => {
    if (!gameId) {
      setIsSessionLoaded(true);
      return;
    }

    const existingSession = loadGameSession(gameId);
    if (existingSession) {
      setSessionState(existingSession);
    } else {
      // Create new session if none exists
      const newSession = createInitialSessionState(gameId);
      setSessionState(newSession);
      saveGameSession(gameId, newSession);
    }

    setIsSessionLoaded(true);
  }, [gameId]);

  // Update session state and persist to localStorage
  const updateSessionState = useCallback((updates: Partial<GameSessionState>) => {
    if (!gameId || !sessionStateRef.current) return;

    const updatedState = {
      ...sessionStateRef.current,
      ...updates,
      lastUpdated: Date.now(),
    };

    setSessionState(updatedState);
    saveGameSession(gameId, updatedState);
  }, [gameId]);

  // Mark session as completed and clear it
  const completeSession = useCallback((finalResults?: GameFinalResults) => {
    if (!gameId || !sessionStateRef.current) return;

    // Save final results if provided
    if (finalResults) {
      saveGameResults(gameId, finalResults);
    }

    // Update session to mark as completed
    const completedState = {
      ...sessionStateRef.current,
      isCompleted: true,
      finalResults,
      lastUpdated: Date.now(),
    };

    // Save completed state briefly, then clear after a short delay
    saveGameSession(gameId, completedState);

    // Clear session after a short delay to ensure results page can access it
    setTimeout(() => {
      clearGameSession(gameId);
      setSessionState(null);
    }, 1000);
  }, [gameId]);

  // Clear current session (for manual reset)
  const clearCurrentSession = useCallback(() => {
    if (!gameId) return;

    clearGameSession(gameId);
    setSessionState(null);

    // Create new session
    const newSession = createInitialSessionState(gameId);
    setSessionState(newSession);
    saveGameSession(gameId, newSession);
  }, [gameId]);

  const hasExistingSession = useMemo(() => {
    return hasValidSession(gameId || '');
  }, [gameId]);

  return {
    sessionState,
    isSessionLoaded,
    hasExistingSession,
    updateSessionState,
    completeSession,
    clearCurrentSession,
  };
}
