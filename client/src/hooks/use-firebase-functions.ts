import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFunctions, httpsCallable } from "firebase/functions";
import { logger } from "@/lib/logger";

const functions = getFunctions();

// Firebase Functions API client
export const useFirebaseFunctions = () => {
  const queryClient = useQueryClient();

  // Game functions
  const createGame = httpsCallable(functions, 'createGame');
  const getGame = httpsCallable(functions, 'getGame');
  const getGamesByUser = httpsCallable(functions, 'getGamesByUser');
  const updateGame = httpsCallable(functions, 'updateGame');
  const updateGameTitle = httpsCallable(functions, 'updateGameTitle');
  const updateGamePrizes = httpsCallable(functions, 'updateGamePrizes');
  const savePlayerScore = httpsCallable(functions, 'savePlayerScore');
  const getGameLeaderboard = httpsCallable(functions, 'getGameLeaderboard');

  // Question functions
  const generateQuestions = httpsCallable(functions, 'generateQuestions');
  const generateSingleQuestion = httpsCallable(functions, 'generateSingleQuestion');
  const getQuestions = httpsCallable(functions, 'getQuestions');
  const updateQuestion = httpsCallable(functions, 'updateQuestion');
  const deleteQuestion = httpsCallable(functions, 'deleteQuestion');
  const addQuestion = httpsCallable(functions, 'addQuestion');

  // Usage tracking functions
  const trackUsage = httpsCallable(functions, 'trackUsage');
  const getUsage = httpsCallable(functions, 'getUsage');

  // Custom hook for Firebase Functions data fetching
  const useFirebaseQuery = <T>(functionName: string, data?: any, options: {
    enabled?: boolean;
    refetchInterval?: number;
    staleTime?: number;
  } = {}) => {
    return useQuery<T>({
      queryKey: [functionName, data],
      queryFn: async () => {
        logger.api.request(`firebase:${functionName}`, 'CALL', data);

        try {
          const functionCall = httpsCallable(functions, functionName);
          const result = await functionCall(data);

          logger.api.response(`firebase:${functionName}`, 'CALL', result);
          return result.data as T;
        } catch (error) {
          logger.api.error(`firebase:${functionName}`, 'CALL', error);
          throw error;
        }
      },
      ...options
    });
  };

  // Custom hook for Firebase Functions mutations
  const useFirebaseMutation = <TData = unknown, TVariables = unknown>(
    functionName: string,
    options: {
      onSuccess?: (data: TData) => void;
      onError?: (error: Error) => void;
      invalidateQueries?: string[];
    } = {}
  ) => {
    return useMutation<TData, Error, TVariables>({
      mutationFn: async (variables: TVariables) => {
        logger.api.request(`firebase:${functionName}`, 'CALL', variables);

        try {
          const functionCall = httpsCallable(functions, functionName);
          const result = await functionCall(variables);

          logger.api.response(`firebase:${functionName}`, 'CALL', result);
          return result.data as TData;
        } catch (error) {
          logger.api.error(`firebase:${functionName}`, 'CALL', error);
          throw error;
        }
      },
      onSuccess: (data) => {
        // Invalidate related queries
        if (options.invalidateQueries) {
          options.invalidateQueries.forEach(queryKey => {
            queryClient.invalidateQueries({ queryKey: [queryKey] });
          });
        }

        options.onSuccess?.(data);
      },
      onError: (error) => {
        options.onError?.(error);
      }
    });
  };

  // Helper function for direct Firebase Functions calls
  const firebaseCall = async <T>(functionName: string, data?: any): Promise<T> => {
    logger.api.request(`firebase:${functionName}`, 'CALL', data);

    try {
      const functionCall = httpsCallable(functions, functionName);
      const result = await functionCall(data);

      logger.api.response(`firebase:${functionName}`, 'CALL', result);
      return result.data as T;
    } catch (error) {
      logger.api.error(`firebase:${functionName}`, 'CALL', error);
      throw error;
    }
  };

  return {
    // Direct function calls
    createGame,
    getGame,
    getGamesByUser,
    updateGame,
    updateGameTitle,
    updateGamePrizes,
    savePlayerScore,
    getGameLeaderboard,
    generateQuestions,
    generateSingleQuestion,
    getQuestions,
    updateQuestion,
    deleteQuestion,
    addQuestion,
    trackUsage,
    getUsage,

    // Custom hooks
    useFirebaseQuery,
    useFirebaseMutation,
    firebaseCall,
  };
};
