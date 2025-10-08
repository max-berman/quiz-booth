import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin
// For emulator environment, we need to provide explicit configuration
if (process.env.FUNCTIONS_EMULATOR === 'true' || process.env.FIRESTORE_EMULATOR_HOST) {
  // Initialize with emulator configuration
  admin.initializeApp({
    projectId: 'trivia-games-7a81b',
    storageBucket: 'trivia-games-7a81b.appspot.com'
  });

  // Configure emulator settings
  process.env.STORAGE_EMULATOR_HOST = 'localhost:9199';

  // Configure Firebase Admin to use emulator for Firestore
  admin.firestore().settings({
    host: 'localhost:8081',
    ssl: false
  });

  console.log('Firebase Admin initialized with emulator configuration');
} else {
  // Initialize for production with explicit configuration
  admin.initializeApp({
    projectId: 'trivia-games-7a81b',
    storageBucket: 'trivia-games-7a81b.appspot.com'
  });
  console.log('Firebase Admin initialized for production - image upload fix deployed');
}

// Import function modules
import { createGame, getGame, getGamesByUser, updateGame, updateGameTitle, updateGamePublicStatus, updateGamePrizes, savePlayerScore, getGameLeaderboard, getGamePlayers, getPublicGames, getPublicGamesCount, deleteGame } from './games/games';
import { generateImageUploadUrl, handleImageUploadComplete, deleteGameImage } from './games/upload-logo';
import { directImageUpload } from './games/direct-upload';
import { generateQuestions, generateSingleQuestion, getQuestions, updateQuestion, deleteQuestion, addQuestion } from './questions/questions';
import { trackUsage, getUsage, resetUsage } from './usage/usage';
import { userSetup } from './auth/userSetup';

// Import SSR handler
import { ssrHandler } from './ssr';

// Import API endpoints
import { getGameQuestionsCount, getGamePlayCount } from './api/games';
import { sendContactForm } from './api/contact';

// Export all functions
export {
  createGame,
  getGame,
  getGamesByUser,
  updateGame,
  updateGameTitle,
  updateGamePublicStatus,
  updateGamePrizes,
  savePlayerScore,
  getGameLeaderboard,
  getGamePlayers,
  getPublicGames,
  getPublicGamesCount,
  deleteGame,
  generateImageUploadUrl,
  handleImageUploadComplete,
  deleteGameImage,
  directImageUpload,
  generateQuestions,
  generateSingleQuestion,
  getQuestions,
  updateQuestion,
  deleteQuestion,
  addQuestion,
  trackUsage,
  getUsage,
  resetUsage,
  userSetup,
  ssrHandler,
  getGameQuestionsCount,
  getGamePlayCount,
  sendContactForm
};
