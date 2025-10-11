# System Patterns: Quiz Booth

## Architecture Overview

### Monorepo Structure

```
quiz-booth/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route-based page components
│   │   ├── contexts/       # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility libraries and configurations
│   │   └── assets/         # Static assets and images
├── firebase-functions/     # Firebase Functions backend
│   ├── src/                # TypeScript source files
│   │   ├── games/          # Game management functions
│   │   ├── questions/      # Question generation functions
│   │   ├── usage/          # Usage tracking functions
│   │   └── auth/           # Authentication functions
│   └── lib/                # Compiled JavaScript files
├── shared/                 # Shared TypeScript types and schemas
└── attached_assets/        # Documentation and asset files
```

## Core Technical Decisions

### Full-Stack TypeScript

- **Consistent Type Safety**: Shared types between frontend and backend
- **Zod Validation**: Runtime type validation for API inputs
- **Firebase-Compatible Types**: Separate from Drizzle dependencies

### Serverless Architecture

- **Firebase Functions**: Scalable, cost-effective backend
- **Firestore Database**: Real-time NoSQL database
- **Firebase Hosting**: Global CDN with SSR capabilities

### Modern Frontend Stack

- **React 18**: Latest React features and performance
- **Vite**: Fast development and optimized builds
- **Tailwind CSS**: Utility-first styling with custom theme
- **Radix UI**: Accessible, unstyled component primitives

## Data Architecture

### Database Schema

#### Games Collection

```typescript
interface Game {
	id: string
	gameTitle: string | null // AI-generated or user-edited
	companyName: string
	industry: string
	productDescription: string | null
	questionCount: number
	difficulty: string
	categories: string[]
	firstPrize: string | null
	secondPrize: string | null
	thirdPrize: string | null
	prizes: PrizePlacement[] | null // Flexible prize system
	creatorKey: string
	userId?: string // Firebase UID (optional)
	createdAt: Date
	modifiedAt?: Date
	isPublic?: boolean
}
```

#### Questions Collection

```typescript
interface Question {
	id: string
	gameId: string
	questionText: string
	options: string[]
	correctAnswer: number
	explanation: string | null
	order: number
}
```

#### Players Collection

```typescript
interface Player {
	id: string
	name: string
	company: string | null
	gameId: string
	score: number
	correctAnswers: number
	totalQuestions: number
	timeSpent: number // in seconds
	completedAt: Date
}
```

## Authentication System

### Dual Authentication Strategy

#### Firebase Auth (Primary)

- Google Sign-in integration
- User-based game ownership via `userId` field
- JWT token authentication
- Cross-device synchronization

#### Legacy Creator Keys

- Server-generated unique keys for game creators
- Stored in `games.creatorKey` field
- Used via `X-Creator-Key` header
- Being phased out in favor of Firebase Auth

### Graceful Fallback

- Many endpoints support both systems
- `optionalFirebaseAuth` middleware allows both authenticated and anonymous access
- Frontend components adapt UI based on authentication state

## API Architecture

### Firebase Functions Endpoints

#### Game Management

- `createGame` - Create new trivia game (requires auth)
- `getGame` - Get specific game details
- `getGamesByUser` - Get games for authenticated user
- `updateGame` - Update game details
- `updateGameTitle` - Update game title
- `updateGamePrizes` - Update game prizes with flexible format

#### Question Management

- `generateQuestions` - Generate AI questions for game
- `generateSingleQuestion` - Generate single question
- `getQuestions` - Get all questions for a game
- `addQuestion` - Add single question to game
- `updateQuestion` - Update question
- `deleteQuestion` - Delete question

#### Player & Analytics

- `savePlayerScore` - Submit player score/completion
- `getGameLeaderboard` - Get game-specific leaderboard
- `trackUsage` - Track usage events
- `getUsage` - Get usage statistics

### Caching Strategy

- **Games**: 2 minutes TTL
- **Questions**: 1 minute TTL
- **Leaderboards**: 30 seconds TTL
- Cache invalidation on data modifications

## API Consistency Pattern

### Consistent `httpsCallable` Pattern

**Problem**: Inconsistent API call patterns caused CORS errors and development/production inconsistencies

**Root Cause**:

- Some APIs used `httpsCallable` pattern (Firebase SDK handles environment switching)
- Some APIs used direct `fetch` calls with manual URL switching
- This led to CORS errors and inconsistent behavior between environments

**Solution**: Standardized all API calls to use the `httpsCallable` pattern

#### Implementation

**Firebase Functions** (converted to `onCall` pattern):

```typescript
// BEFORE: HTTP function with manual CORS handling
export const getGamePlayCount = functions.https.onRequest(async (req, res) => {
	// Manual CORS headers, query parameter parsing, etc.
})

// AFTER: Callable function with automatic handling
export const getGamePlayCount = functions.https.onCall(
	async (data, context) => {
		const { gameId } = data
		// Automatic CORS, authentication, and error handling
	}
)
```

**Client Usage** (consistent pattern):

```typescript
// BEFORE: Manual fetch with URL switching
const url = isDevelopment
	? `http://localhost:5001/.../getGamePlayCount?gameId=${gameId}`
	: `/api/games/${gameId}/play-count`

// AFTER: Consistent httpsCallable pattern
const { getGamePlayCount } = useFirebaseFunctions()
const result = await getGamePlayCount({ gameId })
```

#### Benefits

- **Automatic Environment Switching**: Firebase SDK handles development vs production
- **No CORS Issues**: Callable functions handle CORS automatically
- **Type Safety**: Consistent TypeScript types across all API calls
- **Error Handling**: Standardized error responses
- **Authentication**: Built-in authentication handling
- **Production Safety**: Works identically in both environments

#### Functions Converted

- `getGamePlayCount` - Now uses `httpsCallable` pattern
- `getGameQuestionsCount` - Now uses `httpsCallable` pattern

## AI Integration

### DeepSeek API Integration

- **Context-Aware Generation**: Uses company information for relevant questions
- **Category Support**: Multiple question categories (Company Facts, Industry Knowledge, etc.)
- **Website Detection**: Enhanced generation when company names are URLs
- **Rate Limiting**: Intelligent rate limiting to manage API costs

### Question Generation Process

1. **Context Preparation**: Gather company and industry information
2. **Prompt Engineering**: Create optimized prompts for DeepSeek
3. **Response Validation**: Ensure proper format and quality
4. **Uniqueness Check**: Prevent duplicate questions
5. **Storage**: Save validated questions to Firestore

## Frontend Architecture

### Component Structure

- **Page Components**: Route-based components with lazy loading
- **UI Components**: Reusable, accessible components using Radix UI
- **Layout Components**: Header, footer, and navigation
- **Modal Components**: Overlay dialogs and forms

### State Management

- **React Query**: Server state management with caching
- **Context API**: Client state (authentication, UI state)
- **Local State**: Component-specific state with useState/useReducer

### Routing

- **Wouter**: Lightweight routing library
- **Code Splitting**: Lazy loading for optimal performance
- **Route Protection**: Authentication-based route guards

### New Page Creation Pattern

**IMPORTANT**: When adding a new static page, ensure it's properly integrated across the entire application:

1. **Create Page Component** (`client/src/pages/`)

   - Create new page component with proper SEO metadata
   - Use lazy loading for code splitting

2. **Add to Router** (`client/src/App.tsx`)

   - Import the page component with lazy loading
   - Add route configuration in the Router component

3. **Add to Header Menu** (`client/src/components/menu-header.tsx`)

   - Add navigation link to desktop menu
   - Add navigation link to mobile sidebar
   - Include appropriate icon for visual consistency

4. **Add to Footer** (`client/src/components/footer.tsx`)

   - Add navigation link to footer
   - Position logically within existing navigation structure

5. **Add to Sitemap** (`scripts/generate-sitemap.js`)

   - Add route to static routes array
   - Regenerate sitemap to include new page

6. **Testing & Verification**
   - Verify page loads correctly at the new route
   - Test navigation from header and footer
   - Confirm sitemap includes the new page
   - Check SEO metadata and accessibility

**Example Workflow for Static Pages:**

```typescript
// 1. Create page component
// 2. Add to App.tsx router
// 3. Add to menu-header.tsx navigation
// 4. Add to footer.tsx navigation
// 5. Add to generate-sitemap.js
// 6. Test all navigation paths
```

**Note**: Dynamic pages (like `/game/:id`) follow different patterns and don't need manual sitemap or navigation entries.

## Performance Optimization

### Frontend Optimizations

- **Lazy Loading**: Route and component-level code splitting
- **Bundle Optimization**: Tree shaking and dead code elimination
- **Image Optimization**: Optimized assets and responsive images
- **PWA Support**: Service worker for offline capabilities

### Backend Optimizations

- **Function Optimization**: Memory and timeout settings
- **Database Indexing**: Optimized Firestore queries
- **Caching Strategy**: Intelligent caching with appropriate TTLs
- **Rate Limiting**: Protection against abuse

## Error Handling

### Structured Error Responses

```typescript
interface ApiError {
	error: string
	message: string
	details?: any
}
```

### Comprehensive Error Types

- **Validation Errors**: Input validation failures
- **Authentication Errors**: Auth-related issues
- **Rate Limit Errors**: API usage limits
- **AI Service Errors**: DeepSeek API failures
- **Database Errors**: Firestore operation failures

### User-Friendly Error Messages

- Clear, actionable error messages
- Graceful degradation when possible
- Comprehensive logging for debugging

## Security Patterns

### Anti-Cheating System

#### First Completion Lock

**Problem**: Players could replay games after completion to get better scores with known answers

**Solution**: Implemented comprehensive anti-cheating protection with first completion locking

**Implementation**:

```typescript
// Game page - prevent replay after completion
useEffect(() => {
	if (id && !sessionState?.isCompleted) {
		const firstCompletionExists = hasFirstCompletion(id)
		const loadedResults = loadGameResults(id)

		// Redirect if either:
		// 1. First completion exists (score was submitted) OR
		// 2. Game results exist but no session (game was completed but score not submitted)
		if (firstCompletionExists || (loadedResults && !sessionState)) {
			setLocation(`/results/${id}`)
		}
	}
}, [id, sessionState?.isCompleted, sessionState, setLocation])
```

**Key Features**:

- **Immediate Protection**: Game completion detected immediately after first play
- **Session-Based Detection**: Uses both first completion data and session results
- **UI Feedback**: Clear messaging and visual indicators for locked scores
- **Graceful Handling**: Players redirected to results page with explanation

#### Score Locking Logic

**First Play Flow**:

1. Player completes game → Results saved to session storage
2. Player can submit score → Score saved to leaderboard
3. First completion data saved after successful submission

**Replay Prevention**:

1. Player tries to access game again → System detects completed session
2. Immediate redirect to results page
3. Score submission disabled (if already submitted) or available (if not submitted yet)

#### UI Score Locking

**Visual Indicators**:

- Lock icon on final score when score is locked
- Amber-colored banner explaining score status
- Clear messaging for replay attempts
- Disabled submission form for locked scores

### Input Validation

- **Zod Schemas**: Runtime validation for all API inputs
- **Sanitization**: Input cleaning and normalization
- **Type Safety**: TypeScript compilation checks

### Authentication Security

- **JWT Verification**: Secure token validation
- **Creator Key Validation**: Legacy system security
- **User Authorization**: Proper access control

### Rate Limiting

- **Function-Level Limits**: Per-function rate limiting
- **User-Based Limits**: Per-user usage tracking
- **IP-Based Limits**: Additional protection layer

## Deployment Architecture

### Firebase Hosting

- **Global CDN**: Fast content delivery worldwide
- **SSR Support**: Server-side rendering for SEO
- **Custom Domain**: Professional branding

### Firebase Functions

- **Serverless Scaling**: Automatic scaling based on demand
- **Cold Start Optimization**: Memory and timeout configurations
- **Environment Configuration**: Secure environment variables

### Critical Deployment Procedures

**IMPORTANT DEPLOYMENT REQUIREMENTS:**

1. **ALWAYS test locally before deploying to production**

   - Run `npm run build:client` and `npm run build:functions` to verify builds work
   - Test the application locally with emulators to ensure functionality

2. **ALWAYS use `npm run deploy:prod` for production deployments**
   - This script invokes all relevant build and deploy scripts
   - Ensures Assets and SSR pages get correct content types
   - Ensures assets get matching build file names via SSR asset resolver
   - Includes the SSR asset resolver which is critical for preventing 404 errors

### Development Workflow

- **Local Emulation**: Firebase emulators for development
- **CI/CD**: Automated testing and deployment
- **Monitoring**: Comprehensive logging and error tracking

## Testing Strategy

### Unit Testing

- Utility functions and business logic
- Component rendering and interactions
- API endpoint handlers

### Integration Testing

- Database operations
- Authentication flows
- AI service integration

### End-to-End Testing

- Critical user journeys
- Game creation and playing flows
- Authentication scenarios
