// Simple in-memory cache with TTL support for reducing database reads
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0
  };

  // Get cached data if available and not expired
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.data as T;
  }

  // Set data in cache with TTL (time-to-live in milliseconds)
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
    this.stats.sets++;
  }

  // Delete specific cache entry
  delete(key: string): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      this.stats.deletes++;
    }
  }

  // Clear entire cache
  clear(): void {
    this.cache.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;
    this.stats.sets = 0;
    this.stats.deletes = 0;
  }

  // Get cache statistics
  getStats() {
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0
    };
  }

  // Clean up expired entries (call this periodically if needed)
  cleanup(): number {
    const now = Date.now();
    let deleted = 0;

    // Use Array.from to avoid iterator issues
    const entries = Array.from(this.cache.entries());
    for (const [key, entry] of entries) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        deleted++;
      }
    }

    return deleted;
  }
}

// Global cache instances for different types of data
export const gameCache = new MemoryCache();
export const questionsCache = new MemoryCache();
export const leaderboardCache = new MemoryCache();
export const userGamesCache = new MemoryCache();

// Cache key generators
export const cacheKeys = {
  game: (id: string) => `game:${id}`,
  questions: (gameId: string) => `questions:${gameId}`,
  leaderboard: (gameId: string) => `leaderboard:${gameId}`,
  userGames: (userId: string) => `userGames:${userId}`,
};

// Helper function to wrap storage calls with caching
export function withCache<T>(
  cache: MemoryCache,
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5 minutes default
): Promise<T> {
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return Promise.resolve(cached);
  }

  return fetchFn().then(data => {
    cache.set(key, data, ttl);
    return data;
  });
}

// Log cache statistics periodically (optional)
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    const gameStats = gameCache.getStats();
    const questionsStats = questionsCache.getStats();
    const leaderboardStats = leaderboardCache.getStats();

    console.log('Cache Statistics:');
    console.log('Games -', gameStats);
    console.log('Questions -', questionsStats);
    console.log('Leaderboard -', leaderboardStats);
    console.log('---');
  }, 30000); // Log every 30 seconds
}
