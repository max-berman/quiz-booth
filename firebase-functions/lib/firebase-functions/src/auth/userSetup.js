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
exports.userSetup = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
const db = admin.firestore();
// User setup function - called when a new user signs up
exports.userSetup = functions.auth.user().onCreate(async (user) => {
    try {
        // Create initial usage counter for the user
        await db.collection('usageCounters').doc(user.uid).set({
            currentPeriodGamesCreated: 0,
            currentPeriodQuestionsGenerated: 0,
            currentPeriodAiQuestions: 0,
            currentPeriodPlayerSubmissions: 0,
            currentPeriodAnalyticsViews: 0,
            currentPeriodExports: 0,
            currentPeriodCustomThemes: 0,
            lastResetDate: firestore_1.FieldValue.serverTimestamp(),
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        // Create user profile if needed
        await db.collection('users').doc(user.uid).set({
            email: user.email,
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            createdAt: firestore_1.FieldValue.serverTimestamp(),
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        console.log(`User setup completed for ${user.email}`);
    }
    catch (error) {
        console.error('Error setting up user:', error);
    }
});
//# sourceMappingURL=userSetup.js.map