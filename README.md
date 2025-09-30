# Trade Show Trivia Application

A comprehensive trivia application that generates AI-powered custom trivia games for trade show booths. The application allows companies to create engaging trivia experiences with questions tailored to their industry and business, helping them attract visitors and capture leads at trade shows.

## 🚀 Features

### Core Functionality

- **AI-Powered Question Generation** - Uses DeepSeek AI to create custom trivia questions based on company information
- **Multi-Step Game Creation** - Intuitive wizard for setting up games with company details, game settings, and prize configuration
- **Real-time Leaderboards** - Live score tracking and player rankings with intelligent caching
- **Cross-Device Authentication** - Firebase Auth with Google Sign-in
- **QR Code Sharing** - Dynamic QR codes for easy game distribution at events
- **Comprehensive Analytics** - Player submissions tracking, play counts, and lead capture

### Advanced Features

- **Website-Based Company Detection** - Automatically detects when company names are website URLs for more accurate question generation
- **Flexible Prize System** - Customizable prize tiers with any placement names (1st place, top 10, etc.) with detailed prize descriptions
- **Question Management** - AI-generated question batches, single question generation with uniqueness checks, and manual editing
- **Category-Based Question Generation** - Support for multiple question categories: Company Facts, Industry Knowledge, Fun Facts, General Knowledge
- **Responsive Design** - Optimized for all devices and screen sizes
- **Serverless Architecture** - Firebase Functions for scalable, cost-effective backend

### Technical Features

- **Full-Stack TypeScript** - Type-safe development across frontend and backend
- **Modern UI Components** - Built with Radix UI and Tailwind CSS
- **Real-time Data** - Firebase Firestore integration with real-time updates
- **Error Handling** - Comprehensive error handling with user-friendly messages
- **Performance Optimization** - Optimized Firebase Functions with memory and timeout settings
- **Server-Side Rendering (SSR)** - Firebase Functions SSR for SEO optimization on main pages

## 📁 Project Structure

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
├── attached_assets/        # Documentation and asset files
└── dist/                   # Build output (generated)
```

## 🛠️ Technology Stack

### Frontend

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom theme
- **UI Components**: Radix UI (fully accessible components)
- **Routing**: Wouter (lightweight router)
- **State Management**: React Query for server state, Context API for auth
- **Authentication**: Firebase Auth with Google Sign-in

### Backend

- **Runtime**: Firebase Functions (Node.js)
- **Language**: TypeScript
- **Database**: Firebase Firestore
- **Authentication**: Firebase Admin SDK
- **AI Integration**: DeepSeek API for question generation

### Development Tools

- **Package Manager**: npm
- **Type Checking**: TypeScript 5.6
- **Code Quality**: ESLint, Prettier
- **Build System**: Vite + esbuild

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project with Firestore database
- DeepSeek API key

### Installation & Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/max-berman/quiz-booth.git
   cd quiz-booth
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:

   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id

   # DeepSeek API Key
   DEEPSEEK_API_KEY=your_deepseek_api_key
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   npm run start
   ```

## 📚 Available Commands

### Development

```bash
npm run dev          # Show development options
npm run dev:client   # Start client development server
npm run emulate      # Start Firebase emulators
```

### Production

```bash
npm run build:client    # Build client for production
npm run build:functions # Build Firebase Functions
npm run deploy:all      # Deploy everything to Firebase
```

## 🔌 Firebase Functions API

### Game Management

- `createGame` - Create new trivia game (requires auth)
- `getGame` - Get specific game details
- `getGamesByUser` - Get games for authenticated user
- `updateGame` - Update game details
- `updateGameTitle` - Update game title
- `updateGamePrizes` - Update game prizes with flexible format

### Question Management

- `generateQuestions` - Generate AI questions for game
- `generateSingleQuestion` - Generate single question
- `getQuestions` - Get all questions for a game
- `addQuestion` - Add single question to game
- `updateQuestion` - Update question
- `deleteQuestion` - Delete question

### Player & Analytics

- `savePlayerScore` - Submit player score/completion
- `getGameLeaderboard` - Get game-specific leaderboard
- `trackUsage` - Track usage events
- `getUsage` - Get usage statistics

## 🔐 Authentication System

The application supports dual authentication systems:

### Firebase Auth (Preferred)

- Google Sign-in integration
- User-based game ownership via `userId` field
- JWT token authentication
- Cross-device synchronization

### Legacy Creator Keys

- Server-generated unique keys for game creators
- Stored in `games.creatorKey` field
- Used via `X-Creator-Key` header
- Being phased out in favor of Firebase Auth

### Dual Auth Implementation

Many endpoints support both systems with graceful fallback:

- Routes like `/api/my-games` try Firebase auth first, then creator keys
- `optionalFirebaseAuth` middleware allows both authenticated and anonymous access
- Frontend components adapt UI based on authentication state

## 🎮 Game Creation Process

1. **Setup Wizard** - Multi-step form for company information, game settings, and prizes
2. **AI Question Generation** - Automatic generation of questions based on company/industry context
3. **Question Management** - Edit, add, or regenerate questions as needed
4. **Game Distribution** - Share via QR codes, embed links, or direct URLs
5. **Analytics Tracking** - Monitor player engagement and capture leads

## 🏗️ Architecture Patterns

### Monorepo Structure

- Clear separation between client, server, and shared code
- Shared TypeScript types for type safety
- Consistent development experience

### Caching Strategy

- Intelligent caching with appropriate TTLs:
  - Games: 2 minutes
  - Questions: 1 minute
  - Leaderboards: 30 seconds
- Cache invalidation on data modifications

### Error Handling

- Structured error responses with consistent formats
- Comprehensive logging for debugging
- User-friendly error messages

### Performance Optimization

- Lazy loading for routes and components
- Optimized bundle splitting
- Efficient API response caching

## 📊 Database Schema

### Games Collection

- `id` - Unique game identifier
- `gameTitle` - AI-generated or user-edited title
- `companyName` - Company name or website URL
- `industry` - Selected industry category
- `questionCount` - Number of questions (5, 10, or 15)
- `difficulty` - Game difficulty level
- `categories` - Array of question categories
- `prizes` - Flexible prize configuration
- `creatorKey` - Legacy creator authentication
- `userId` - Firebase user ID (optional)

### Questions Collection

- `id` - Unique question identifier
- `gameId` - Reference to parent game
- `questionText` - The question content
- `options` - Array of 4 answer choices
- `correctAnswer` - Index of correct option (0-3)
- `explanation` - Answer explanation
- `order` - Display order in game

### Players Collection

- `id` - Unique player identifier
- `name` - Player name
- `company` - Player's company (optional)
- `gameId` - Reference to played game
- `score` - Player score
- `correctAnswers` - Number of correct answers
- `timeSpent` - Time taken to complete (seconds)

## 🔧 Development Guidelines

### Adding New Features

1. Update shared types in `shared/firebase-types.ts`
2. Add new Firebase Functions in `firebase-functions/src/`
3. Create frontend components in `client/src/`

### Code Style

- Use TypeScript for type safety
- Follow React best practices with hooks
- Use Tailwind CSS for styling
- Implement proper error boundaries
- Write comprehensive error handling

### Testing

- Unit tests for utility functions
- Integration tests for API endpoints
- End-to-end tests for critical user flows

## 🚢 Deployment

### Replit Deployment

The application is optimized for Replit deployment with:

- Automatic environment variable configuration
- Built-in Vite integration
- Easy scaling and monitoring

### Manual Deployment

1. Build the application: `npm run build`
2. Deploy the `dist` directory to your hosting platform
3. Configure environment variables
4. Set up Firebase project and DeepSeek API

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper TypeScript types
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:

- Check the existing documentation
- Review the API endpoints
- Examine the error logs
- Contact the development team

---

**Built with modern web technologies for optimal performance and developer experience.**
