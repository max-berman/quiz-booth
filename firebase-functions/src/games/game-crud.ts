import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { randomUUID } from 'crypto';
import { Timestamp } from 'firebase-admin/firestore';
import { rateLimitConfigs, withRateLimit } from '../lib/rate-limit';
import { validateSetupForm } from './game-validation';
import { trackUsage } from './game-utils';

const db = admin.firestore();

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

    // Backend validation - same rules as frontend
    const validation = validateSetupForm({
      companyName,
      industry: description || '',
      customIndustry: description === 'Other' ? description : '',
      productDescription: productDescription || '',
    });

    if (!validation.isValid) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Form validation failed',
        { errors: validation.errors }
      );
    }

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

    // Delete all questions for this game first
    const questionsSnapshot = await db
      .collection('questions')
      .where('gameId', '==', gameId)
      .get();

    questionsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Delete all player submissions for this game
    const playersSnapshot = await db
      .collection('players')
      .where('gameId', '==', gameId)
      .get();

    playersSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Finally, delete the game document itself
    batch.delete(db.collection('games').doc(gameId));

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
