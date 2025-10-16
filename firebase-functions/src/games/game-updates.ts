import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

const db = admin.firestore();

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
