"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicGamesCount = exports.getPublicGames = exports.getGamePlayers = exports.getGameLeaderboard = exports.savePlayerScore = exports.updateGamePrizes = exports.updateGamePublicStatus = exports.updateGameTitle = exports.updateGame = exports.getGamesByUser = exports.getGame = exports.createGame = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const crypto_1 = require("crypto");
const firestore_1 = require("firebase-admin/firestore");
const rate_limit_1 = require("../lib/rate-limit");
const db = admin.firestore();
// Helper function to track usage
async function trackUsage(userId, eventType, metadata) {
    try {
        await db.collection('usageEvents').add({
            userId,
            eventType,
            metadata: metadata || {},
            timestamp: firestore_1.Timestamp.now(),
            costUnits: 0,
        });
        // Update counters
        const counterRef = db.collection('usageCounters').doc(userId);
        await counterRef.set({
            [getCounterField(eventType)]: firestore_1.FieldValue.increment(1),
            lastResetDate: firestore_1.Timestamp.now(),
            updatedAt: firestore_1.Timestamp.now(),
        }, { merge: true });
    }
    catch (error) {
        console.error('Usage tracking error:', error);
    }
}
function getCounterField(eventType) {
    const fieldMap = {
        game_created: 'currentPeriodGamesCreated',
        question_generated: 'currentPeriodQuestionsGenerated',
        ai_question_generated: 'currentPeriodAiQuestions',
        player_submission: 'currentPeriodPlayerSubmissions',
        analytics_viewed: 'currentPeriodAnalyticsViews',
        export_used: 'currentPeriodExports',
        custom_theme_applied: 'currentPeriodCustomThemes',
    };
    return fieldMap[eventType] || 'currentPeriodGamesCreated';
}
// Create a new game
exports.createGame = functions.runWith({
    memory: '256MB',
    timeoutSeconds: 60
}).https.onCall(async (data, context) => {
    // Authentication check
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const userId = context.auth.uid;
    const { title, description, questionCount, difficulty, categories, companyName, productDescription, prizes } = data;
    try {
        // Rate limiting check
        await (0, rate_limit_1.withRateLimit)(rate_limit_1.rateLimitConfigs.gameCreation)(data, context);
        // Usage tracking
        await trackUsage(userId, 'game_created', {
            questionCount,
            difficulty,
            categories,
        });
        // Create game in Firestore
        const gameId = (0, crypto_1.randomUUID)();
        const creatorKey = (0, crypto_1.randomUUID)();
        const now = new Date();
        // Convert prizes array to object format for storage
        let prizesObject = null;
        if (prizes && Array.isArray(prizes) && prizes.length > 0) {
            prizesObject = {};
            prizes.forEach(prize => {
                if (prize.placement.trim() && prize.prize.trim()) {
                    // Use the placement as the key (normalized)
                    const key = prize.placement.toLowerCase().replace(/\s+/g, '_');
                    prizesObject[key] = prize.prize;
                }
            });
        }
        const gameData = {
            id: gameId,
            gameTitle: title || null,
            companyName,
            industry: description || '',
            productDescription: productDescription || null,
            questionCount,
            difficulty,
            categories,
            prizes: prizesObject,
            creatorKey,
            userId,
            createdAt: firestore_1.Timestamp.fromDate(now),
            modifiedAt: firestore_1.Timestamp.fromDate(now),
            status: 'draft',
            isPublic: true,
        };
        await db.collection('games').doc(gameId).set(gameData);
        return {
            id: gameId,
            gameTitle: title,
            companyName,
            industry: description,
            productDescription,
            questionCount,
            difficulty,
            categories,
            creatorKey,
            userId,
            createdAt: now.toISOString(),
            modifiedAt: now.toISOString(),
        };
    }
    catch (error) {
        console.error('Create game error:', error);
        throw new functions.https.HttpsError('internal', 'Failed to create game');
    }
});
// Get game by ID
exports.getGame = functions.https.onCall(async (data, context) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    const { gameId } = data;
    try {
        const gameDoc = await db.collection('games').doc(gameId).get();
        if (!gameDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Game not found');
        }
        const gameData = gameDoc.data();
        // Convert prizes object to array format for frontend
        const prizesArray = (gameData === null || gameData === void 0 ? void 0 : gameData.prizes) ? Object.entries(gameData.prizes).map(([key, value]) => ({
            placement: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            prize: value
        })).filter(p => p.prize) : [];
        // Check if user has access
        if (context.auth && (gameData === null || gameData === void 0 ? void 0 : gameData.userId) === context.auth.uid) {
            // User owns the game, return full data
            return Object.assign(Object.assign({}, gameData), { prizes: prizesArray, createdAt: (_c = (_b = (_a = gameData === null || gameData === void 0 ? void 0 : gameData.createdAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a)) === null || _c === void 0 ? void 0 : _c.toISOString(), modifiedAt: (_f = (_e = (_d = gameData === null || gameData === void 0 ? void 0 : gameData.modifiedAt) === null || _d === void 0 ? void 0 : _d.toDate) === null || _e === void 0 ? void 0 : _e.call(_d)) === null || _f === void 0 ? void 0 : _f.toISOString() });
        }
        else if (gameData === null || gameData === void 0 ? void 0 : gameData.isPublic) {
            // Public game, return limited data
            return {
                id: gameData.id,
                gameTitle: gameData.gameTitle,
                companyName: gameData.companyName,
                industry: gameData.industry,
                prizes: prizesArray,
                isPublic: true,
                createdAt: (_j = (_h = (_g = gameData === null || gameData === void 0 ? void 0 : gameData.createdAt) === null || _g === void 0 ? void 0 : _g.toDate) === null || _h === void 0 ? void 0 : _h.call(_g)) === null || _j === void 0 ? void 0 : _j.toISOString(),
            };
        }
        else {
            // Shared game (not public but accessible via direct link)
            // Return limited data for shared games
            return {
                id: gameData === null || gameData === void 0 ? void 0 : gameData.id,
                gameTitle: gameData === null || gameData === void 0 ? void 0 : gameData.gameTitle,
                companyName: gameData === null || gameData === void 0 ? void 0 : gameData.companyName,
                industry: gameData === null || gameData === void 0 ? void 0 : gameData.industry,
                prizes: prizesArray,
                isPublic: false,
                createdAt: (_m = (_l = (_k = gameData === null || gameData === void 0 ? void 0 : gameData.createdAt) === null || _k === void 0 ? void 0 : _k.toDate) === null || _l === void 0 ? void 0 : _l.call(_k)) === null || _m === void 0 ? void 0 : _m.toISOString(),
            };
        }
    }
    catch (error) {
        console.error('Get game error:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Failed to get game');
    }
});
// Get games by authenticated user
exports.getGamesByUser = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const userId = context.auth.uid;
    try {
        const gamesSnapshot = await db
            .collection('games')
            .where('userId', '==', userId)
            .get();
        const games = gamesSnapshot.docs.map(doc => {
            var _a, _b, _c, _d, _e, _f;
            const data = doc.data();
            // Convert prizes object to array format for frontend
            const prizesArray = (data === null || data === void 0 ? void 0 : data.prizes) ? Object.entries(data.prizes).map(([key, value]) => ({
                placement: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                prize: value
            })).filter(p => p.prize) : [];
            return Object.assign(Object.assign({}, data), { prizes: prizesArray, createdAt: (_c = (_b = (_a = data.createdAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a)) === null || _c === void 0 ? void 0 : _c.toISOString(), modifiedAt: (_f = (_e = (_d = data.modifiedAt) === null || _d === void 0 ? void 0 : _d.toDate) === null || _e === void 0 ? void 0 : _e.call(_d)) === null || _f === void 0 ? void 0 : _f.toISOString() });
        });
        // Sort by creation date (newest first)
        return games.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    catch (error) {
        console.error('Get user games error:', error);
        throw new functions.https.HttpsError('internal', 'Failed to get user games');
    }
});
// Update game
exports.updateGame = functions.https.onCall(async (data, context) => {
    var _a, _b, _c, _d, _e, _f;
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const userId = context.auth.uid;
    const { gameId, updates } = data;
    try {
        // Verify user owns the game
        const gameDoc = await db.collection('games').doc(gameId).get();
        if (!gameDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Game not found');
        }
        const gameData = gameDoc.data();
        if ((gameData === null || gameData === void 0 ? void 0 : gameData.userId) !== userId) {
            throw new functions.https.HttpsError('permission-denied', 'Access denied');
        }
        // Filter out fields that shouldn't be updated
        const allowedUpdates = Object.assign({}, updates);
        delete allowedUpdates.id;
        delete allowedUpdates.creatorKey;
        delete allowedUpdates.userId;
        delete allowedUpdates.createdAt;
        // Update game
        const now = new Date();
        await db.collection('games').doc(gameId).update(Object.assign(Object.assign({}, allowedUpdates), { modifiedAt: firestore_1.Timestamp.fromDate(now) }));
        // Get updated game
        const updatedGameDoc = await db.collection('games').doc(gameId).get();
        const updatedGame = updatedGameDoc.data();
        return Object.assign(Object.assign({}, updatedGame), { createdAt: (_c = (_b = (_a = updatedGame === null || updatedGame === void 0 ? void 0 : updatedGame.createdAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a)) === null || _c === void 0 ? void 0 : _c.toISOString(), modifiedAt: (_f = (_e = (_d = updatedGame === null || updatedGame === void 0 ? void 0 : updatedGame.modifiedAt) === null || _d === void 0 ? void 0 : _d.toDate) === null || _e === void 0 ? void 0 : _e.call(_d)) === null || _f === void 0 ? void 0 : _f.toISOString() });
    }
    catch (error) {
        console.error('Update game error:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Failed to update game');
    }
});
// Update game title
exports.updateGameTitle = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const userId = context.auth.uid;
    const { gameId, gameTitle } = data;
    try {
        // Verify user owns the game
        const gameDoc = await db.collection('games').doc(gameId).get();
        if (!gameDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Game not found');
        }
        const gameData = gameDoc.data();
        if ((gameData === null || gameData === void 0 ? void 0 : gameData.userId) !== userId) {
            throw new functions.https.HttpsError('permission-denied', 'Access denied');
        }
        // Update game title
        const now = new Date();
        await db.collection('games').doc(gameId).update({
            gameTitle,
            modifiedAt: firestore_1.Timestamp.fromDate(now),
        });
        return { success: true, gameTitle };
    }
    catch (error) {
        console.error('Update game title error:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Failed to update game title');
    }
});
// Update game public status
exports.updateGamePublicStatus = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const userId = context.auth.uid;
    const { gameId, isPublic } = data;
    try {
        // Verify user owns the game
        const gameDoc = await db.collection('games').doc(gameId).get();
        if (!gameDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Game not found');
        }
        const gameData = gameDoc.data();
        if ((gameData === null || gameData === void 0 ? void 0 : gameData.userId) !== userId) {
            throw new functions.https.HttpsError('permission-denied', 'Access denied');
        }
        // Update game public status
        const now = new Date();
        await db.collection('games').doc(gameId).update({
            isPublic,
            modifiedAt: firestore_1.Timestamp.fromDate(now),
        });
        return { success: true, isPublic };
    }
    catch (error) {
        console.error('Update game public status error:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Failed to update game public status');
    }
});
// Update game prizes
exports.updateGamePrizes = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const userId = context.auth.uid;
    const { gameId, prizes } = data;
    try {
        // Verify user owns the game
        const gameDoc = await db.collection('games').doc(gameId).get();
        if (!gameDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Game not found');
        }
        const gameData = gameDoc.data();
        if ((gameData === null || gameData === void 0 ? void 0 : gameData.userId) !== userId) {
            throw new functions.https.HttpsError('permission-denied', 'Access denied');
        }
        // Update prizes
        const now = new Date();
        await db.collection('games').doc(gameId).update({
            prizes,
            modifiedAt: firestore_1.Timestamp.fromDate(now),
        });
        // Convert prizes object to array format for frontend response
        const prizesArray = prizes ? Object.entries(prizes).map(([key, value]) => ({
            placement: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            prize: value
        })).filter(p => p.prize) : [];
        return { success: true, prizes: prizesArray };
    }
    catch (error) {
        console.error('Update game prizes error:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Failed to update game prizes');
    }
});
// Save player score to leaderboard
exports.savePlayerScore = functions.https.onCall(async (data, context) => {
    const { gameId, playerName, company, score, correctAnswers, totalQuestions, timeSpent } = data;
    try {
        // Verify game exists
        const gameDoc = await db.collection('games').doc(gameId).get();
        if (!gameDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Game not found');
        }
        const gameData = gameDoc.data();
        // Check if game is public or user has access
        if (!(gameData === null || gameData === void 0 ? void 0 : gameData.isPublic) && (!context.auth || (gameData === null || gameData === void 0 ? void 0 : gameData.userId) !== context.auth.uid)) {
            throw new functions.https.HttpsError('permission-denied', 'Access denied');
        }
        // Usage tracking (if authenticated)
        if (context.auth) {
            await trackUsage(context.auth.uid, 'player_submission', {
                gameId,
                score,
                correctAnswers,
                totalQuestions,
                timeSpent,
            });
        }
        // Create player record
        const playerId = (0, crypto_1.randomUUID)();
        const now = new Date();
        const playerData = {
            id: playerId,
            gameId,
            name: playerName,
            company: company || null,
            score,
            correctAnswers,
            totalQuestions,
            timeSpent,
            completedAt: firestore_1.Timestamp.fromDate(now),
        };
        await db.collection('players').doc(playerId).set(playerData);
        return { success: true, playerId };
    }
    catch (error) {
        console.error('Save player score error:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Failed to save player score');
    }
});
// Get leaderboard for a game
exports.getGameLeaderboard = functions.https.onCall(async (data, context) => {
    const { gameId } = data;
    try {
        // Verify game exists
        const gameDoc = await db.collection('games').doc(gameId).get();
        if (!gameDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Game not found');
        }
        const gameData = gameDoc.data();
        // Check if game is public or user has access
        if (!(gameData === null || gameData === void 0 ? void 0 : gameData.isPublic) && (!context.auth || (gameData === null || gameData === void 0 ? void 0 : gameData.userId) !== context.auth.uid)) {
            throw new functions.https.HttpsError('permission-denied', 'Access denied');
        }
        // Get players for this game, ordered by score (descending) and time (ascending)
        const playersSnapshot = await db
            .collection('players')
            .where('gameId', '==', gameId)
            .orderBy('score', 'desc')
            .orderBy('timeSpent', 'asc')
            .limit(100) // Limit to top 100 players
            .get();
        const players = playersSnapshot.docs.map(doc => {
            var _a, _b, _c;
            const data = doc.data();
            return Object.assign(Object.assign({}, data), { completedAt: (_c = (_b = (_a = data.completedAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a)) === null || _c === void 0 ? void 0 : _c.toISOString() });
        });
        return players;
    }
    catch (error) {
        console.error('Get game leaderboard error:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Failed to get leaderboard');
    }
});
// Get all players (submissions) for a game - for creator access
exports.getGamePlayers = functions.https.onCall(async (data, context) => {
    const { gameId } = data;
    try {
        // Verify game exists
        const gameDoc = await db.collection('games').doc(gameId).get();
        if (!gameDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Game not found');
        }
        const gameData = gameDoc.data();
        // Check if user is authenticated and owns the game
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
        }
        if ((gameData === null || gameData === void 0 ? void 0 : gameData.userId) !== context.auth.uid) {
            throw new functions.https.HttpsError('permission-denied', 'Access denied - only game creator can view submissions');
        }
        // Get all players for this game (temporarily without ordering to test)
        const playersSnapshot = await db
            .collection('players')
            .where('gameId', '==', gameId)
            .get();
        const players = playersSnapshot.docs.map(doc => {
            var _a, _b, _c;
            const data = doc.data();
            return Object.assign(Object.assign({}, data), { completedAt: (_c = (_b = (_a = data.completedAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a)) === null || _c === void 0 ? void 0 : _c.toISOString() });
        });
        // Sort manually by completedAt (newest first)
        players.sort((a, b) => {
            const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
            const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
            return dateB - dateA;
        });
        return players;
    }
    catch (error) {
        console.error('Get game players error:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Failed to get players data');
    }
});
// Get public games (no authentication required)
exports.getPublicGames = functions.https.onCall(async (data, context) => {
    const { limit = 12, offset = 0, industry, categories } = data;
    try {
        // Get public games, ordered by creation date (newest first)
        let gamesQuery = db
            .collection('games')
            .where('isPublic', '==', true);
        // Apply filters if provided
        if (industry && industry !== 'all') {
            gamesQuery = gamesQuery.where('industry', '==', industry);
        }
        // Apply category filter if provided
        if (categories && categories.length > 0) {
            // For categories, we need to check if the game's categories array contains any of the selected categories
            // Firestore doesn't support array-contains-any with multiple conditions, so we'll filter client-side
            // For now, we'll get all games and filter client-side for categories
        }
        gamesQuery = gamesQuery.orderBy('createdAt', 'desc');
        // Apply limit and offset
        if (limit) {
            gamesQuery = gamesQuery.limit(limit);
        }
        if (offset) {
            // Note: Firestore doesn't support offset directly, so we'd need to use cursor-based pagination
            // For now, we'll skip offset and just use limit
        }
        const gamesSnapshot = await gamesQuery.get();
        let games = gamesSnapshot.docs.map(doc => {
            var _a, _b, _c, _d, _e, _f;
            const data = doc.data();
            // Convert prizes object to array format for frontend
            const prizesArray = (data === null || data === void 0 ? void 0 : data.prizes) ? Object.entries(data.prizes).map(([key, value]) => ({
                placement: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                prize: value
            })).filter(p => p.prize) : [];
            return {
                id: data.id,
                gameTitle: data.gameTitle,
                companyName: data.companyName,
                industry: data.industry,
                productDescription: data.productDescription,
                questionCount: data.questionCount,
                difficulty: data.difficulty,
                categories: data.categories,
                prizes: prizesArray,
                isPublic: data.isPublic,
                createdAt: (_c = (_b = (_a = data.createdAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a)) === null || _c === void 0 ? void 0 : _c.toISOString(),
                modifiedAt: (_f = (_e = (_d = data.modifiedAt) === null || _d === void 0 ? void 0 : _d.toDate) === null || _e === void 0 ? void 0 : _e.call(_d)) === null || _f === void 0 ? void 0 : _f.toISOString(),
            };
        });
        // Apply category filter client-side if needed
        if (categories && categories.length > 0) {
            games = games.filter(game => game.categories && game.categories.some((category) => categories.includes(category)));
        }
        return games;
    }
    catch (error) {
        console.error('Get public games error:', error);
        throw new functions.https.HttpsError('internal', 'Failed to get public games');
    }
});
// Get public games count (no authentication required)
exports.getPublicGamesCount = functions.https.onCall(async (data, context) => {
    try {
        const gamesSnapshot = await db
            .collection('games')
            .where('isPublic', '==', true)
            .get();
        return { count: gamesSnapshot.size };
    }
    catch (error) {
        console.error('Get public games count error:', error);
        throw new functions.https.HttpsError('internal', 'Failed to get public games count');
    }
});
//# sourceMappingURL=games.js.map