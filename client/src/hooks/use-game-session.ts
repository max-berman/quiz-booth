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
  loadGameResults,
  getResultsKey,
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

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('completeSession called with:', {
        gameId,
        finalResults,
        currentSessionState: sessionStateRef.current,
      });
    }

    // Save final results if provided
    if (finalResults) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Saving final results:', finalResults);
      }
      saveGameResults(gameId, finalResults);

      // Verify results were saved
      setTimeout(() => {
        const savedResults = loadGameResults(gameId);
        if (process.env.NODE_ENV === 'development') {
          console.log('Verifying results saved:', {
            gameId,
            savedResults,
            resultsKey: getResultsKey(gameId),
            storedValue: localStorage.getItem(getResultsKey(gameId)),
          });
        }
      }, 100);
    }

    // Update session to mark as completed
    const completedState = {
      ...sessionStateRef.current,
      isCompleted: true,
      finalResults,
      lastUpdated: Date.now(),
    };

    // Save completed state briefly, then clear after a longer delay
    // to ensure results page has time to load the results
    saveGameSession(gameId, completedState);

    // Clear session after a longer delay to ensure results page can access it
    setTimeout(() => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Clearing session for game:', gameId);
      }
      clearGameSession(gameId);
      setSessionState(null);
    }, 5000); // Increased from 1 second to 5 seconds
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
