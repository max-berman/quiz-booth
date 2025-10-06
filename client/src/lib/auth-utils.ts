import { auth } from './firebase';

// Session timeout configuration (1 hour)
const SESSION_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour
const SESSION_KEY = 'auth_session_timestamp';

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

    // Check session timeout
    if (isSessionExpired()) {
      console.log('getAuthToken: Session expired, signing out');
      await auth.signOut();
      return null;
    }

    const token = await user.getIdToken();
    console.log('getAuthToken: Token generated, length:', token?.length);

    // Update session timestamp
    updateSessionTimestamp();

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

  // Check creator key with expiration
  const creatorKey = getCreatorKeyWithExpiration(gameId);
  return !!creatorKey;
}

/**
 * Store creator key with expiration (24 hours)
 */
export function storeCreatorKey(gameId: string, creatorKey: string): void {
  const expiration = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
  const data = {
    key: creatorKey,
    expiresAt: expiration
  };
  localStorage.setItem(`game-${gameId}-creator-key`, JSON.stringify(data));
}

/**
 * Get creator key with expiration check
 */
export function getCreatorKeyWithExpiration(gameId: string): string | null {
  const stored = localStorage.getItem(`game-${gameId}-creator-key`);
  if (!stored) return null;

  try {
    const data = JSON.parse(stored);
    if (data.expiresAt && Date.now() > data.expiresAt) {
      // Key expired, remove it
      localStorage.removeItem(`game-${gameId}-creator-key`);
      return null;
    }
    return data.key;
  } catch {
    // Invalid format, remove it
    localStorage.removeItem(`game-${gameId}-creator-key`);
    return null;
  }
}

/**
 * Update session timestamp
 */
function updateSessionTimestamp(): void {
  localStorage.setItem(SESSION_KEY, Date.now().toString());
}

/**
 * Check if session has expired
 */
function isSessionExpired(): boolean {
  const timestamp = localStorage.getItem(SESSION_KEY);
  if (!timestamp) return false;

  const sessionTime = parseInt(timestamp, 10);
  return Date.now() - sessionTime > SESSION_TIMEOUT_MS;
}

/**
 * Clear session data
 */
export function clearSessionData(): void {
  localStorage.removeItem(SESSION_KEY);
  // Clear all creator keys
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('game-') && key.endsWith('-creator-key')) {
      localStorage.removeItem(key);
    }
  });
}

/**
 * Initialize session monitoring
 */
export function initializeSessionMonitoring(): void {
  // Check session on page load
  if (isSessionExpired() && auth.currentUser) {
    auth.signOut();
  }

  // Update session timestamp on user interaction
  const updateSession = () => updateSessionTimestamp();
  document.addEventListener('click', updateSession);
  document.addEventListener('keypress', updateSession);
  document.addEventListener('scroll', updateSession);
}
