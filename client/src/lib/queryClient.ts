import { QueryClient } from "@tanstack/react-query";

// This file is kept for compatibility but should not be used for Firebase Functions
// All API calls should now use the useFirebaseFunctions hook or direct Firebase Functions calls

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
