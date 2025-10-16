import * as admin from 'firebase-admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

const db = admin.firestore();

// Helper function to check if user is admin
export function isAdminUser(userId: string): boolean {
  const adminUsers = process.env.ADMIN_USERS;
  if (!adminUsers) return false;

  const adminUserIds = adminUsers.split(',').map(id => id.trim());
  return adminUserIds.includes(userId);
}

// Helper function to track usage
export async function trackUsage(userId: string, eventType: string, metadata?: any): Promise<void> {
  try {
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
        [getCounterField(eventType)]: FieldValue.increment(1),
        lastResetDate: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Usage tracking error:', error);
  }
}

export function getCounterField(eventType: string): string {
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
