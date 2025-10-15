import { classifyLLMError, isNetworkError } from '../lib/llm-error-classifier';

/**
 * Enhanced error handler for LLM API calls
 * @param error - The caught error
 * @param context - Additional context for logging
 * @param providerName - Name of the LLM provider that generated the error
 * @returns User-friendly error message and retry decision
 */
export function handleLLMError(error: any, context: { batchIndex?: number; totalBatches?: number; batchSize?: number; providerName?: string } = {}): {
  userMessage: string;
  shouldRetry: boolean;
  errorType: string;
  fallbackPossible: boolean;
} {
  console.error('LLM API Error:', {
    message: error.message,
    status: error.status,
    context,
    providerName: context.providerName,
    stack: error.stack
  });

  // Network errors
  if (isNetworkError(error)) {
    return {
      userMessage: 'Network connection issue. Please check your internet connection and try again.',
      shouldRetry: true,
      errorType: 'network',
      fallbackPossible: true
    };
  }

  // HTTP status code errors
  if (error.status) {
    return classifyLLMError(error.status, error.message, context.providerName);
  }

  // Timeout errors
  if (error.name === 'AbortError' || error.message.includes('timeout') || error.message.includes('deadline')) {
    return {
      userMessage: 'AI service request timed out. Please try again with fewer questions.',
      shouldRetry: true,
      errorType: 'timeout',
      fallbackPossible: true
    };
  }

  // Generic errors
  return {
    userMessage: 'An unexpected error occurred with the AI service. Please try again.',
    shouldRetry: false,
    errorType: 'generic',
    fallbackPossible: true
  };
}
