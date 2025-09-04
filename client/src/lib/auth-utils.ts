import { auth } from './firebase';

/**
 * Get the current user's ID token for API authentication
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const user = auth.currentUser;
    if (!user) {
      return null;
    }
    
    const token = await user.getIdToken();
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

/**
 * Get authentication headers for API requests
 * Returns either Firebase auth or creator key headers
 */
export async function getAuthHeaders(gameId?: string): Promise<Record<string, string>> {
  // Try to get Firebase auth token first
  const authToken = await getAuthToken();
  
  if (authToken) {
    return {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    };
  }
  
  // Fall back to creator key if provided
  if (gameId) {
    const creatorKey = localStorage.getItem(`game-${gameId}-creator-key`);
    if (creatorKey) {
      return {
        'X-Creator-Key': creatorKey,
        'Content-Type': 'application/json',
      };
    }
  }
  
  return {
    'Content-Type': 'application/json',
  };
}

/**
 * Check if user has access to a game (either through auth or creator key)
 */
export async function hasGameAccess(gameId: string): Promise<boolean> {
  // Check Firebase auth first
  const authToken = await getAuthToken();
  if (authToken) {
    return true; // API will validate access
  }
  
  // Check creator key
  const creatorKey = localStorage.getItem(`game-${gameId}-creator-key`);
  return !!creatorKey;
}