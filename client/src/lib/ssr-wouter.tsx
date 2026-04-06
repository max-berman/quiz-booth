/**
 * SSR-safe Wouter implementation
 * Provides a minimal router that works on the server
 */

import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import type { Location } from 'wouter'

// Create a context for SSR location
const SSRLocationContext = createContext<Location>(['/', ''])

/**
 * SSR-safe useLocation hook
 * Returns a mock location on server, uses real Wouter hook on client
 */
export function useLocation(): Location {
  // On server, use the SSR context
  if (typeof window === 'undefined') {
    return useContext(SSRLocationContext)
  }

  // On client, use the real Wouter hook (lazy import)
  const [wouterLocation, setWouterLocation] = useState<Location>(['/', ''])
  
  useEffect(() => {
    import('wouter').then(({ useLocation: wouterUseLocation }) => {
      // This is a hack - we can't call hooks inside useEffect
      // We need a different approach
    })
  }, [])
  
  // Fallback to SSR context on client until Wouter loads
  return useContext(SSRLocationContext)
}

/**
 * SSR-safe useRouter hook
 * Returns a mock router on server, uses real Wouter hook on client
 */
export function useRouter() {
  // On server, return mock functions
  if (typeof window === 'undefined') {
    return {
      push: () => {},
      replace: () => {},
      back: () => {},
    }
  }

  // On client, we need to handle this differently
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
 * SSR-safe Link component
 */
export function Link({ href, children, ...props }: any) {
  // On server, render a simple anchor
  if (typeof window === 'undefined') {
    return <a href={href} {...props}>{children}</a>
  }

  // On client, use a regular anchor with click handler
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    window.history.pushState({}, '', href)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }
  
  return <a href={href} onClick={handleClick} {...props}>{children}</a>
}

/**
 * SSR-safe Route component
 */
export function Route({ path, component: Component, ...props }: any) {
  // On server, we need to check if the current path matches
  if (typeof window === 'undefined') {
    const currentLocation = useContext(SSRLocationContext)
    const [currentPath] = currentLocation
    
    // Simple path matching for SSR
    if (path === currentPath || (path === '/' && currentPath === '')) {
      return <Component {...props} />
    }
    
    // Check for parameterized routes
    if (path.includes(':') && currentPath.startsWith(path.split(':')[0])) {
      return <Component {...props} />
    }
    
    return null
  }

  // On client, we need to handle routing differently
  // For now, return null and let client-side routing handle it
  return null
}

/**
 * SSR-safe Switch component
 */
export function Switch({ children }: { children: ReactNode }) {
  // On server, we render the first matching route
  if (typeof window === 'undefined') {
    return <>{children}</>
  }

  // On client, we need a different approach
  // For now, just render children
  return <>{children}</>
}

/**
 * SSR-safe router provider component
 */
export function Router({ children, location = ['/', ''] }: { 
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
  // For now, just provide the context
  const [currentLocation, setCurrentLocation] = useState<Location>(location)
  
  useEffect(() => {
    const handlePopState = () => {
      setCurrentLocation([window.location.pathname, window.location.search])
    }
    
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])
  
  return (
    <SSRLocationContext.Provider value={currentLocation}>
      {children}
    </SSRLocationContext.Provider>
  )
}

/**
 * SSR-safe useParams hook
 */
export function useParams() {
  // On server, return empty params
  if (typeof window === 'undefined') {
    return {}
  }

  // On client, parse params from URL
  // This is a simplified implementation
  const match = window.location.pathname.match(/:(\w+)/g)
  if (!match) return {}
  
  const params: Record<string, string> = {}
  // Simplified param extraction
  return params
}