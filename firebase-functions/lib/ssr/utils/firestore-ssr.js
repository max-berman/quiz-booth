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
exports.fetchPageData = void 0;
const admin = __importStar(require("firebase-admin"));
async function fetchPageData(path, query) {
    const db = admin.firestore();
    try {
        switch (path) {
            case '/quiz-games':
                // Fetch public games for SSR
                const gamesSnapshot = await db.collection('games')
                    .where('isPublic', '==', true)
                    .where('status', '==', 'active')
                    .orderBy('createdAt', 'desc')
                    .limit(20)
                    .get();
                const publicGames = gamesSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
                return { publicGames };
            case '/game':
                // Fetch specific game data for SSR if ID is provided
                const gameId = query.id;
                if (gameId && typeof gameId === 'string') {
                    const gameDoc = await db.collection('games').doc(gameId).get();
                    if (gameDoc.exists) {
                        const gameData = gameDoc.data();
                        return {
                            game: {
                                id: gameDoc.id,
                                title: (gameData === null || gameData === void 0 ? void 0 : gameData.title) || 'Untitled Game',
                                description: (gameData === null || gameData === void 0 ? void 0 : gameData.description) || 'No description available',
                                isPublic: (gameData === null || gameData === void 0 ? void 0 : gameData.isPublic) || false
                            }
                        };
                    }
                }
                return {};
            default:
                return {};
        }
    }
    catch (error) {
        console.error('Firestore SSR Error:', error);
        return {};
    }
}
exports.fetchPageData = fetchPageData;
//# sourceMappingURL=firestore-ssr.js.map