import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { randomUUID } from 'crypto';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { rateLimitConfigs, withRateLimit } from '../lib/rate-limit';
import { SCORE_VALIDATION_CONFIG } from '../config/constants';

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
  const { title, description, questionCount, difficulty, categories, companyName, productDescription, prizes, customCategoryDescription } = data;

  try {
    // Rate limiting check
    await withRateLimit(rateLimitConfigs.gameCreation)(data, context);

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
      actualQuestionCount: 0, // Initialize with 0 actual questions
      difficulty,
      categories,
      customCategoryDescription: customCategoryDescription || null,
      prizes: prizesObject,
      creatorKey,
      userId,
      createdAt: Timestamp.fromDate(now),
      modifiedAt: Timestamp.fromDate(now),
      status: 'draft',
      isPublic: true,
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
      // Public game, return limited data but include customization
      return {
        id: gameData.id,
        gameTitle: gameData.gameTitle,
        companyName: gameData.companyName,
        industry: gameData.industry,
        productDescription: gameData.productDescription,
        questionCount: gameData.questionCount,
        difficulty: gameData.difficulty,
        categories: gameData.categories,
        prizes: prizesArray,
        isPublic: true,
        customization: gameData.customization, // Include customization for public games
        createdAt: gameData?.createdAt?.toDate?.()?.toISOString(),
        modifiedAt: gameData?.modifiedAt?.toDate?.()?.toISOString(),
      };
    } else {
      // Shared game (not public but accessible via direct link)
      // Return limited data for shared games
      return {
        id: gameData?.id,
        gameTitle: gameData?.gameTitle,
        companyName: gameData?.companyName,
        industry: gameData?.industry,
        productDescription: gameData?.productDescription,
        questionCount: gameData?.questionCount,
        difficulty: gameData?.difficulty,
        categories: gameData?.categories,
        prizes: prizesArray,
        isPublic: false,
        customization: gameData?.customization, // Include customization for shared games
        createdAt: gameData?.createdAt?.toDate?.()?.toISOString(),
        modifiedAt: gameData?.modifiedAt?.toDate?.()?.toISOString(),
      };
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
  const { gameId, updates, customization } = data;

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

    // Prepare update data
    const updateData: any = {
      ...allowedUpdates,
      modifiedAt: Timestamp.fromDate(new Date()),
    };

    // Handle customization if provided
    if (customization) {
      updateData.customization = customization;

      // Track usage for customization
      await trackUsage(userId, 'custom_theme_applied', {
        gameId,
        hasCustomLogo: !!customization.customLogoUrl,
        hasCustomColors: !!(customization.primaryColor || customization.secondaryColor || customization.tertiaryColor),
      });
    }

    // Update game
    await db.collection('games').doc(gameId).update(updateData);

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

// Update game public status
export const updateGamePublicStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const userId = context.auth.uid;
  const { gameId, isPublic } = data;

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

    // Update game public status
    const now = new Date();
    await db.collection('games').doc(gameId).update({
      isPublic,
      modifiedAt: Timestamp.fromDate(now),
    });

    return { success: true, isPublic };
  } catch (error) {
    console.error('Update game public status error:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to update game public status');
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

    // Convert prizes object to array format for frontend response
    const prizesArray = prizes ? Object.entries(prizes).map(([key, value]) => ({
      placement: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      prize: value
    })).filter(p => p.prize) : [];

    return { success: true, prizes: prizesArray };
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

// Score validation helper function
function validateScoreSubmission(data: {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  gameQuestionCount: number;
}): string[] {
  const errors: string[] = [];
  const { score, correctAnswers, totalQuestions, timeSpent, gameQuestionCount } = data;

  // Validate basic numeric ranges
  if (score < 0) {
    errors.push('Score cannot be negative');
  }

  if (correctAnswers < 0 || correctAnswers > totalQuestions) {
    errors.push('Invalid correct answers count');
  }

  if (totalQuestions <= 0 || totalQuestions > SCORE_VALIDATION_CONFIG.MAX_QUESTIONS) {
    errors.push('Invalid total questions count');
  }

  if (timeSpent < 0) {
    errors.push('Time spent cannot be negative');
  }

  // Validate consistency between correct answers and total questions
  if (correctAnswers > totalQuestions) {
    errors.push('Correct answers cannot exceed total questions');
  }

  // Validate score calculation consistency
  const maxPossibleScore = totalQuestions * (
    SCORE_VALIDATION_CONFIG.MAX_POINTS_PER_QUESTION +
    SCORE_VALIDATION_CONFIG.MAX_TIME_BONUS_PER_QUESTION +
    SCORE_VALIDATION_CONFIG.MAX_STREAK_BONUS_PER_QUESTION
  );

  if (score > maxPossibleScore) {
    errors.push('Score exceeds maximum possible value for this game');
  }

  // Validate that total questions matches game configuration
  if (gameQuestionCount > 0 && Math.abs(totalQuestions - gameQuestionCount) > SCORE_VALIDATION_CONFIG.QUESTION_COUNT_TOLERANCE) {
    errors.push('Submitted question count does not match game configuration');
  }

  // Validate time spent is reasonable
  const avgTimePerQuestion = totalQuestions > 0 ? timeSpent / totalQuestions : 0;

  if (avgTimePerQuestion < SCORE_VALIDATION_CONFIG.MIN_TIME_PER_QUESTION) {
    errors.push('Time spent per question is unrealistically low');
  }

  if (avgTimePerQuestion > SCORE_VALIDATION_CONFIG.MAX_TIME_PER_QUESTION) {
    errors.push('Time spent per question is unrealistically high');
  }

  return errors;
}

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

// Get public games (no authentication required)
export const getPublicGames = functions.https.onCall(async (data, context) => {
  const { limit = 12, offset = 0, industry, categories } = data;

  try {
    // Get public games, ordered by creation date (newest first)
    let gamesQuery = db
      .collection('games')
      .where('isPublic', '==', true);

    // Apply filters if provided
    if (industry && industry !== 'all') {
      gamesQuery = gamesQuery.where('industry', '==', industry);
    }

    // Apply category filter if provided
    if (categories && categories.length > 0) {
      // For categories, we need to check if the game's categories array contains any of the selected categories
      // Firestore doesn't support array-contains-any with multiple conditions, so we'll filter client-side
      // For now, we'll get all games and filter client-side for categories
    }

    gamesQuery = gamesQuery.orderBy('createdAt', 'desc');

    // Apply limit and offset
    if (limit) {
      gamesQuery = gamesQuery.limit(limit);
    }
    if (offset) {
      // Note: Firestore doesn't support offset directly, so we'd need to use cursor-based pagination
      // For now, we'll skip offset and just use limit
    }

    const gamesSnapshot = await gamesQuery.get();

    let games = gamesSnapshot.docs.map(doc => {
      const data = doc.data();

      // Convert prizes object to array format for frontend
      const prizesArray = data?.prizes ? Object.entries(data.prizes).map(([key, value]) => ({
        placement: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        prize: value
      })).filter(p => p.prize) : [];

      return {
        id: data.id,
        gameTitle: data.gameTitle,
        companyName: data.companyName,
        industry: data.industry,
        productDescription: data.productDescription,
        questionCount: data.questionCount,
        difficulty: data.difficulty,
        categories: data.categories,
        prizes: prizesArray,
        isPublic: data.isPublic,
        customization: data.customization, // Include customization for public games
        createdAt: data.createdAt?.toDate?.()?.toISOString(),
        modifiedAt: data.modifiedAt?.toDate?.()?.toISOString(),
      };
    });

    // Apply category filter client-side if needed
    if (categories && categories.length > 0) {
      games = games.filter(game =>
        game.categories && game.categories.some((category: string) =>
          categories.includes(category)
        )
      );
    }

    return games;
  } catch (error) {
    console.error('Get public games error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get public games');
  }
});

// Get public games count (no authentication required)
export const getPublicGamesCount = functions.https.onCall(async (data, context) => {
  try {
    const gamesSnapshot = await db
      .collection('games')
      .where('isPublic', '==', true)
      .get();

    return { count: gamesSnapshot.size };
  } catch (error) {
    console.error('Get public games count error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get public games count');
  }
});

// Delete game and all related data
export const deleteGame = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const userId = context.auth.uid;
  const { gameId } = data;

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

    // Start a batch write for atomic operations
    const batch = db.batch();

    // Delete the game document
    batch.delete(db.collection('games').doc(gameId));

    // Delete all questions for this game
    const questionsSnapshot = await db
      .collection('questions')
      .where('gameId', '==', gameId)
      .get();

    questionsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Reset actualQuestionCount to 0 when all questions are deleted
    batch.update(db.collection('games').doc(gameId), {
      actualQuestionCount: 0,
      modifiedAt: Timestamp.fromDate(new Date()),
    });

    // Delete all player submissions for this game
    const playersSnapshot = await db
      .collection('players')
      .where('gameId', '==', gameId)
      .get();

    playersSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Commit the batch deletion
    await batch.commit();

    console.log(`Game ${gameId} and all related data deleted successfully`);
    return { success: true, message: 'Game and all related data deleted successfully' };
  } catch (error) {
    console.error('Delete game error:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to delete game');
  }
});
