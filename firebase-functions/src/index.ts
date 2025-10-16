import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import 'module-alias/register';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin
admin.initializeApp();

// Import function modules
import { createGame, getGame, getGamesByUser, updateGame, updateGameTitle, updateGamePublicStatus, updateGamePrizes, savePlayerScore, getGameLeaderboard, getGamePlayers, getPublicGames, getPublicGamesCount, deleteGame, getAdminGames } from './games/games-index';
import { generateQuestions, generateSingleQuestion, deleteQuestion, updateQuestion, addQuestion, forceLLMProvider } from './questions';
import { trackUsage, getUsage, resetUsage } from './usage/usage';
import { userSetup } from './auth/userSetup';

// Import API endpoints
import { getGameQuestionsCount, getGamePlayCount, getQuestions } from './api/games';
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
  getAdminGames,
  generateQuestions,
  generateSingleQuestion,
  deleteQuestion,
  updateQuestion,
  addQuestion,
  forceLLMProvider,
  trackUsage,
  getUsage,
  resetUsage,
  userSetup,
  getGameQuestionsCount,
  getGamePlayCount,
  getQuestions,
  sendContactForm
};
