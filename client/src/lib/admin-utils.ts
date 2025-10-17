import { getClientEnvironmentConfig } from '@/config/environment'
import { useAuth } from '@/contexts/auth-context'

/**
 * Check if the current user is an admin
 * @returns boolean indicating if the current user is an admin
 */
export function useIsAdmin(): boolean {
  const { user } = useAuth()
  const config = getClientEnvironmentConfig()

  if (!user) {
    return false
  }

  return config.admin.userIds.includes(user.uid)
}

/**
 * Check if a specific user ID is an admin
 * @param userId - The user ID to check
 * @returns boolean indicating if the user is an admin
 */
export function isUserAdmin(userId: string): boolean {
  const config = getClientEnvironmentConfig()
  return config.admin.userIds.includes(userId)
}
