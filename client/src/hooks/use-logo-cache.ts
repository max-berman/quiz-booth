import { useCallback } from 'react'
import { logoCache } from '@/lib/logo-cache'

/**
 * Hook for managing logo cache operations
 * Provides convenient methods for caching and retrieving logo URLs
 */
export function useLogoCache() {
  /**
   * Get cached logo URL for a game
   * @param gameId - The game ID
   * @returns The cached logo URL or null if not found/expired
   */
  const getCachedLogo = useCallback((gameId: string) => {
    return logoCache.getLogo(gameId)
  }, [])

  /**
   * Cache a logo URL for a game
   * @param gameId - The game ID
   * @param logoUrl - The logo URL to cache
   */
  const cacheLogo = useCallback((gameId: string, logoUrl: string) => {
    logoCache.addLogo(gameId, logoUrl)
  }, [])

  /**
   * Clear the entire logo cache
   */
  const clearCache = useCallback(() => {
    logoCache.clear()
  }, [])

  /**
   * Get cache statistics
   * @returns Object containing cache size and entry IDs
   */
  const getCacheStats = useCallback(() => {
    return logoCache.getStats()
  }, [])

  return {
    getCachedLogo,
    cacheLogo,
    clearCache,
    getCacheStats
  }
}
