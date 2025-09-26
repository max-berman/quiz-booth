import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { randomUUID } from 'crypto';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

const db = admin.firestore();

// Helper function to track usage
async function trackUsage(userId: string, eventType: string, metadata?: any): Promise<void> {
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

// Create a new game
export const createGame = functions.runWith({
  memory: '256MB',
  timeoutSeconds: 60
}).https.onCall(async (data, context) => {
  // Authentication check
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const userId = context.auth.uid;
  const { title, description, questionCount, difficulty, categories, companyName, productDescription, prizes } = data;

  try {
    // Usage tracking
    await trackUsage(userId, 'game_created', {
      questionCount,
      difficulty,
      categories,
    });

    // Create game in Firestore
    const gameId = randomUUID();
    const creatorKey = randomUUID();
    const now = new Date();

    // Convert prizes array to object format for storage
    let prizesObject: Record<string, string> | null = null;
    if (prizes && Array.isArray(prizes) && prizes.length > 0) {
      prizesObject = {};
      prizes.forEach(prize => {
        if (prize.placement.trim() && prize.prize.trim()) {
          // Use the placement as the key (normalized)
          const key = prize.placement.toLowerCase().replace(/\s+/g, '_');
          prizesObject![key] = prize.prize;
        }
      });
    }

    const gameData = {
      id: gameId,
      gameTitle: title || null,
      companyName,
      industry: description || '',
      productDescription: productDescription || null,
      questionCount,
      difficulty,
      categories,
      prizes: prizesObject,
      creatorKey,
      userId,
      createdAt: Timestamp.fromDate(now),
      modifiedAt: Timestamp.fromDate(now),
      status: 'draft',
      isPublic: false,
    };

    await db.collection('games').doc(gameId).set(gameData);

    return {
      id: gameId,
      gameTitle: title,
      companyName,
      industry: description,
      productDescription,
      questionCount,
      difficulty,
      categories,
      creatorKey,
      userId,
      createdAt: now.toISOString(),
      modifiedAt: now.toISOString(),
    };
  } catch (error) {
    console.error('Create game error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create game');
  }
});

// Get game by ID
export const getGame = functions.https.onCall(async (data, context) => {
  const { gameId } = data;

  try {
    const gameDoc = await db.collection('games').doc(gameId).get();

    if (!gameDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Game not found');
    }

    const gameData = gameDoc.data();

    // Convert prizes object to array format for frontend
    const prizesArray = gameData?.prizes ? Object.entries(gameData.prizes).map(([key, value]) => ({
      placement: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      prize: value
    })).filter(p => p.prize) : [];

    // Check if user has access
    if (context.auth && gameData?.userId === context.auth.uid) {
      // User owns the game, return full data
      return {
        ...gameData,
        prizes: prizesArray,
        createdAt: gameData?.createdAt?.toDate?.()?.toISOString(),
        modifiedAt: gameData?.modifiedAt?.toDate?.()?.toISOString(),
      };
    } else if (gameData?.isPublic) {
      // Public game, return limited data
      return {
        id: gameData.id,
        gameTitle: gameData.gameTitle,
        companyName: gameData.companyName,
        industry: gameData.industry,
        prizes: prizesArray,
        isPublic: true,
        createdAt: gameData?.createdAt?.toDate?.()?.toISOString(),
      };
    } else {
      throw new functions.https.HttpsError('permission-denied', 'Access denied');
    }
  } catch (error) {
    console.error('Get game error:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to get game');
  }
});

// Get games by authenticated user
export const getGamesByUser = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const userId = context.auth.uid;

  try {
    const gamesSnapshot = await db
      .collection('games')
      .where('userId', '==', userId)
      .get();

    const games = gamesSnapshot.docs.map(doc => {
      const data = doc.data();

      // Convert prizes object to array format for frontend
      const prizesArray = data?.prizes ? Object.entries(data.prizes).map(([key, value]) => ({
        placement: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        prize: value
      })).filter(p => p.prize) : [];

      return {
        ...data,
        prizes: prizesArray,
        createdAt: data.createdAt?.toDate?.()?.toISOString(),
        modifiedAt: data.modifiedAt?.toDate?.()?.toISOString(),
      };
    });

    // Sort by creation date (newest first)
    return games.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Get user games error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get user games');
  }
});

// Update game
export const updateGame = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const userId = context.auth.uid;
  const { gameId, updates } = data;

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

    // Filter out fields that shouldn't be updated
    const allowedUpdates = { ...updates };
    delete (allowedUpdates as any).id;
    delete (allowedUpdates as any).creatorKey;
    delete (allowedUpdates as any).userId;
    delete (allowedUpdates as any).createdAt;

    // Update game
    const now = new Date();
    await db.collection('games').doc(gameId).update({
      ...allowedUpdates,
      modifiedAt: Timestamp.fromDate(now),
    });

    // Get updated game
    const updatedGameDoc = await db.collection('games').doc(gameId).get();
    const updatedGame = updatedGameDoc.data();

    return {
      ...updatedGame,
      createdAt: updatedGame?.createdAt?.toDate?.()?.toISOString(),
      modifiedAt: updatedGame?.modifiedAt?.toDate?.()?.toISOString(),
    };
  } catch (error) {
    console.error('Update game error:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to update game');
  }
});

// Update game title
export const updateGameTitle = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const userId = context.auth.uid;
  const { gameId, gameTitle } = data;

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

    // Update game title
    const now = new Date();
    await db.collection('games').doc(gameId).update({
      gameTitle,
      modifiedAt: Timestamp.fromDate(now),
    });

    return { success: true, gameTitle };
  } catch (error) {
    console.error('Update game title error:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to update game title');
  }
});

// Update game prizes
export const updateGamePrizes = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const userId = context.auth.uid;
  const { gameId, prizes } = data;

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

    // Update prizes
    const now = new Date();
    await db.collection('games').doc(gameId).update({
      prizes,
      modifiedAt: Timestamp.fromDate(now),
    });

    return { success: true, prizes };
  } catch (error) {
    console.error('Update game prizes error:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to update game prizes');
  }
});

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
