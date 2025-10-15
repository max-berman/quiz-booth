# DeepSeek API Error Codes Analysis

## Current Error Handling Implementation Review

Based on the analysis of `firebase-functions/src/questions/questions.ts`, here's the current error handling status:

### Currently Handled Error Codes

1. **429 - Too Many Requests (Rate Limiting)**

   - ✅ **Handled**: User-friendly message "AI service is temporarily overloaded. Please try again in a few moments."
   - ✅ **Retry Logic**: Yes, with exponential backoff
   - ✅ **Classification**: Properly categorized as rate limiting

2. **401/403 - Authentication Errors**

   - ✅ **Handled**: User-friendly message "AI service authentication failed. Please contact support."
   - ✅ **Retry Logic**: No retry (correct behavior)
   - ✅ **Classification**: Properly categorized as authentication issues

3. **500+ - Server Errors**

   - ✅ **Handled**: User-friendly message "AI service is experiencing technical difficulties. Please try again later."
   - ✅ **Retry Logic**: Yes, with exponential backoff
   - ✅ **Classification**: Properly categorized as server-side issues

4. **408 - Request Timeout**
   - ✅ **Handled**: User-friendly message "AI service request timed out. Please try again with fewer questions."
   - ✅ **Retry Logic**: Yes, with exponential backoff
   - ✅ **Classification**: Properly categorized as timeout

### Missing Error Code Handling

Based on common API patterns and DeepSeek API documentation, the following error codes are NOT currently handled:

1. **400 - Bad Request**

   - ❌ **Not Handled**: Invalid request parameters, malformed JSON, etc.
   - **Impact**: Users won't get specific feedback about invalid input

2. **404 - Not Found**

   - ❌ **Not Handled**: Endpoint not found, resource not available
   - **Impact**: Generic error message for routing issues

3. **413 - Payload Too Large**

   - ❌ **Not Handled**: Request body too large
   - **Impact**: No specific guidance for reducing prompt size

4. **422 - Unprocessable Entity**

   - ❌ **Not Handled**: Semantic validation errors
   - **Impact**: No specific feedback for content validation issues

5. **503 - Service Unavailable**

   - ❌ **Not Handled**: Service maintenance or temporary unavailability
   - **Impact**: Generic error message instead of specific maintenance notice

6. **504 - Gateway Timeout**
   - ❌ **Not Handled**: Upstream service timeout
   - **Impact**: Generic timeout message instead of specific gateway issue

### Network and System Errors

1. **Network Errors (DNS, Connection Refused, etc.)**

   - ⚠️ **Partially Handled**: Generic error handling exists but no specific network error classification
   - **Impact**: Users won't know if it's a network vs. service issue

2. **Timeout Errors (Function timeout)**
   - ✅ **Handled**: Specific timeout detection with user-friendly message

## Recommended Improvements

### 1. Enhanced Error Classification

```typescript
// Enhanced error classification function
function classifyDeepSeekError(
	status: number,
	errorText: string
): {
	userMessage: string
	shouldRetry: boolean
	errorType: string
} {
	switch (status) {
		case 400:
			return {
				userMessage:
					'Invalid request format. Please check your input and try again.',
				shouldRetry: false,
				errorType: 'bad_request',
			}
		case 401:
		case 403:
			return {
				userMessage:
					'AI service authentication failed. Please contact support.',
				shouldRetry: false,
				errorType: 'authentication',
			}
		case 404:
			return {
				userMessage: 'AI service endpoint not found. Please contact support.',
				shouldRetry: false,
				errorType: 'not_found',
			}
		case 408:
			return {
				userMessage:
					'AI service request timed out. Please try again with fewer questions.',
				shouldRetry: true,
				errorType: 'timeout',
			}
		case 413:
			return {
				userMessage:
					'Request too large. Please reduce the number of questions or simplify your prompt.',
				shouldRetry: false,
				errorType: 'payload_too_large',
			}
		case 422:
			return {
				userMessage:
					'Invalid content format. Please adjust your company information and try again.',
				shouldRetry: false,
				errorType: 'validation',
			}
		case 429:
			return {
				userMessage:
					'AI service is temporarily overloaded. Please try again in a few moments.',
				shouldRetry: true,
				errorType: 'rate_limit',
			}
		case 500:
			return {
				userMessage:
					'AI service is experiencing technical difficulties. Please try again later.',
				shouldRetry: true,
				errorType: 'server_error',
			}
		case 502:
		case 503:
		case 504:
			return {
				userMessage:
					'AI service is temporarily unavailable. Please try again in a few minutes.',
				shouldRetry: true,
				errorType: 'service_unavailable',
			}
		default:
			return {
				userMessage: 'An unexpected error occurred. Please try again.',
				shouldRetry: status >= 500, // Retry on server errors
				errorType: 'unknown',
			}
	}
}
```

### 2. Network Error Detection

```typescript
function isNetworkError(error: any): boolean {
	return (
		error instanceof TypeError &&
		(error.message.includes('fetch') ||
			error.message.includes('network') ||
			error.message.includes('ECONNREFUSED') ||
			error.message.includes('ENOTFOUND'))
	)
}
```

### 3. Enhanced Retry Logic

```typescript
const RETRY_CONFIG = {
	maxRetries: 2,
	baseDelay: 2000, // 2 seconds
	maxDelay: 10000, // 10 seconds
	retryableStatuses: [408, 429, 500, 502, 503, 504],
	nonRetryableStatuses: [400, 401, 403, 404, 413, 422],
}
```

## Implementation Priority

### High Priority (Critical Missing Cases)

- **400 Bad Request**: Common for invalid input
- **503 Service Unavailable**: Common during maintenance
- **Network Errors**: Important for user experience

### Medium Priority

- **404 Not Found**: Less common but should be handled
- **413 Payload Too Large**: Could occur with large prompts
- **422 Unprocessable Entity**: Content validation issues

### Low Priority

- **502 Bad Gateway**: Similar to 503 handling
- **504 Gateway Timeout**: Similar to 408 handling

## Current Implementation Strengths

1. **Good User-Friendly Messages**: Current error messages are clear and actionable
2. **Proper Retry Logic**: Retry on appropriate status codes
3. **Timeout Handling**: Specific timeout detection and messaging
4. **Authentication Protection**: No retry on auth errors (security best practice)

## Conclusion

The current implementation handles the most critical error cases (429, 401/403, 500+, 408) well, but could be enhanced with more comprehensive error classification for better user experience and debugging. The recommended improvements would make the error handling more robust and provide users with more specific guidance for different types of failures.
