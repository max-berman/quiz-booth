import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

// Get questions count for a game
export const getGameQuestionsCount = functions.https.onCall(async (data, context) => {
  try {
    const { gameId } = data;

    if (!gameId) {
      throw new functions.https.HttpsError('invalid-argument', 'Game ID is required');
    }

    // Verify game exists
    const gameDoc = await db.collection('games').doc(gameId).get();
    if (!gameDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Game not found');
    }

    // Get questions count
    const questionsSnapshot = await db
      .collection('questions')
      .where('gameId', '==', gameId)
      .get();

    const questions = questionsSnapshot.docs.map(doc => doc.data());

    return { questions, count: questions.length };
  } catch (error) {
    console.error('Get game questions error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get questions');
  }
});

// Get play count for a game
export const getGamePlayCount = functions.https.onCall(async (data, context) => {
  try {
    const { gameId } = data;

    if (!gameId) {
      throw new functions.https.HttpsError('invalid-argument', 'Game ID is required');
    }

    // Verify game exists
    const gameDoc = await db.collection('games').doc(gameId).get();
    if (!gameDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Game not found');
    }

    // Get play count (number of player submissions)
    const playersSnapshot = await db
      .collection('players')
      .where('gameId', '==', gameId)
      .get();

    const playCount = playersSnapshot.size;

    return { count: playCount };
  } catch (error) {
    console.error('Get game play count error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get play count');
  }
});
