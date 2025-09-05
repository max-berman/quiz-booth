# Trade Show Trivia Application

A comprehensive trivia application that generates AI-powered custom trivia games for trade show booths. The application allows companies to create engaging trivia experiences with questions tailored to their industry and business, helping them attract visitors and capture leads at trade shows.

## Features

- **AI-Powered Question Generation** - Uses DeepSeek AI to create custom trivia questions
- **Firebase Authentication** - Cross-device user management with Google Sign-in
- **Real-time Leaderboards** - Track player performance and engagement
- **Game Management Dashboard** - Creator tools for managing multiple games
- **QR Code Sharing** - Easy game distribution at events
- **Analytics & Submissions** - Track player data and lead capture
- **Responsive Design** - Works on all devices and screen sizes

## Available Routes

### **Frontend Routes (Client-side Pages)**

- **`/`** - Home page (landing page)
- **`/setup`** - Create new trivia game form
- **`/game/:id`** - Play trivia game 
- **`/results/:id`** - Game completion results page
- **`/leaderboard/:id?`** - Leaderboard (specific game or global)
- **`/submissions/:id`** - View game submissions/analytics
- **`/edit-questions/:id`** - Edit and add questions to games
- **`/dashboard`** - Creator dashboard (view all your games)
- **`/game-created/:id`** - Game summary page after creation
- **`/auth/sign-in`** - Firebase authentication sign-in
- **`/auth/complete`** - Complete authentication flow
- **`/not-found`** - 404 error page

### **Backend API Routes**

#### **Game Management**
- **`POST /api/games`** - Create new trivia game
- **`GET /api/games/:id`** - Get specific game details
- **`GET /api/creator/games`** - Get games by creator key (legacy)
- **`GET /api/user/games`** - Get games for authenticated user
- **`GET /api/my-games`** - Get user's games (with auth fallback)

#### **Question Management**
- **`POST /api/games/:id/generate-questions`** - Generate AI questions for game
- **`POST /api/games/:id/add-question`** - Add single question to game (authenticated)
- **`GET /api/games/:id/questions`** - Get all questions for a game
- **`PUT /api/questions/:id`** - Update question (creator key)
- **`PUT /api/user/questions/:id`** - Update question (authenticated user)
- **`PUT /api/my-questions/:id`** - Update question (with auth fallback)

#### **Player & Analytics**
- **`POST /api/games/:id/players`** - Submit player score/completion
- **`GET /api/games/:id/players`** - Get all player submissions (creator only)
- **`GET /api/games/:id/leaderboard`** - Get game-specific leaderboard
- **`GET /api/leaderboard`** - Get global leaderboard across all games

### **Authentication Types**
- **No Auth Required** - Public game playing and viewing
- **Optional Auth** - Works with or without authentication
- **Required Auth** - Firebase authentication required
- **Creator Key** - Legacy authentication method (being phased out)

## Technology Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Radix UI
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth with Google Sign-in
- **AI**: DeepSeek API for question generation
- **Deployment**: Replit

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (Firebase config, DeepSeek API key)
4. Run the development server: `npm run dev`

The app uses Firebase authentication for user management and cross-device synchronization, with fallback support for the legacy creator key system during the transition period.