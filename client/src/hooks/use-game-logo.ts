import { useEffect } from 'react'
import { logoCache } from '@/lib/logo-cache'

/**
 * Custom hook for managing game logo caching and retrieval
 * 
 * @param gameId - The game ID to cache/retrieve logo for
 * @param customLogoUrl - The custom logo URL from game data (optional)
 * @returns Object containing cached logo URL and logo alt text
 */
export function useGameLogo(gameId: string | undefined, customLogoUrl?: string) {
  // Cache logo URL when game data is loaded
  useEffect(() => {
    if (gameId && customLogoUrl) {
      logoCache.addLogo(gameId, customLogoUrl)
    }
  }, [gameId, customLogoUrl])

  // Get cached logo URL
  const cachedLogoUrl = gameId ? logoCache.getLogo(gameId) : undefined

  // Determine which logo to show - use cached logo first, then game data, otherwise use default
  const logoUrl = cachedLogoUrl || customLogoUrl || '/assets/logo.png'
  const logoAlt = cachedLogoUrl || customLogoUrl ? 'Custom game logo' : 'NaknNick.com games logo'

  return {
    cachedLogoUrl,
    logoUrl,
    logoAlt,
  }
}
