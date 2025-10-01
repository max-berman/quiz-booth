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
