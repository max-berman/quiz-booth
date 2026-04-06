/**
 * SSR-safe router utilities for server-side rendering
 * Provides fallbacks for Wouter hooks when window is not available
 */

import { createContext, useContext, ReactNode } from 'react'
import type { Location } from 'wouter'

// Create a context for SSR location
const SSRLocationContext = createContext<Location>(['/', ''])

/**
 * SSR-safe useLocation hook
 * Returns [location, setLocation] where location is the current path
 * and setLocation is a function to navigate
 */
export function useSSRLocation(): [string, (path: string) => void] {
  // On server, use the SSR context
  if (typeof window === 'undefined') {
    const [path] = useContext(SSRLocationContext)
    const router = useSSRRouter()
    return [path, router.push]
  }

  // On client, get current path from window and use router for navigation
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/'
  const router = useSSRRouter()
  return [currentPath, router.push]
}

/**
 * SSR-safe useRouter hook
 * Returns a mock router on server, uses real Wouter hook on client
 */
export function useSSRRouter() {
  // On server, return mock functions
  if (typeof window === 'undefined') {
    return {
      push: () => {},
      replace: () => {},
      back: () => {},
    }
  }

  // On client, provide basic routing functions
  return {
    push: (path: string) => {
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', path)
        window.dispatchEvent(new PopStateEvent('popstate'))
      }
    },
    replace: (path: string) => {
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', path)
        window.dispatchEvent(new PopStateEvent('popstate'))
      }
    },
    back: () => {
      if (typeof window !== 'undefined') {
        window.history.back()
      }
    },
  }
}

/**
 * SSR-safe router provider component
 * Wraps the app and provides location context for SSR
 */
export function SSRRouterProvider({ 
  children, 
  location = ['/', ''] 
}: { 
  children: ReactNode
  location?: Location 
}) {
  // On server, we use the provided location context
  if (typeof window === 'undefined') {
    return (
      <SSRLocationContext.Provider value={location}>
        {children}
      </SSRLocationContext.Provider>
    )
  }

  // On client, we need to handle routing
  // For now, just provide the context with basic routing
  return (
    <SSRLocationContext.Provider value={location}>
      {children}
    </SSRLocationContext.Provider>
  )
}

/**
 * SSR-safe custom router for server-side rendering
 * This provides a minimal router implementation that works on the server
 */
export function createSSRRouter(location: Location = ['/', '']) {
  return {
    hook: () => location,
    ssr: true,
  }
}
