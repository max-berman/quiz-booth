// Game-related utility functions to eliminate code duplication

import { Game } from '@shared/firebase-types'
import { useQuery } from '@tanstack/react-query'
import { isWebsite, formatWebsite } from './website-utils'
import { useFirebaseFunctions } from '@/hooks/use-firebase-functions'

/**
 * Hook for fetching play count for a game
 */
export function usePlayCount(gameId: string) {
  return useQuery<number>({
    queryKey: ['getGamePlayCount', gameId],
    queryFn: async () => {
      // console.log(`Fetching play count for game ${gameId}`)
      const response = await fetch(`/api/games/play-count?gameId=${gameId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch play count: ${response.statusText}`);
      }
      const result = await response.json();
      // console.log(`Play count response for game ${gameId}:`, result)
      return result.count;
    },
    enabled: !!gameId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  })
}

/**
 * Hook for fetching question count for a game
 */
export function useQuestionCount(gameId: string) {
  return useQuery<number>({
    queryKey: ['getGameQuestions', gameId],
    queryFn: async () => {
      // console.log(`Fetching questions for game ${gameId}`)
      const response = await fetch(`/api/games/questions?gameId=${gameId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch questions: ${response.statusText}`);
      }
      const result = await response.json();
      // console.log(`Questions response for game ${gameId}:`, result)
      return result.count;
    },
    enabled: !!gameId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })
}

/**
 * Format game company name with website detection
 */
export function formatCompanyName(companyName: string): { display: string; isWebsite: boolean } {
  return {
    display: isWebsite(companyName) ? formatWebsite(companyName) : companyName,
    isWebsite: isWebsite(companyName)
  }
}

/**
 * Get existing prizes for editing
 */
export function getExistingPrizes(game: Game): { placement: string; prize: string }[] {
  const existingPrizes: { placement: string; prize: string }[] = []

  if (game.prizes && Array.isArray(game.prizes) && game.prizes.length > 0) {
    existingPrizes.push(...game.prizes)
  }

  if (existingPrizes.length === 0) {
    existingPrizes.push({
      placement: '1st Place',
      prize: '',
    })
  }

  return existingPrizes
}

/**
 * Check if game was modified (different from creation date)
 */
export function isGameModified(game: Game): boolean {
  return !!game.modifiedAt &&
    new Date(game.modifiedAt).getTime() !== new Date(game.createdAt).getTime()
}
