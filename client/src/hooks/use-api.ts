import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/auth-utils";
import { logger } from "@/lib/logger";

// Custom hook for API data fetching with built-in error handling and logging
export const useApi = <T>(url: string, options: {
  enabled?: boolean;
  refetchInterval?: number;
  staleTime?: number;
} = {}) => {
  return useQuery<T>({
    queryKey: [url],
    queryFn: async () => {
      logger.api.request(url, 'GET');

      try {
        const headers = await getAuthHeaders();
        const response = await fetch(url, { headers });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        logger.api.response(url, 'GET', response, data);
        return data;
      } catch (error) {
        logger.api.error(url, 'GET', error);
        throw error;
      }
    },
    ...options
  });
};

// Custom hook for API mutations with built-in error handling and logging
export const useApiMutation = <TData = unknown, TVariables = unknown>(
  url: string,
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'POST',
  options: {
    onSuccess?: (data: TData) => void;
    onError?: (error: Error) => void;
    invalidateQueries?: string[];
  } = {}
) => {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables: TVariables) => {
      logger.api.request(url, method, variables);

      try {
        const headers = await getAuthHeaders();
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          body: JSON.stringify(variables)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        logger.api.response(url, method, response, data);
        return data;
      } catch (error) {
        logger.api.error(url, method, error);
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

// Helper function for direct API calls (for use outside of React components)
export const apiCall = async <T>(
  url: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    data?: any;
  } = {}
): Promise<T> => {
  const { method = 'GET', data } = options;
  logger.api.request(url, method, data);

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: data ? JSON.stringify(data) : undefined
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

    const responseData = await response.json();
    logger.api.response(url, method, response, responseData);
    return responseData;
  } catch (error) {
    logger.api.error(url, method, error);
    throw error;
  }
};
