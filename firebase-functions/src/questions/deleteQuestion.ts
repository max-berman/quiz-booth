import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

const db = admin.firestore();

/**
 * Delete a question
 */
export const deleteQuestion = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const userId = context.auth.uid;
  const { questionId } = data;

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

    // Delete the question
    await db.collection('questions').doc(questionId).delete();

    // Update the game's actualQuestionCount
    const questionsSnapshot = await db
      .collection('questions')
      .where('gameId', '==', gameId)
      .get();

    const newQuestionCount = questionsSnapshot.size;

    await db.collection('games').doc(gameId).update({
      actualQuestionCount: newQuestionCount,
      modifiedAt: Timestamp.fromDate(new Date()),
    });

    console.log(`Question ${questionId} deleted successfully`);
    return { success: true, message: 'Question deleted successfully' };
  } catch (error) {
    console.error('Delete question error:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to delete question');
  }
});
