/**
 * Configuration for page visibility settings
 * Determines which pages should show/hide header and footer
 */

// Pages that should hide the header (immersive experience)
export const PAGES_WITHOUT_HEADER = [
  '/game/', // Game play pages
  '/game-customization/', // Game customization pages
]

// Pages that should hide the footer (immersive experience)
export const PAGES_WITHOUT_FOOTER = [
  '/game/', // Game play pages
  '/leaderboard/', // Leaderboard pages
  '/game-customization/', // Game customization pages
]

// Pages that should show header even if they match patterns above
export const HEADER_EXCEPTIONS = [
  '/game-created', // Game creation success page should show header
]

// Pages that should show footer even if they match patterns above
export const FOOTER_EXCEPTIONS = [
  '/game-created', // Game creation success page should show footer
]

/**
 * Check if a page should show the header
 * @param pathname - Current page path
 * @returns boolean indicating if header should be shown
 */
export function shouldShowHeader(pathname: string): boolean {
  // Check if path matches any header-hidden patterns
  const shouldHide = PAGES_WITHOUT_HEADER.some(pattern =>
    pathname.startsWith(pattern)
  )

  // Check for exceptions
  const isException = HEADER_EXCEPTIONS.some(exception =>
    pathname.startsWith(exception)
  )

  return !shouldHide || isException
}

/**
 * Check if a page should show the footer
 * @param pathname - Current page path
 * @returns boolean indicating if footer should be shown
 */
export function shouldShowFooter(pathname: string): boolean {
  // Check if path matches any footer-hidden patterns
  const shouldHide = PAGES_WITHOUT_FOOTER.some(pattern =>
    pathname.startsWith(pattern)
  )

  // Check for exceptions
  const isException = FOOTER_EXCEPTIONS.some(exception =>
    pathname.startsWith(exception)
  )

  return !shouldHide || isException
}
