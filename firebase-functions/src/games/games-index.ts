// Barrel export file for games functions
// This maintains the same API structure as the original games.ts file

// Export from game-crud.ts
export { createGame, getGame, getGamesByUser, updateGame, deleteGame } from './game-crud';

// Export from game-updates.ts
export { updateGameTitle, updateGamePublicStatus, updateGamePrizes } from './game-updates';

// Export from game-leaderboard.ts
export { savePlayerScore, getGameLeaderboard, getGamePlayers } from './game-leaderboard';

// Export from game-discovery.ts
export { getPublicGames, getPublicGamesCount, getAdminGames } from './game-discovery';

// Export validation functions if needed externally
export { validateSetupForm, validateScoreSubmission } from './game-validation';

// Export utility functions if needed externally
export { isAdminUser, trackUsage } from './game-utils';
