import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

const db = admin.firestore();

// Track usage event
export const trackUsage = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const userId = context.auth.uid;
  const { eventType, metadata } = data;

  try {
    // Record event
    await db.collection('usageEvents').add({
      userId,
      eventType,
      metadata: metadata || {},
      timestamp: Timestamp.now(),
      costUnits: 0,
    });

    // Update counters
    const counterRef = db.collection('usageCounters').doc(userId);
    await counterRef.set(
      {
        [getCounterField(eventType)]: admin.firestore.FieldValue.increment(1),
        lastResetDate: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );

    return { success: true };
  } catch (error) {
    console.error('Track usage error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to track usage');
  }
});

// Get usage data for authenticated user
export const getUsage = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
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
      .where('timestamp', '>=', Timestamp.fromDate(thirtyDaysAgo))
      .orderBy('timestamp', 'desc')
      .limit(100)
      .get();

    const events = eventsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        timestamp: data.timestamp?.toDate?.()?.toISOString(),
      };
    });

    return {
      counters: counterData,
      recentEvents: events,
    };
  } catch (error) {
    console.error('Get usage error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get usage data');
  }
});

// Reset usage counters (admin function)
export const resetUsage = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
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
      lastResetDate: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  } catch (error) {
    console.error('Reset usage error:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to reset usage');
  }
});

// Helper function to get counter field name
function getCounterField(eventType: string): string {
  const fieldMap: Record<string, string> = {
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
async function checkIfAdmin(userId: string): Promise<boolean> {
  // This is a placeholder - implement your own admin check logic
  // For example, you could check against a list of admin user IDs
  const adminUsers = process.env.ADMIN_USERS?.split(',') || [];
  return adminUsers.includes(userId);
}
