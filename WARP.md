# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Architecture Overview

This is a **Trade Show Trivia Application** that generates AI-powered custom trivia games for trade show booths. The application uses a modern full-stack architecture with TypeScript throughout.

### Key Architectural Patterns

- **Monorepo Structure**: The codebase is organized as a monorepo with `client/`, `server/`, and `shared/` directories
- **Full-Stack TypeScript**: Both frontend and backend use TypeScript with shared type definitions
- **Firebase Integration**: Dual authentication system supporting both Firebase Auth and legacy creator keys
- **AI-Powered Content**: DeepSeek AI integration for dynamic question generation
- **Real-time Data**: Firebase Firestore for real-time game state and leaderboards

### Directory Structure

```
quiz-booth/
├── client/src/           # React frontend with Vite
├── server/              # Express.js backend
├── shared/              # Shared TypeScript types and schemas
├── attached_assets/     # Asset files and images
└── dist/                # Build output (generated)
```

### Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Radix UI, Wouter (routing)
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: Firebase Firestore (with Drizzle ORM schemas for type safety)
- **Authentication**: Firebase Auth (Google Sign-in) + legacy creator key system
- **AI**: DeepSeek API for question generation
- **Deployment**: Replit

### Key Components

- **Authentication Flow**: Dual auth system in transition from creator keys to Firebase Auth
- **Game Management**: Create, edit, and manage trivia games with analytics
- **Question Generation**: AI-powered question creation based on company/industry context
- **Real-time Features**: Live leaderboards and game submissions tracking
- **QR Code Sharing**: Dynamic QR codes for easy game distribution at trade shows

## Essential Commands

### Development Workflow
```bash
# Install dependencies
npm install

# Start development server (both frontend and backend)
npm run dev

# Type checking
npm run check

# Database operations (if using Drizzle migrations)
npm run db:push
```

### Build and Deploy
```bash
# Build for production
npm run build

# Start production server
npm run start
```

### Environment Setup
The application requires these environment variables:
- `DEEPSEEK_API_KEY`: API key for AI question generation
- Firebase configuration variables (already configured)

## Authentication Architecture

The application is currently in transition between two authentication systems:

### Legacy System (Creator Keys)
- Server-generated unique keys for game creators
- Stored in `games.creatorKey` field
- Used via `X-Creator-Key` header

### Firebase Auth (Current/Preferred)
- Google Sign-in integration
- User-based game ownership via `userId` field
- JWT token authentication

### Dual Auth Implementation
Many endpoints support both systems with graceful fallback:
- Routes like `/api/my-games` try Firebase auth first, then creator keys
- `optionalFirebaseAuth` middleware allows both authenticated and anonymous access
- Frontend components adapt UI based on authentication state

## API Architecture

### Route Categories

1. **Game Management**: Create, retrieve, and manage trivia games
2. **Question Management**: AI generation and manual editing of questions
3. **Player Analytics**: Score tracking, leaderboards, and submissions
4. **Authentication**: Firebase auth flow completion

### Key API Patterns

- **Authentication Flexibility**: Most routes support both Firebase auth and creator keys
- **Error Handling**: Consistent error response format with detailed logging
- **Rate Limiting**: Applied to all `/api` routes
- **Database Timeouts**: Query timeout middleware for reliability

## Development Notes

### Firebase Integration
- Client-side Firebase config in `client/src/lib/firebase.ts`
- Server-side Firebase Admin in `server/firebase.ts`
- Auth context provider manages user state across the app

### AI Question Generation
- DeepSeek API integration with category-specific prompting
- Supports different question categories: Company Facts, Industry Knowledge, Fun Facts
- JSON-structured responses with validation

### State Management
- React Query for server state management
- Context API for authentication state
- Local storage for email sign-in persistence

### UI Components
- Radix UI component library for accessibility
- Tailwind CSS for styling with custom theme
- Responsive design for mobile and desktop

## Common Development Tasks

### Adding New Game Features
1. Update `shared/schema.ts` for database schema changes
2. Modify `server/storage.ts` for data access methods
3. Add API routes in `server/routes.ts`
4. Create frontend components and pages in `client/src/`

### Debugging Authentication Issues
- Check Firebase console for authorized domains
- Verify environment variables are set correctly
- Use browser dev tools to inspect JWT tokens
- Check server logs for authentication middleware output

### Testing AI Question Generation
- Ensure `DEEPSEEK_API_KEY` is configured
- Test with different company/industry combinations
- Check API rate limits and error handling
- Verify question format matches expected schema
