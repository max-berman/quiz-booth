// import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import 'module-alias/register';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin
admin.initializeApp();

// Import function modules
import { createGame, getGame, getGamesByUser, updateGame, updateGameTitle, updateGamePublicStatus, updateGamePrizes, savePlayerScore, getGameLeaderboard, getGamePlayers, getPublicGames, getPublicGamesCount, deleteGame } from './games/games';
import { generateQuestions, generateSingleQuestion, getQuestions, updateQuestion, deleteQuestion, addQuestion } from './questions/questions';
import { trackUsage, getUsage, resetUsage } from './usage/usage';
import { userSetup } from './auth/userSetup';

// Import SSR handler
import { ssrHandler } from './ssr';

// Import API endpoints
import { getGameQuestions, getGamePlayCount } from './api/games';
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
  getGameQuestions,
  getGamePlayCount,
  sendContactForm
};
