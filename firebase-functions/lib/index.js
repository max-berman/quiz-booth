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
exports.userSetup = exports.resetUsage = exports.getUsage = exports.trackUsage = exports.addQuestion = exports.deleteQuestion = exports.updateQuestion = exports.getQuestions = exports.generateSingleQuestion = exports.generateQuestions = exports.getPublicGamesCount = exports.getPublicGames = exports.getGamePlayers = exports.getGameLeaderboard = exports.savePlayerScore = exports.updateGamePrizes = exports.updateGamePublicStatus = exports.updateGameTitle = exports.updateGame = exports.getGamesByUser = exports.getGame = exports.createGame = void 0;
// import * as functions from 'firebase-functions';
const admin = __importStar(require("firebase-admin"));
const dotenv = __importStar(require("dotenv"));
// Load environment variables
dotenv.config();
// Initialize Firebase Admin
admin.initializeApp();
// Import function modules
const games_1 = require("./games/games");
Object.defineProperty(exports, "createGame", { enumerable: true, get: function () { return games_1.createGame; } });
Object.defineProperty(exports, "getGame", { enumerable: true, get: function () { return games_1.getGame; } });
Object.defineProperty(exports, "getGamesByUser", { enumerable: true, get: function () { return games_1.getGamesByUser; } });
Object.defineProperty(exports, "updateGame", { enumerable: true, get: function () { return games_1.updateGame; } });
Object.defineProperty(exports, "updateGameTitle", { enumerable: true, get: function () { return games_1.updateGameTitle; } });
Object.defineProperty(exports, "updateGamePublicStatus", { enumerable: true, get: function () { return games_1.updateGamePublicStatus; } });
Object.defineProperty(exports, "updateGamePrizes", { enumerable: true, get: function () { return games_1.updateGamePrizes; } });
Object.defineProperty(exports, "savePlayerScore", { enumerable: true, get: function () { return games_1.savePlayerScore; } });
Object.defineProperty(exports, "getGameLeaderboard", { enumerable: true, get: function () { return games_1.getGameLeaderboard; } });
Object.defineProperty(exports, "getGamePlayers", { enumerable: true, get: function () { return games_1.getGamePlayers; } });
Object.defineProperty(exports, "getPublicGames", { enumerable: true, get: function () { return games_1.getPublicGames; } });
Object.defineProperty(exports, "getPublicGamesCount", { enumerable: true, get: function () { return games_1.getPublicGamesCount; } });
const questions_1 = require("./questions/questions");
Object.defineProperty(exports, "generateQuestions", { enumerable: true, get: function () { return questions_1.generateQuestions; } });
Object.defineProperty(exports, "generateSingleQuestion", { enumerable: true, get: function () { return questions_1.generateSingleQuestion; } });
Object.defineProperty(exports, "getQuestions", { enumerable: true, get: function () { return questions_1.getQuestions; } });
Object.defineProperty(exports, "updateQuestion", { enumerable: true, get: function () { return questions_1.updateQuestion; } });
Object.defineProperty(exports, "deleteQuestion", { enumerable: true, get: function () { return questions_1.deleteQuestion; } });
Object.defineProperty(exports, "addQuestion", { enumerable: true, get: function () { return questions_1.addQuestion; } });
const usage_1 = require("./usage/usage");
Object.defineProperty(exports, "trackUsage", { enumerable: true, get: function () { return usage_1.trackUsage; } });
Object.defineProperty(exports, "getUsage", { enumerable: true, get: function () { return usage_1.getUsage; } });
Object.defineProperty(exports, "resetUsage", { enumerable: true, get: function () { return usage_1.resetUsage; } });
const userSetup_1 = require("./auth/userSetup");
Object.defineProperty(exports, "userSetup", { enumerable: true, get: function () { return userSetup_1.userSetup; } });
//# sourceMappingURL=index.js.map