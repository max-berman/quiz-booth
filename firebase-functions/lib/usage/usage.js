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
exports.resetUsage = exports.getUsage = exports.trackUsage = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
const db = admin.firestore();
// Track usage event
exports.trackUsage = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const userId = context.auth.uid;
    const { eventType, metadata } = data;
    try {
        // Record event
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
            [getCounterField(eventType)]: admin.firestore.FieldValue.increment(1),
            lastResetDate: firestore_1.Timestamp.now(),
            updatedAt: firestore_1.Timestamp.now(),
        }, { merge: true });
        return { success: true };
    }
    catch (error) {
        console.error('Track usage error:', error);
        throw new functions.https.HttpsError('internal', 'Failed to track usage');
    }
});
// Get usage data for authenticated user
exports.getUsage = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const userId = context.auth.uid;
    try {
        // Get usage counter
        const counterDoc = await db.collection('usageCounters').doc(userId).get();
        const counterData = counterDoc.exists ? counterDoc.data() : {};
        // Get recent usage events (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const eventsSnapshot = await db
            .collection('usageEvents')
            .where('userId', '==', userId)
            .where('timestamp', '>=', firestore_1.Timestamp.fromDate(thirtyDaysAgo))
            .orderBy('timestamp', 'desc')
            .limit(100)
            .get();
        const events = eventsSnapshot.docs.map(doc => {
            var _a, _b, _c;
            const data = doc.data();
            return Object.assign(Object.assign({}, data), { timestamp: (_c = (_b = (_a = data.timestamp) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a)) === null || _c === void 0 ? void 0 : _c.toISOString() });
        });
        return {
            counters: counterData,
            recentEvents: events,
        };
    }
    catch (error) {
        console.error('Get usage error:', error);
        throw new functions.https.HttpsError('internal', 'Failed to get usage data');
    }
});
// Reset usage counters (admin function)
exports.resetUsage = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const userId = context.auth.uid;
    const { targetUserId } = data;
    try {
        // Check if user is admin (you can implement your own admin check logic)
        const isAdmin = await checkIfAdmin(userId);
        if (!isAdmin) {
            throw new functions.https.HttpsError('permission-denied', 'Admin access required');
        }
        // Reset counters for target user
        await db.collection('usageCounters').doc(targetUserId).set({
            currentPeriodGamesCreated: 0,
            currentPeriodQuestionsGenerated: 0,
            currentPeriodAiQuestions: 0,
            currentPeriodPlayerSubmissions: 0,
            currentPeriodAnalyticsViews: 0,
            currentPeriodExports: 0,
            currentPeriodCustomThemes: 0,
            lastResetDate: firestore_1.Timestamp.now(),
            updatedAt: firestore_1.Timestamp.now(),
        });
        return { success: true };
    }
    catch (error) {
        console.error('Reset usage error:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Failed to reset usage');
    }
});
// Helper function to get counter field name
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
// Helper function to check if user is admin (implement your own logic)
async function checkIfAdmin(userId) {
    var _a;
    // This is a placeholder - implement your own admin check logic
    // For example, you could check against a list of admin user IDs
    const adminUsers = ((_a = process.env.ADMIN_USERS) === null || _a === void 0 ? void 0 : _a.split(',')) || [];
    return adminUsers.includes(userId);
}
//# sourceMappingURL=usage.js.map