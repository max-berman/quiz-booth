/**
 * Configuration for dynamic routes that should be handled by client-side routing
 * These routes will receive an empty root div and be fully rendered by client-side React
 */
export const DYNAMIC_ROUTES = [
  '/game/',
  '/dashboard',
  '/edit-questions/',
  '/game-created',
  '/leaderboard/',
  '/results/',
  '/submissions/',
] as const;

/**
 * Check if a given path should be treated as a dynamic route
 * @param path The path to check
 * @returns boolean indicating if the path is a dynamic route
 */
export function isDynamicRoute(path: string): boolean {
  return DYNAMIC_ROUTES.some(route => path.startsWith(route));
}
