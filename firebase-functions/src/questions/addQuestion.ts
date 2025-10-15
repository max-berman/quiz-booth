import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { randomUUID } from 'crypto';
import { Timestamp } from 'firebase-admin/firestore';

const db = admin.firestore();

/**
 * Add a new question
 */
export const addQuestion = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const userId = context.auth.uid;
  const { gameId, questionData } = data;

  try {
    // Verify user owns the game
    const gameDoc = await db.collection('games').doc(gameId).get();
    if (!gameDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Game not found');
    }

    const gameData = gameDoc.data();
    if (gameData?.userId !== userId) {
      throw new functions.https.HttpsError('permission-denied', 'Access denied');
    }

    // Get current questions to determine the next order
    const questionsSnapshot = await db
      .collection('questions')
      .where('gameId', '==', gameId)
      .get();

    const currentQuestions = questionsSnapshot.docs.map(doc => doc.data());
    const nextOrder = currentQuestions.length + 1;

    // Create the new question
    const questionId = randomUUID();
    const newQuestion = {
      id: questionId,
      gameId,
      questionText: questionData.questionText,
      options: questionData.options,
      correctAnswer: questionData.correctAnswer,
      explanation: questionData.explanation || null,
      order: nextOrder,
    };

    await db.collection('questions').doc(questionId).set(newQuestion);

    // Update the game's actualQuestionCount
    await db.collection('games').doc(gameId).update({
      actualQuestionCount: nextOrder,
      modifiedAt: Timestamp.fromDate(new Date()),
    });

    console.log(`Question ${questionId} added successfully to game ${gameId}`);
    return {
      success: true,
      message: 'Question added successfully',
      question: newQuestion
    };
  } catch (error) {
    console.error('Add question error:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to add question');
  }
});
