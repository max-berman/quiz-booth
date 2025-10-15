import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * Shuffles an array using Fisher-Yates algorithm and tracks the new position of a specific element
 * @param array - Array to shuffle
 * @param trackedIndex - Index of the element whose new position should be returned
 * @returns Object with shuffled array and new index of the tracked element
 */
export function shuffleArrayAndTrackIndex<T>(array: T[], trackedIndex: number): { shuffled: T[], newIndex: number } {
  if (!Array.isArray(array) || array.length === 0) {
    throw new Error('Array must be non-empty for shuffling');
  }
  if (trackedIndex < 0 || trackedIndex >= array.length) {
    throw new Error('Tracked index must be within array bounds');
  }

  const shuffled = [...array];
  const originalValue = shuffled[trackedIndex];

  // Fisher-Yates shuffle algorithm
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Find the new position of the original correct answer
  const newIndex = shuffled.indexOf(originalValue);
  return { shuffled, newIndex };
}

/**
 * Detect if a string contains a website URL
 */
export function isWebsiteURL(text: string): boolean {
  if (!text.includes('.')) {
    return false;
  }

  // Check if it starts with http/https protocol
  if (text.startsWith('http://') || text.startsWith('https://')) {
    return true;
  }

  // Common TLDs that are likely to be websites
  const commonTLDs = [
    '.com', '.org', '.net', '.io', '.co', '.dev', '.app', '.tech', '.ai', '.me',
    '.info', '.biz', '.us', '.uk', '.ca', '.au', '.de', '.fr', '.jp', '.cn',
    '.edu', '.gov', '.mil', '.xyz', '.online', '.site', '.store', '.blog',
    '.club', '.design', '.space', '.world', '.digital', '.cloud', '.tools'
  ];

  return commonTLDs.some(tld => {
    const index = text.indexOf(tld);
    if (index === -1) return false;

    const afterTLD = text.substring(index + tld.length);
    const beforeTLD = text.substring(0, index);

    const isValidPosition =
      afterTLD.length === 0 ||
      afterTLD.startsWith('/') ||
      afterTLD.startsWith('?') ||
      afterTLD.startsWith('#') ||
      afterTLD.startsWith('.');

    const hasDomainName = beforeTLD.length > 0;

    return isValidPosition && hasDomainName;
  });
}

/**
 * Track usage events and update usage counters
 */
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
    // Usage tracking should not break main functionality
    console.error(`Usage tracking failed for ${eventType}:`, error instanceof Error ? error.message : String(error));
  }
}

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

/**
 * Get forced provider from Firestore (persistent storage)
 */
export async function getForcedProvider(): Promise<string | null> {
  try {
    const forcedProviderDoc = await db.collection('llmConfig').doc('forcedProvider').get();
    if (forcedProviderDoc.exists) {
      const data = forcedProviderDoc.data();
      return data?.providerName || null;
    }
    return null;
  } catch (error) {
    console.error('Error getting forced provider from Firestore:', error);
    return null;
  }
}

/**
 * Set forced provider in Firestore (persistent storage)
 */
export async function setForcedProvider(providerName: string | null): Promise<void> {
  try {
    if (providerName === null) {
      await db.collection('llmConfig').doc('forcedProvider').delete();
    } else {
      await db.collection('llmConfig').doc('forcedProvider').set({
        providerName,
        updatedAt: Timestamp.now()
      });
    }
  } catch (error) {
    console.error('Error setting forced provider in Firestore:', error);
  }
}
