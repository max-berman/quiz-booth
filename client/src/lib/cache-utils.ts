/**
 * Cache Management Utilities
 * Provides functions for managing service worker caches and storage
 */

/**
 * Clear all application caches including service worker, localStorage, and sessionStorage
 */
export async function clearAppCache(): Promise<{ success: boolean; message: string }> {
  try {
    const results = {
      caches: false,
      serviceWorker: false,
      localStorage: false,
      sessionStorage: false
    }

    // Clear browser caches
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
      results.caches = true
      console.log('Browser caches cleared:', cacheNames)
    }

    // Unregister service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(
        registrations.map(registration => registration.unregister())
      )
      results.serviceWorker = true
      console.log('Service workers unregistered:', registrations.length)
    }

    // Clear storage
    try {
      localStorage.clear()
      results.localStorage = true
      console.log('localStorage cleared')
    } catch (error) {
      console.warn('Failed to clear localStorage:', error)
    }

    try {
      sessionStorage.clear()
      results.sessionStorage = true
      console.log('sessionStorage cleared')
    } catch (error) {
      console.warn('Failed to clear sessionStorage:', error)
    }

    const success = Object.values(results).some(result => result)
    const message = success
      ? 'Cache cleared successfully'
      : 'No caches found to clear'

    return { success, message }

  } catch (error) {
    console.error('Error clearing cache:', error)
    return {
      success: false,
      message: `Failed to clear cache: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Check if service worker is controlling the page
 */
export function isServiceWorkerControlling(): boolean {
  return !!navigator.serviceWorker?.controller
}

/**
 * Get service worker registration information
 */
export async function getServiceWorkerInfo(): Promise<{
  isControlling: boolean
  registrations: number
  state?: string
}> {
  if (!('serviceWorker' in navigator)) {
    return { isControlling: false, registrations: 0 }
  }

  const registrations = await navigator.serviceWorker.getRegistrations()
  const controller = navigator.serviceWorker.controller

  return {
    isControlling: !!controller,
    registrations: registrations.length,
    state: controller?.state
  }
}

/**
 * Force service worker update
 */
export async function forceServiceWorkerUpdate(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations()

    for (const registration of registrations) {
      await registration.update()
    }

    console.log('Service worker update forced')
    return true
  } catch (error) {
    console.error('Failed to force service worker update:', error)
    return false
  }
}

/**
 * Send message to service worker to clear specific cache
 */
export async function clearServiceWorkerCache(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
    return false
  }

  return new Promise((resolve) => {
    const messageChannel = new MessageChannel()

    messageChannel.port1.onmessage = (event) => {
      if (event.data.success) {
        console.log('Service worker cache cleared successfully')
        resolve(true)
      } else {
        console.error('Failed to clear service worker cache:', event.data.error)
        resolve(false)
      }
    }

    // TypeScript-safe controller access
    const controller = navigator.serviceWorker.controller
    if (controller) {
      controller.postMessage(
        { type: 'CLEAR_CACHE' },
        [messageChannel.port2]
      )

      // Timeout after 5 seconds
      setTimeout(() => {
        console.warn('Service worker cache clear timeout')
        resolve(false)
      }, 5000)
    } else {
      resolve(false)
    }
  })
}

/**
 * Get cache storage information
 */
export async function getCacheInfo(): Promise<{
  totalCaches: number
  cacheNames: string[]
  totalSize?: number
}> {
  if (!('caches' in window)) {
    return { totalCaches: 0, cacheNames: [] }
  }

  try {
    const cacheNames = await caches.keys()
    let totalSize = 0

    // Calculate approximate cache sizes
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName)
      const requests = await cache.keys()

      for (const request of requests) {
        const response = await cache.match(request)
        if (response) {
          const contentLength = response.headers.get('content-length')
          if (contentLength) {
            totalSize += parseInt(contentLength, 10)
          }
        }
      }
    }

    return {
      totalCaches: cacheNames.length,
      cacheNames,
      totalSize: totalSize > 0 ? totalSize : undefined
    }
  } catch (error) {
    console.error('Error getting cache info:', error)
    return { totalCaches: 0, cacheNames: [] }
  }
}

/**
 * Check if app is running as PWA
 */
export function isRunningAsPWA(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  )
}

/**
 * Reload the page and bypass cache
 */
export function hardReload(): void {
  // Clear cache and reload
  clearAppCache().then(() => {
    window.location.reload()
  })
}

/**
 * Create a cache management component for debugging
 */
export function createCacheDebugInfo(): {
  isPWA: boolean
  hasServiceWorker: boolean
  isControlled: boolean
  cacheCount: number
} {
  return {
    isPWA: isRunningAsPWA(),
    hasServiceWorker: 'serviceWorker' in navigator,
    isControlled: isServiceWorkerControlling(),
    cacheCount: 'caches' in window ? -1 : 0 // Will be updated async
  }
}
