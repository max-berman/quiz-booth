Based on my analysis of the Quiz Booth project, I've identified the key files responsible for AI/LLM configuration and trivia question generation logic. Here's a breakdown of the relevant files:

## Core AI/LLM Configuration and Logic Files:

### 1. **`client/src/lib/deepseek.ts`** - Client-side AI Interface

- Defines the `TriviaQuestion` interface for question structure
- Contains the `generateQuestions()` function that makes API calls to the server's question generation endpoint
- Serves as the frontend bridge to the AI question generation system

### 2. **`server/routes.ts`** - Server-side AI Logic (Primary File)

- Contains the main question generation endpoint: `/api/games/:id/generate-questions`
- Handles the complete AI integration with DeepSeek API
- Includes sophisticated prompt engineering with:
  - Company-specific context handling (detects websites vs company names)
  - Category-based instruction tailoring (Company Facts, Industry Knowledge, Fun Facts, General Knowledge)
  - Dynamic prompt construction based on game settings (difficulty, question count, industry)
  - JSON response parsing and validation
  - Error handling for API failures and malformed responses

### 3. **`.env`** - AI API Configuration

- Contains the `DEEPSEEK_API_KEY` environment variable
- Configures authentication for the DeepSeek AI service
- Supports both server-side (`DEEPSEEK_API_KEY`) and client-side (`VITE_DEEPSEEK_API_KEY`) usage

## Key AI Features Implemented:

1. **Smart Context Detection**: Automatically detects if company names contain website URLs and adjusts prompt instructions accordingly
2. **Category-Specific Generation**: Creates different types of questions based on selected categories with tailored instructions
3. **Structured JSON Output**: Ensures the AI returns properly formatted questions with explanations
4. **Error Resilience**: Robust error handling for API failures, parsing issues, and validation problems
5. **Configuration Management**: Environment-based API key management for security

The AI logic is primarily centralized in the server routes file, which makes it easy to maintain and modify. The system uses DeepSeek's chat completion API with JSON response format to generate structured trivia questions.

## Server-Side Rendering (SSR) Integration

### SSR Architecture for SEO Optimization

The application now includes Firebase Functions-based SSR for main pages to improve SEO and crawlability:

1. **SSR Implementation Files**:

   - `firebase-functions/src/ssr/index.ts` - Main SSR handler with Express.js routing
   - `firebase-functions/src/ssr/renderer.ts` - React component rendering logic
   - `firebase-functions/src/ssr/utils/firestore-ssr.ts` - Server-side data fetching

2. **SSR Pages**:

   - Home page (`/`) - SEO-optimized with meta tags
   - About page (`/about`) - Mission and company information
   - Quiz Games page (`/quiz-games`) - Dynamic data from Firestore
   - FAQ page (`/faq`) - Structured content for search engines

3. **SSR Features**:

   - Server-generated HTML with proper meta tags
   - Dynamic content fetching from Firestore
   - Security headers (X-Frame-Options, XSS Protection)
   - 1-hour caching for performance
   - Graceful fallback to client-side rendering

4. **SEO Benefits**:
   - Better search engine crawlability
   - Improved page load performance
   - Enhanced social sharing with proper meta tags
   - Structured data for search engines

The SSR implementation works alongside the existing AI question generation system, providing comprehensive SEO optimization while maintaining the rich interactive features of the application.

Would you like me to provide more detailed explanations of any specific parts of the AI implementation, or are you looking to modify any aspects of the question generation logic?
