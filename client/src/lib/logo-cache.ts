/**
 * Logo Cache Management
 * Provides caching for custom logo URLs to eliminate loading delays on game pages
 */

interface LogoCacheEntry {
  url: string
  gameId: string
  timestamp: number
  expiresAt: number
}

interface LogoCache {
  [gameId: string]: LogoCacheEntry
}

// Cache configuration
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours
const MAX_CACHE_SIZE = 100 // Maximum number of cached logos

class LogoCacheManager {
  private cache: LogoCache = {}

  /**
   * Add logo URL to cache
   * @param gameId - The game ID
   * @param logoUrl - The custom logo URL (null to skip caching)
   */
  addLogo(gameId: string, logoUrl: string | null): void {
    if (!logoUrl) return

    // Clean up old entries if cache is full
    if (Object.keys(this.cache).length >= MAX_CACHE_SIZE) {
      this.cleanup()
    }

    this.cache[gameId] = {
      url: logoUrl,
      gameId,
      timestamp: Date.now(),
      expiresAt: Date.now() + CACHE_TTL
    }

    // Persist to localStorage for page refreshes
    this.persistToStorage()
  }

  /**
   * Get cached logo URL for a game
   * @param gameId - The game ID
   * @returns The cached logo URL or null if not found/expired
   */
  getLogo(gameId: string): string | null {
    const entry = this.cache[gameId]

    if (!entry) return null

    // Check if entry is expired
    if (Date.now() > entry.expiresAt) {
      delete this.cache[gameId]
      this.persistToStorage()
      return null
    }

    return entry.url
  }

  /**
   * Remove expired entries from cache
   */
  private cleanup(): void {
    const now = Date.now()
    Object.keys(this.cache).forEach(gameId => {
      if (now > this.cache[gameId].expiresAt) {
        delete this.cache[gameId]
      }
    })
  }

  /**
   * Persist cache to localStorage
   */
  private persistToStorage(): void {
    try {
      localStorage.setItem('quizbooth-logo-cache', JSON.stringify(this.cache))
    } catch (error) {
      console.warn('Failed to persist logo cache:', error)
    }
  }

  /**
   * Load cache from localStorage
   */
  loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('quizbooth-logo-cache')
      if (stored) {
        this.cache = JSON.parse(stored)
        this.cleanup() // Remove expired entries on load
      }
    } catch (error) {
      console.warn('Failed to load logo cache:', error)
    }
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache = {}
    localStorage.removeItem('quizbooth-logo-cache')
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; entries: string[] } {
    return {
      size: Object.keys(this.cache).length,
      entries: Object.keys(this.cache)
    }
  }
}

// Singleton instance
export const logoCache = new LogoCacheManager()
