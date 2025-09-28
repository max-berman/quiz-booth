// import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Import function modules
import { createGame, getGame, getGamesByUser, updateGame, updateGameTitle, updateGamePublicStatus, updateGamePrizes, savePlayerScore, getGameLeaderboard, getGamePlayers } from './games/games';
import { generateQuestions, generateSingleQuestion, getQuestions, updateQuestion, deleteQuestion, addQuestion } from './questions/questions';
import { trackUsage, getUsage, resetUsage } from './usage/usage';
import { userSetup } from './auth/userSetup';

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
  generateQuestions,
  generateSingleQuestion,
  getQuestions,
  updateQuestion,
  deleteQuestion,
  addQuestion,
  trackUsage,
  getUsage,
  resetUsage,
  userSetup
};
