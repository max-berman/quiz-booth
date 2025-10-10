// QuizBooth Service Worker
// Custom service worker with controlled caching for better mobile performance

const CACHE_VERSION = 'v2.0.1'
const CACHE_NAME = `quizbooth-${CACHE_VERSION}`

// Critical assets to cache immediately
const urlsToCache = [
	'/',
	'/assets/index.css',
	'/assets/index.js',
	'/assets/vendor-react.js',
	'/assets/vendor-radix.js',
	'/assets/vendor-query.js',
	'/assets/vendor-forms.js',
	'/assets/vendor-charts.js',
	'/assets/vendor-icons.js',
	'/assets/quiz-booth-icon.png',
	'/manifest.webmanifest',
]

// Install event - cache critical assets
self.addEventListener('install', (event) => {
	console.log('Service Worker installing...')

	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => {
				console.log('Caching critical assets')
				return cache.addAll(urlsToCache)
			})
			.then(() => {
				console.log('Service Worker installed successfully')
				return self.skipWaiting() // Activate immediately
			})
			.catch((error) => {
				console.error('Service Worker installation failed:', error)
			})
	)
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
	console.log('Service Worker activating...')

	event.waitUntil(
		caches
			.keys()
			.then((cacheNames) => {
				return Promise.all(
					cacheNames.map((cacheName) => {
						// Delete old caches that don't match current version
						if (
							cacheName !== CACHE_NAME &&
							cacheName.startsWith('quizbooth-')
						) {
							console.log('Deleting old cache:', cacheName)
							return caches.delete(cacheName)
						}
					})
				)
			})
			.then(() => {
				console.log('Service Worker activated successfully')
				return self.clients.claim() // Take control of all clients
			})
	)
})

// Fetch event - handle requests with smart caching strategy
self.addEventListener('fetch', (event) => {
	// Skip non-GET requests
	if (event.request.method !== 'GET') {
		return
	}

	// Skip Chrome extensions and external resources
	if (
		event.request.url.startsWith('chrome-extension://') ||
		event.request.url.includes('extension')
	) {
		return
	}

	// Skip dynamic routes that should never be cached (game results, etc.)
	const url = new URL(event.request.url)
	const pathname = url.pathname

	// Never cache dynamic results pages - they need fresh data each time
	if (pathname.startsWith('/results/')) {
		// Always fetch from network for results pages
		return event.respondWith(
			fetch(event.request)
				.then((networkResponse) => {
					return networkResponse
				})
				.catch((error) => {
					console.error('Fetch failed for results page:', error)
					return new Response('Network error', {
						status: 408,
						headers: { 'Content-Type': 'text/plain' },
					})
				})
		)
	}

	// Never cache game pages - they need fresh session data
	if (pathname.startsWith('/game/')) {
		// Always fetch from network for game pages
		return event.respondWith(
			fetch(event.request)
				.then((networkResponse) => {
					return networkResponse
				})
				.catch((error) => {
					console.error('Fetch failed for game page:', error)
					return new Response('Network error', {
						status: 408,
						headers: { 'Content-Type': 'text/plain' },
					})
				})
		)
	}

	event.respondWith(
		caches.match(event.request).then((cachedResponse) => {
			// For API calls, always try network first
			if (event.request.url.includes('/api/')) {
				return fetch(event.request)
					.then((networkResponse) => {
						// Cache successful API responses for short time
						if (networkResponse.ok) {
							const responseClone = networkResponse.clone()
							caches.open(CACHE_NAME).then((cache) => {
								cache.put(event.request, responseClone)
							})
						}
						return networkResponse
					})
					.catch(() => {
						// If network fails, return cached version if available
						return (
							cachedResponse ||
							new Response('Network error', {
								status: 408,
								headers: { 'Content-Type': 'text/plain' },
							})
						)
					})
			}

			// For static assets, use cache-first strategy
			if (cachedResponse) {
				// Update cache in background for next visit
				fetch(event.request)
					.then((networkResponse) => {
						if (networkResponse.ok) {
							caches.open(CACHE_NAME).then((cache) => {
								cache.put(event.request, networkResponse)
							})
						}
					})
					.catch(() => {
						// Ignore fetch errors for background updates
					})

				return cachedResponse
			}

			// For everything else, try network
			return fetch(event.request)
				.then((networkResponse) => {
					// Cache successful responses
					if (networkResponse.ok) {
						const responseClone = networkResponse.clone()
						caches.open(CACHE_NAME).then((cache) => {
							cache.put(event.request, responseClone)
						})
					}
					return networkResponse
				})
				.catch((error) => {
					console.error('Fetch failed:', error)
					// Return offline page or error response
					return new Response('You appear to be offline', {
						status: 503,
						headers: { 'Content-Type': 'text/plain' },
					})
				})
		})
	)
})

// Message event - handle cache management commands
self.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'SKIP_WAITING') {
		self.skipWaiting()
	}

	if (event.data && event.data.type === 'CLEAR_CACHE') {
		caches
			.keys()
			.then((cacheNames) => {
				return Promise.all(
					cacheNames.map((cacheName) => caches.delete(cacheName))
				)
			})
			.then(() => {
				event.ports[0].postMessage({ success: true })
			})
			.catch((error) => {
				event.ports[0].postMessage({ success: false, error: error.message })
			})
	}
})
