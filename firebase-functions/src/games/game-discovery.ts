import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

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

// Get admin games (public games from specific admin user)
export const getAdminGames = functions.https.onCall(async (data, context) => {
  const { limit = 12, offset = 0, industry, categories, adminUserId } = data;

  // No authentication check needed - these games are publicly accessible
  // No admin check needed - anyone can see these public games

  if (!adminUserId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'adminUserId is required'
    );
  }

  try {
    // Get public games from specific admin user, ordered by creation date (newest first)
    let gamesQuery = db
      .collection('games')
      .where('userId', '==', adminUserId)
      .where('isPublic', '==', true)
      .orderBy('createdAt', 'desc');

    // Apply filters if provided
    if (industry && industry !== 'all') {
      gamesQuery = gamesQuery.where('industry', '==', industry);
    }

    // Apply category filter if provided
    if (categories && categories.length > 0) {
      // For categories, we'll filter client-side since Firestore doesn't support array-contains-any with multiple conditions
    }

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
        actualQuestionCount: data.actualQuestionCount || 0,
        difficulty: data.difficulty,
        categories: data.categories,
        prizes: prizesArray,
        isPublic: data.isPublic,
        status: data.status,
        userId: data.userId,
        customization: data.customization,
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
    console.error('Get admin games error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get admin games');
  }
});
