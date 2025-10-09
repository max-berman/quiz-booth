import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { CORS_CONFIG } from '../config/api-config';

const db = admin.firestore();

// Helper function to set CORS headers and handle preflight requests
function setupCorsHeaders(res: functions.Response, req: functions.Request): void {
  // Allow all origins in development, restrict in production
  const allowedOrigins: string[] = process.env.NODE_ENV === 'production'
    ? [...CORS_CONFIG.PRODUCTION_ORIGINS]
    : [...CORS_CONFIG.DEVELOPMENT_ORIGINS];

  const requestOrigin = req.headers.origin;
  const origin = allowedOrigins.includes(requestOrigin || '') ? requestOrigin : allowedOrigins[0];

  res.set('Access-Control-Allow-Origin', origin || allowedOrigins[0]);
  res.set('Access-Control-Allow-Methods', CORS_CONFIG.ALLOWED_METHODS.join(', '));
  res.set('Access-Control-Allow-Headers', CORS_CONFIG.ALLOWED_HEADERS.join(', '));
  res.set('Access-Control-Allow-Credentials', CORS_CONFIG.ALLOW_CREDENTIALS.toString());
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
    // Fallback to query parameter for direct function calls
    return req.query.gameId as string || null;
  }
}

// Helper function to verify user authorization for a game
async function verifyGameAccess(gameId: string, userId?: string): Promise<boolean> {
  const gameDoc = await db.collection('games').doc(gameId).get();

  if (!gameDoc.exists) {
    return false;
  }

  const gameData = gameDoc.data();

  // In development mode, allow access to all games for testing
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }

  // If game is public, anyone can access it
  if (gameData?.isPublic) {
    return true;
  }

  // If user is provided and owns the game, allow access
  if (userId && gameData?.userId === userId) {
    return true;
  }

  return false;
}

// Helper function to extract user ID from request (if available)
function extractUserId(req: functions.Request): string | null {
  // Check Authorization header for Firebase ID token
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // In a real implementation, you would verify the Firebase ID token here
    // For now, we'll return null since we don't have proper auth setup
    return null;
  }

  // For development, you could check for a user ID in query params or headers
  return req.query.userId as string || null;
}

// Get questions for a game
export const getGameQuestions = functions.https.onRequest(async (req, res) => {
  setupCorsHeaders(res, req);

  if (handlePreflightRequest(req, res)) return;
  if (!validateRequestMethod(req, res, ['GET'])) return;

  try {
    const gameId = extractGameId(req);
    if (!gameId) {
      res.status(400).json({ error: 'Game ID is required' });
      return;
    }

    const userId = extractUserId(req);
    const hasAccess = await verifyGameAccess(gameId, userId || undefined);

    if (!hasAccess) {
      res.status(403).json({ error: 'Access denied - game is not public or you do not own this game' });
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
  setupCorsHeaders(res, req);

  if (handlePreflightRequest(req, res)) return;
  if (!validateRequestMethod(req, res, ['GET'])) return;

  try {
    const gameId = extractGameId(req);
    if (!gameId) {
      res.status(400).json({ error: 'Game ID is required' });
      return;
    }

    const userId = extractUserId(req);
    const hasAccess = await verifyGameAccess(gameId, userId || undefined);

    if (!hasAccess) {
      res.status(403).json({ error: 'Access denied - game is not public or you do not own this game' });
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
