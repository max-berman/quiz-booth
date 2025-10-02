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
exports.getGamePlayCount = exports.getGameQuestionsCount = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
// Get questions count for a game
exports.getGameQuestionsCount = functions.https.onRequest(async (req, res) => {
    // Set CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    // Only allow GET requests
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    try {
        // Extract game ID from URL path
        // Handle both direct function calls and rewrites
        let gameId;
        // Try to get from path parameters first (for rewrites)
        if (req.params && req.params.gameId) {
            gameId = req.params.gameId;
        }
        else {
            // Fallback to path parsing for direct function calls
            const pathParts = req.path.split('/');
            gameId = pathParts[pathParts.length - 2]; // Get the game ID from /api/games/{gameId}/questions
        }
        if (!gameId) {
            res.status(400).json({ error: 'Game ID is required' });
            return;
        }
        // Verify game exists
        const gameDoc = await db.collection('games').doc(gameId).get();
        if (!gameDoc.exists) {
            res.status(404).json({ error: 'Game not found' });
            return;
        }
        // Check if game is public or user has access
        // For now, we'll allow access to all games via this endpoint
        // In a production scenario, you might want to add authentication checks
        // Get questions count
        const questionsSnapshot = await db
            .collection('questions')
            .where('gameId', '==', gameId)
            .get();
        const questions = questionsSnapshot.docs.map(doc => doc.data());
        res.status(200).json(questions);
    }
    catch (error) {
        console.error('Get game questions error:', error);
        res.status(500).json({ error: 'Failed to get questions' });
    }
});
// Get play count for a game
exports.getGamePlayCount = functions.https.onRequest(async (req, res) => {
    // Set CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    // Only allow GET requests
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    try {
        // Extract game ID from URL path
        // Handle both direct function calls and rewrites
        let gameId;
        // Try to get from path parameters first (for rewrites)
        if (req.params && req.params.gameId) {
            gameId = req.params.gameId;
        }
        else {
            // Fallback to path parsing for direct function calls
            const pathParts = req.path.split('/');
            gameId = pathParts[pathParts.length - 2]; // Get the game ID from /api/games/{gameId}/play-count
        }
        if (!gameId) {
            res.status(400).json({ error: 'Game ID is required' });
            return;
        }
        // Verify game exists
        const gameDoc = await db.collection('games').doc(gameId).get();
        if (!gameDoc.exists) {
            res.status(404).json({ error: 'Game not found' });
            return;
        }
        // Get play count (number of player submissions)
        const playersSnapshot = await db
            .collection('players')
            .where('gameId', '==', gameId)
            .get();
        const playCount = playersSnapshot.size;
        res.status(200).json({ count: playCount });
    }
    catch (error) {
        console.error('Get game play count error:', error);
        res.status(500).json({ error: 'Failed to get play count' });
    }
});
//# sourceMappingURL=games.js.map