import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin
admin.initializeApp();

// Import function modules
import { createGame, getGame, getGamesByUser, updateGame, updateGameTitle, updateGamePublicStatus, updateGamePrizes, savePlayerScore, getGameLeaderboard, getGamePlayers, getPublicGames, getPublicGamesCount, deleteGame } from './games/games';
import { generateQuestions, generateSingleQuestion, deleteQuestion, updateQuestion, addQuestion } from './questions/questions';
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
  generateQuestions,
  generateSingleQuestion,
  deleteQuestion,
  updateQuestion,
  addQuestion,
  trackUsage,
  getUsage,
  resetUsage,
  userSetup,
  getGameQuestionsCount,
  getGamePlayCount,
  getQuestions,
  sendContactForm
};
