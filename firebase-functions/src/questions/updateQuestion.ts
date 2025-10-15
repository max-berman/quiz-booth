import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * Update a question
 */
export const updateQuestion = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const userId = context.auth.uid;
  const { questionId, updates } = data;

  try {
    // Get the question to verify ownership
    const questionDoc = await db.collection('questions').doc(questionId).get();
    if (!questionDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Question not found');
    }

    const questionData = questionDoc.data();
    const gameId = questionData?.gameId;

    // Verify user owns the game that contains this question
    const gameDoc = await db.collection('games').doc(gameId).get();
    if (!gameDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Game not found');
    }

    const gameData = gameDoc.data();
    if (gameData?.userId !== userId) {
      throw new functions.https.HttpsError('permission-denied', 'Access denied');
    }

    // Filter out fields that shouldn't be updated
    const allowedUpdates = { ...updates };
    delete (allowedUpdates as any).id;
    delete (allowedUpdates as any).gameId;
    delete (allowedUpdates as any).userId;

    // Update the question
    await db.collection('questions').doc(questionId).update({
      ...allowedUpdates,
    });

    console.log(`Question ${questionId} updated successfully`);
    return { success: true, message: 'Question updated successfully' };
  } catch (error) {
    console.error('Update question error:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to update question');
  }
});
