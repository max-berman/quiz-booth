import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

// Helper function to set CORS headers and handle preflight requests
function setupCorsHeaders(res: functions.Response): void {
  // In production, you should restrict this to specific origins
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? ['https://yourdomain.com']
    : ['http://localhost:5173', 'http://localhost:3000'];

  const origin = allowedOrigins[0]; // Use first allowed origin for now
  res.set('Access-Control-Allow-Origin', origin);
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// Helper function to handle preflight OPTIONS request
function handlePreflightRequest(req: functions.Request, res: functions.Response): boolean {
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return true;
  }
  return false;
}

// Helper function to validate request method
function validateRequestMethod(req: functions.Request, res: functions.Response, allowedMethods: string[]): boolean {
  if (!allowedMethods.includes(req.method)) {
    res.status(405).json({
      error: 'Method not allowed',
      allowedMethods
    });
    return false;
  }
  return true;
}

// Helper function to extract game ID from request
function extractGameId(req: functions.Request): string | null {
  // Try to get from path parameters first (for rewrites)
  if (req.params && req.params.gameId) {
    return req.params.gameId;
  } else {
    // Fallback to path parsing for direct function calls
    const pathParts = req.path.split('/');
    return pathParts[pathParts.length - 2] || null; // Get the game ID from /api/games/{gameId}/questions
  }
}

// Get questions for a game
export const getGameQuestions = functions.https.onRequest(async (req, res) => {
  setupCorsHeaders(res);

  if (handlePreflightRequest(req, res)) return;
  if (!validateRequestMethod(req, res, ['GET'])) return;

  try {
    const gameId = extractGameId(req);
    if (!gameId) {
      res.status(400).json({ error: 'Game ID is required' });
      return;
    }

    // Verify game exists and is public
    const gameDoc = await db.collection('games').doc(gameId).get();
    if (!gameDoc.exists) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }

    const gameData = gameDoc.data();
    if (!gameData?.isPublic) {
      res.status(403).json({ error: 'Access denied - game is not public' });
      return;
    }

    // Get questions for this game
    const questionsSnapshot = await db
      .collection('questions')
      .where('gameId', '==', gameId)
      .get();

    const questions = questionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json({
      count: questions.length,
      questions
    });
  } catch (error) {
    console.error('Get game questions error:', error);
    res.status(500).json({
      error: 'Failed to get questions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get play count for a game
export const getGamePlayCount = functions.https.onRequest(async (req, res) => {
  setupCorsHeaders(res);

  if (handlePreflightRequest(req, res)) return;
  if (!validateRequestMethod(req, res, ['GET'])) return;

  try {
    const gameId = extractGameId(req);
    if (!gameId) {
      res.status(400).json({ error: 'Game ID is required' });
      return;
    }

    // Verify game exists and is public
    const gameDoc = await db.collection('games').doc(gameId).get();
    if (!gameDoc.exists) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }

    const gameData = gameDoc.data();
    if (!gameData?.isPublic) {
      res.status(403).json({ error: 'Access denied - game is not public' });
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
    res.status(500).json({
      error: 'Failed to get play count',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
