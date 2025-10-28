import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { firebaseAnalytics } from './lib/firebase-analytics'

// Track initial page view in production only
if (
	window.location.hostname !== 'localhost' &&
	window.location.hostname !== '127.0.0.1'
) {
	// Track initial page view
	const trackInitialPageView = () => {
		firebaseAnalytics.trackPageView(document.title || window.location.pathname)
	}

	// Try to track immediately if analytics is available
	if (firebaseAnalytics.isAvailable()) {
		trackInitialPageView()
	} else {
		// Wait for analytics to be ready with a timeout fallback
		let pageViewTracked = false
		const maxWaitTime = 5000 // 5 seconds max wait
		const startTime = Date.now()

		const checkAndTrack = () => {
			if (pageViewTracked) return

			if (firebaseAnalytics.isAvailable()) {
				trackInitialPageView()
				pageViewTracked = true
			} else if (Date.now() - startTime < maxWaitTime) {
				// Try again in 100ms
				setTimeout(checkAndTrack, 100)
			} else {
				// Fallback: track anyway after timeout
				console.warn(
					'Analytics not ready after timeout, tracking page view anyway'
				)
				trackInitialPageView()
				pageViewTracked = true
			}
		}

		// Start checking
		setTimeout(checkAndTrack, 100)
	}
}

createRoot(document.getElementById('root')!).render(<App />)
