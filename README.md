# Trade Show Trivia Application

A comprehensive trivia application that generates AI-powered custom trivia games for trade show booths. The application allows companies to create engaging trivia experiences with questions tailored to their industry and business, helping them attract visitors and capture leads at trade shows.

## 🚀 Features

### Core Functionality

- **AI-Powered Question Generation** - Uses DeepSeek AI to create custom trivia questions based on company information
- **Multi-Step Game Creation** - Intuitive wizard for setting up games with company details, game settings, and prize configuration
- **Real-time Leaderboards** - Live score tracking and player rankings with intelligent caching
- **Cross-Device Authentication** - Firebase Auth with Google Sign-in and legacy creator key support
- **QR Code Sharing** - Dynamic QR codes for easy game distribution at events
- **Comprehensive Analytics** - Player submissions tracking, play counts, and lead capture

### Advanced Features

- **Website-Based Company Detection** - Automatically detects when company names are website URLs for more accurate question generation
- **Flexible Prize System** - Customizable prize tiers (1st place, top 10, etc.) with detailed prize descriptions
- **Question Management** - AI-generated question batches, single question generation with uniqueness checks, and manual editing
- **Category-Based Question Generation** - Support for multiple question categories: Company Facts, Industry Knowledge, Fun Facts, General Knowledge
- **Responsive Design** - Optimized for all devices and screen sizes
- **Intelligent Caching** - Performance-optimized caching for games, questions, and leaderboards

### Technical Features

- **Full-Stack TypeScript** - Type-safe development across frontend and backend
- **Modern UI Components** - Built with Radix UI and Tailwind CSS
- **Real-time Data** - Firebase Firestore integration with real-time updates
- **Error Handling** - Comprehensive error handling with user-friendly messages
- **Rate Limiting** - Protection against API abuse
- **Performance Optimization** - Intelligent caching and optimized bundle loading

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
├── server/                 # Express.js backend API
│   ├── middleware/         # Custom middleware (rate limiting, validation)
│   ├── lib/                # Server utilities (caching, logging)
│   └── routes.ts           # API route definitions
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

- **Runtime**: Node.js with Express.js
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
npm run dev          # Start development server (frontend + backend)
npm run check        # TypeScript type checking
npm run db:push      # Push database schema changes (if using Drizzle)
```

### Production

```bash
npm run build        # Build for production
npm run start        # Start production server
```

## 🔌 API Endpoints

### Game Management

- `POST /api/games` - Create new trivia game (optional auth)
- `GET /api/games/:id` - Get specific game details
- `GET /api/user/games` - Get games for authenticated user
- `PUT /api/user/games/:id` - Update game details
- `PUT /api/user/games/:id/title` - Update game title
- `PUT /api/games/:id/prizes` - Update game prizes

### Question Management

- `POST /api/games/:id/generate-questions` - Generate AI questions for game
- `POST /api/games/:id/generate-single-question` - Generate single question
- `GET /api/games/:id/questions` - Get all questions for a game
- `POST /api/games/:id/add-question` - Add single question to game
- `PUT /api/user/questions/:id` - Update question
- `DELETE /api/user/questions/:id` - Delete question

### Player & Analytics

- `POST /api/games/:id/players` - Submit player score/completion
- `GET /api/games/:id/players` - Get all player submissions (creator only)
- `GET /api/games/:id/leaderboard` - Get game-specific leaderboard
- `GET /api/leaderboard` - Get global leaderboard across all games
- `GET /api/games/:id/play-count` - Get play count for a game

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
2. Modify data access methods in `server/storage.ts`
3. Add API routes in `server/routes.ts`
4. Create frontend components in `client/src/`

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
