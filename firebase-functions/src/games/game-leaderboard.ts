import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { randomUUID } from 'crypto';
import { Timestamp } from 'firebase-admin/firestore';
import { validateScoreSubmission } from './game-validation';
import { trackUsage } from './game-utils';

const db = admin.firestore();

// Save player score to leaderboard
export const savePlayerScore = functions.https.onCall(async (data, context) => {
  const { gameId, playerName, company, score, correctAnswers, totalQuestions, timeSpent } = data;

  try {
    // Verify game exists
    const gameDoc = await db.collection('games').doc(gameId).get();
    if (!gameDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Game not found');
    }

    const gameData = gameDoc.data();

    // Check if game is public or user has access
    if (!gameData?.isPublic && (!context.auth || gameData?.userId !== context.auth.uid)) {
      throw new functions.https.HttpsError('permission-denied', 'Access denied');
    }

    // Server-side validation for score manipulation detection
    const validationErrors = validateScoreSubmission({
      score,
      correctAnswers,
      totalQuestions,
      timeSpent,
      gameQuestionCount: gameData?.questionCount || 0,
    });

    if (validationErrors.length > 0) {
      console.warn('Score validation failed:', {
        gameId,
        playerName,
        score,
        correctAnswers,
        totalQuestions,
        timeSpent,
        validationErrors,
      });

      throw new functions.https.HttpsError(
        'failed-precondition',
        'Score validation failed. Please complete the game properly to save your score.',
        { validationErrors }
      );
    }

    // Additional validation: Check for suspicious score improvements
    // This would require storing player history, but for now we'll log for monitoring
    console.log('Score submission attempt:', {
      gameId,
      playerName,
      score,
      correctAnswers,
      totalQuestions,
      timeSpent,
      timestamp: new Date().toISOString(),
    });

    // Usage tracking (if authenticated)
    if (context.auth) {
      await trackUsage(context.auth.uid, 'player_submission', {
        gameId,
        score,
        correctAnswers,
        totalQuestions,
        timeSpent,
      });
    }

    // Create player record
    const playerId = randomUUID();
    const now = new Date();

    const playerData = {
      id: playerId,
      gameId,
      name: playerName,
      company: company || null,
      score,
      correctAnswers,
      totalQuestions,
      timeSpent,
      completedAt: Timestamp.fromDate(now),
    };

    await db.collection('players').doc(playerId).set(playerData);

    return { success: true, playerId };
  } catch (error) {
    console.error('Save player score error:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to save player score');
  }
});

// Get leaderboard for a game
export const getGameLeaderboard = functions.https.onCall(async (data, context) => {
  const { gameId } = data;

  try {
    // Verify game exists
    const gameDoc = await db.collection('games').doc(gameId).get();
    if (!gameDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Game not found');
    }

    const gameData = gameDoc.data();

    // Check if game is public or user has access
    if (!gameData?.isPublic && (!context.auth || gameData?.userId !== context.auth.uid)) {
      throw new functions.https.HttpsError('permission-denied', 'Access denied');
    }

    // Get players for this game, ordered by score (descending) and time (ascending)
    const playersSnapshot = await db
      .collection('players')
      .where('gameId', '==', gameId)
      .orderBy('score', 'desc')
      .orderBy('timeSpent', 'asc')
      .limit(100) // Limit to top 100 players
      .get();

    const players = playersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        completedAt: data.completedAt?.toDate?.()?.toISOString(),
      };
    });

    return players;
  } catch (error) {
    console.error('Get game leaderboard error:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to get leaderboard');
  }
});

// Get all players (submissions) for a game - for creator access
export const getGamePlayers = functions.https.onCall(async (data, context) => {
  const { gameId } = data;

  try {
    // Verify game exists
    const gameDoc = await db.collection('games').doc(gameId).get();
    if (!gameDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Game not found');
    }

    const gameData = gameDoc.data();

    // Check if user is authenticated and owns the game
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    if (gameData?.userId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Access denied - only game creator can view submissions');
    }

    // Get all players for this game (temporarily without ordering to test)
    const playersSnapshot = await db
      .collection('players')
      .where('gameId', '==', gameId)
      .get();

    const players = playersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        completedAt: data.completedAt?.toDate?.()?.toISOString(),
      };
    });

    // Sort manually by completedAt (newest first)
    players.sort((a, b) => {
      const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return dateB - dateA;
    });

    return players;
  } catch (error) {
    console.error('Get game players error:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to get players data');
  }
});
