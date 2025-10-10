import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

// Get questions count for a game
export const getGameQuestionsCount = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Extract game ID from URL path
    // Handle both direct function calls and rewrites
    let gameId: string | undefined;

    // Try to get from path parameters first (for rewrites)
    if (req.params && req.params.gameId) {
      gameId = req.params.gameId;
    } else {
      // Fallback to path parsing for direct function calls
      const pathParts = req.path.split('/');
      gameId = pathParts[pathParts.length - 2]; // Get the game ID from /api/games/{gameId}/questions
    }

    if (!gameId) {
      res.status(400).json({ error: 'Game ID is required' });
      return;
    }

    // Verify game exists
    const gameDoc = await db.collection('games').doc(gameId).get();
    if (!gameDoc.exists) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }

    // Check if game is public or user has access
    // For now, we'll allow access to all games via this endpoint
    // In a production scenario, you might want to add authentication checks

    // Get questions count
    const questionsSnapshot = await db
      .collection('questions')
      .where('gameId', '==', gameId)
      .get();

    const questions = questionsSnapshot.docs.map(doc => doc.data());

    res.status(200).json(questions);
  } catch (error) {
    console.error('Get game questions error:', error);
    res.status(500).json({ error: 'Failed to get questions' });
  }
});

// Get play count for a game
export const getGamePlayCount = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Extract game ID from URL path
    // Handle both direct function calls and rewrites
    let gameId: string | undefined;

    // Try to get from path parameters first (for rewrites)
    if (req.params && req.params.gameId) {
      gameId = req.params.gameId;
    } else {
      // Fallback to path parsing for direct function calls
      const pathParts = req.path.split('/');
      gameId = pathParts[pathParts.length - 2]; // Get the game ID from /api/games/{gameId}/play-count
    }

    if (!gameId) {
      res.status(400).json({ error: 'Game ID is required' });
      return;
    }

    // Verify game exists
    const gameDoc = await db.collection('games').doc(gameId).get();
    if (!gameDoc.exists) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }

    // Get play count (number of player submissions)
    const playersSnapshot = await db
      .collection('players')
      .where('gameId', '==', gameId)
      .get();

    const playCount = playersSnapshot.size;

    res.status(200).json({ count: playCount });
  } catch (error) {
    console.error('Get game play count error:', error);
    res.status(500).json({ error: 'Failed to get play count' });
  }
});
