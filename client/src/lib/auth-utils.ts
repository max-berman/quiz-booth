import { auth } from './firebase';

/**
 * Get the current user's ID token for API authentication
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const user = auth.currentUser;
    console.log('getAuthToken: Current user:', user?.uid);
    if (!user) {
      console.log('getAuthToken: No current user found');
      return null;
    }
    
    const token = await user.getIdToken();
    console.log('getAuthToken: Token generated, length:', token?.length);
    return token;
  } catch (error) {
    console.error('getAuthToken: Error getting auth token:', error);
    return null;
  }
}

/**
 * Get authentication headers for API requests
 * Returns Firebase auth headers only
 */
export async function getAuthHeaders(gameId?: string): Promise<Record<string, string>> {
  // Get Firebase auth token
  const authToken = await getAuthToken();
  console.log('getAuthHeaders: Auth token available?', !!authToken);
  
  if (authToken) {
    const headers = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    };
    console.log('getAuthHeaders: Returning headers with Authorization');
    return headers;
  }
  
  console.log('getAuthHeaders: No auth token available, returning basic headers');
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