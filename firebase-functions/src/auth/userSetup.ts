import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const db = admin.firestore();

// User setup function - called when a new user signs up
export const userSetup = functions.auth.user().onCreate(async (user) => {
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
      lastResetDate: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Create user profile if needed
    await db.collection('users').doc(user.uid).set({
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    console.log(`User setup completed for ${user.email}`);
  } catch (error) {
    console.error('Error setting up user:', error);
  }
});
