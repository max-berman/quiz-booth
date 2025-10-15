// Re-export the ErrorClassification interface for use in other files
export interface ErrorClassification {
  userMessage: string;
  shouldRetry: boolean;
  errorType: string;
  fallbackPossible: boolean;
}

/**
 * Enhanced error classification for LLM API errors
 * @param status - HTTP status code
 * @param errorText - Error response text
 * @param providerName - Name of the LLM provider (DeepSeek, OpenAI, etc.)
 * @returns Error classification with user message and retry logic
 */
export function classifyLLMError(status: number, errorText: string, providerName: string = 'DeepSeek'): ErrorClassification {
  // Provider-specific error handling
  if (providerName === 'OpenAI') {
    return classifyOpenAIError(status, errorText);
  } else if (providerName === 'DeepSeek') {
    return classifyDeepSeekError(status, errorText);
  }

  // Fallback to generic classification for unknown providers
  return classifyGenericError(status, errorText);
}

/**
 * DeepSeek-specific error classification
 * @param status - HTTP status code
 * @param errorText - Error response text
 * @returns Error classification with user message and retry logic
 */
export function classifyDeepSeekError(status: number, errorText: string): ErrorClassification {
  switch (status) {
    case 400:
      if (errorText.includes('Invalid Format')) {
        return {
          userMessage: 'DeepSeek request format is invalid. Please check your input and try again.',
          shouldRetry: false,
          errorType: 'invalid_format',
          fallbackPossible: true
        };
      } else {
        return {
          userMessage: 'Invalid request format. Please check your input and try again.',
          shouldRetry: false,
          errorType: 'bad_request',
          fallbackPossible: true
        };
      }
    case 401:
      if (errorText.includes('Authentication Fails')) {
        return {
          userMessage: 'DeepSeek API key is invalid. Please check your API key configuration.',
          shouldRetry: false,
          errorType: 'invalid_api_key',
          fallbackPossible: false
        };
      } else {
        return {
          userMessage: 'DeepSeek authentication failed. Please check your API configuration.',
          shouldRetry: false,
          errorType: 'authentication',
          fallbackPossible: false
        };
      }
    case 402:
      return {
        userMessage: 'DeepSeek account balance is insufficient. Please add funds to your account.',
        shouldRetry: false,
        errorType: 'insufficient_balance',
        fallbackPossible: true
      };
    case 422:
      if (errorText.includes('Invalid Parameters')) {
        return {
          userMessage: 'DeepSeek request contains invalid parameters. Please adjust your settings and try again.',
          shouldRetry: false,
          errorType: 'invalid_parameters',
          fallbackPossible: true
        };
      } else {
        return {
          userMessage: 'Invalid content format for DeepSeek. Please adjust your company information and try again.',
          shouldRetry: false,
          errorType: 'validation',
          fallbackPossible: true
        };
      }
    case 429:
      if (errorText.includes('Rate Limit Reached')) {
        return {
          userMessage: 'DeepSeek rate limit reached. Please try again in a few moments.',
          shouldRetry: true,
          errorType: 'rate_limit',
          fallbackPossible: true
        };
      } else {
        return {
          userMessage: 'DeepSeek is temporarily overloaded. Please try again in a few moments.',
          shouldRetry: true,
          errorType: 'rate_limit',
          fallbackPossible: true
        };
      }
    case 500:
      if (errorText.includes('Server Error')) {
        return {
          userMessage: 'DeepSeek is experiencing technical difficulties. Please try again later.',
          shouldRetry: true,
          errorType: 'server_error',
          fallbackPossible: true
        };
      } else {
        return {
          userMessage: 'DeepSeek server error. Please try again later.',
          shouldRetry: true,
          errorType: 'server_error',
          fallbackPossible: true
        };
      }
    case 503:
      if (errorText.includes('Server Overloaded')) {
        return {
          userMessage: 'DeepSeek is currently overloaded. Please try again in a few minutes.',
          shouldRetry: true,
          errorType: 'service_overloaded',
          fallbackPossible: true
        };
      } else {
        return {
          userMessage: 'DeepSeek is temporarily unavailable. Please try again in a few minutes.',
          shouldRetry: true,
          errorType: 'service_unavailable',
          fallbackPossible: true
        };
      }
    default:
      return {
        userMessage: 'An unexpected error occurred with DeepSeek. Please try again.',
        shouldRetry: status >= 500, // Retry on server errors
        errorType: 'unknown',
        fallbackPossible: true
      };
  }
}

/**
 * OpenAI-specific error classification
 * @param status - HTTP status code
 * @param errorText - Error response text
 * @returns Error classification with user message and retry logic
 */
export function classifyOpenAIError(status: number, errorText: string): ErrorClassification {
  switch (status) {
    case 400:
      return {
        userMessage: 'Invalid request format. Please check your input and try again.',
        shouldRetry: false,
        errorType: 'bad_request',
        fallbackPossible: true
      };
    case 401:
      // OpenAI-specific 401 errors
      if (errorText.includes('Invalid Authentication') || errorText.includes('Incorrect API key provided')) {
        return {
          userMessage: 'OpenAI API key is invalid. Please check your API key configuration.',
          shouldRetry: false,
          errorType: 'invalid_api_key',
          fallbackPossible: false
        };
      } else if (errorText.includes('You must be a member of an organization')) {
        return {
          userMessage: 'OpenAI organization access required. Please contact support.',
          shouldRetry: false,
          errorType: 'organization_required',
          fallbackPossible: false
        };
      } else if (errorText.includes('IP not authorized')) {
        return {
          userMessage: 'Your IP address is not authorized for OpenAI API access.',
          shouldRetry: false,
          errorType: 'ip_not_authorized',
          fallbackPossible: false
        };
      } else {
        return {
          userMessage: 'OpenAI authentication failed. Please check your API configuration.',
          shouldRetry: false,
          errorType: 'authentication',
          fallbackPossible: false
        };
      }
    case 403:
      if (errorText.includes('Country, region, or territory not supported')) {
        return {
          userMessage: 'OpenAI API is not available in your region. Please try a different AI provider.',
          shouldRetry: false,
          errorType: 'region_not_supported',
          fallbackPossible: true
        };
      } else {
        return {
          userMessage: 'OpenAI access denied. Please check your permissions.',
          shouldRetry: false,
          errorType: 'access_denied',
          fallbackPossible: false
        };
      }
    case 408:
      return {
        userMessage: 'OpenAI request timed out. Please try again with fewer questions.',
        shouldRetry: true,
        errorType: 'timeout',
        fallbackPossible: true
      };
    case 413:
      return {
        userMessage: 'Request too large for OpenAI. Please reduce the number of questions or simplify your prompt.',
        shouldRetry: false,
        errorType: 'payload_too_large',
        fallbackPossible: true
      };
    case 422:
      return {
        userMessage: 'Invalid content format for OpenAI. Please adjust your company information and try again.',
        shouldRetry: false,
        errorType: 'validation',
        fallbackPossible: true
      };
    case 429:
      // OpenAI-specific rate limiting
      if (errorText.includes('Rate limit reached for requests')) {
        return {
          userMessage: 'OpenAI rate limit reached. Please try again in a few moments.',
          shouldRetry: true,
          errorType: 'rate_limit',
          fallbackPossible: true
        };
      } else if (errorText.includes('You exceeded your current quota')) {
        return {
          userMessage: 'OpenAI quota exceeded. Please check your billing and plan details.',
          shouldRetry: false,
          errorType: 'quota_exceeded',
          fallbackPossible: false
        };
      } else {
        return {
          userMessage: 'OpenAI is temporarily overloaded. Please try again in a few moments.',
          shouldRetry: true,
          errorType: 'rate_limit',
          fallbackPossible: true
        };
      }
    case 500:
      return {
        userMessage: 'OpenAI is experiencing technical difficulties. Please try again later.',
        shouldRetry: true,
        errorType: 'server_error',
        fallbackPossible: true
      };
    case 502:
    case 503:
      if (errorText.includes('The engine is currently overloaded') || errorText.includes('Slow Down')) {
        return {
          userMessage: 'OpenAI is currently overloaded. Please reduce your request rate and try again later.',
          shouldRetry: true,
          errorType: 'service_overloaded',
          fallbackPossible: true
        };
      } else {
        return {
          userMessage: 'OpenAI is temporarily unavailable. Please try again in a few minutes.',
          shouldRetry: true,
          errorType: 'service_unavailable',
          fallbackPossible: true
        };
      }
    case 504:
      return {
        userMessage: 'OpenAI gateway timeout. Please try again with fewer questions.',
        shouldRetry: true,
        errorType: 'gateway_timeout',
        fallbackPossible: true
      };
    default:
      return {
        userMessage: 'An unexpected error occurred with OpenAI. Please try again.',
        shouldRetry: status >= 500, // Retry on server errors
        errorType: 'unknown',
        fallbackPossible: true
      };
  }
}

/**
 * Generic error classification for other LLM providers
 * @param status - HTTP status code
 * @param errorText - Error response text
 * @returns Error classification with user message and retry logic
 */
export function classifyGenericError(status: number, errorText: string): ErrorClassification {
  switch (status) {
    case 400:
      return {
        userMessage: 'Invalid request format. Please check your input and try again.',
        shouldRetry: false,
        errorType: 'bad_request',
        fallbackPossible: true
      };
    case 401:
    case 403:
      return {
        userMessage: 'AI service authentication failed. Please contact support.',
        shouldRetry: false,
        errorType: 'authentication',
        fallbackPossible: false
      };
    case 404:
      return {
        userMessage: 'AI service endpoint not found. Please contact support.',
        shouldRetry: false,
        errorType: 'not_found',
        fallbackPossible: false
      };
    case 408:
      return {
        userMessage: 'AI service request timed out. Please try again with fewer questions.',
        shouldRetry: true,
        errorType: 'timeout',
        fallbackPossible: true
      };
    case 413:
      return {
        userMessage: 'Request too large. Please reduce the number of questions or simplify your prompt.',
        shouldRetry: false,
        errorType: 'payload_too_large',
        fallbackPossible: true
      };
    case 422:
      return {
        userMessage: 'Invalid content format. Please adjust your company information and try again.',
        shouldRetry: false,
        errorType: 'validation',
        fallbackPossible: true
      };
    case 429:
      return {
        userMessage: 'AI service is temporarily overloaded. Please try again in a few moments.',
        shouldRetry: true,
        errorType: 'rate_limit',
        fallbackPossible: true
      };
    case 500:
      return {
        userMessage: 'AI service is experiencing technical difficulties. Please try again later.',
        shouldRetry: true,
        errorType: 'server_error',
        fallbackPossible: true
      };
    case 502:
    case 503:
    case 504:
      return {
        userMessage: 'AI service is temporarily unavailable. Please try again in a few minutes.',
        shouldRetry: true,
        errorType: 'service_unavailable',
        fallbackPossible: true
      };
    default:
      return {
        userMessage: 'An unexpected error occurred. Please try again.',
        shouldRetry: status >= 500, // Retry on server errors
        errorType: 'unknown',
        fallbackPossible: true
      };
  }
}

/**
 * Detect network-related errors
 * @param error - Error object to check
 * @returns True if the error is network-related
 */
export function isNetworkError(error: any): boolean {
  return error instanceof TypeError && (
    error.message.includes('fetch') ||
    error.message.includes('network') ||
    error.message.includes('ECONNREFUSED') ||
    error.message.includes('ENOTFOUND') ||
    error.message.includes('ETIMEDOUT') ||
    error.message.includes('ECONNRESET')
  );
}
