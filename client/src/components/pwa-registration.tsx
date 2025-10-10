import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { clearAppCache, forceServiceWorkerUpdate } from '@/lib/cache-utils'

export function PWARegistration() {
	const { toast } = useToast()
	const [updateAvailable, setUpdateAvailable] = useState(false)
	const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)

	useEffect(() => {
		// Only register service worker in production
		if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
			// Register service worker
			navigator.serviceWorker
				.register('/sw.js')
				.then((registration) => {
					console.log('SW registered: ', registration)

					// Check for updates
					registration.addEventListener('updatefound', () => {
						const newWorker = registration.installing
						if (newWorker) {
							newWorker.addEventListener('statechange', () => {
								if (
									newWorker.state === 'installed' &&
									navigator.serviceWorker.controller
								) {
									// New content is available, show update prompt
									setUpdateAvailable(true)
									setWaitingWorker(newWorker)

									toast({
										title: 'New version available',
										description:
											'A new version of QuizBooth is available. Would you like to update?',
										action: (
											<div className='flex gap-2'>
												<button
													onClick={() => {
														newWorker.postMessage({ type: 'SKIP_WAITING' })
														window.location.reload()
													}}
													className='bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary/90 transition-colors'
												>
													Update
												</button>
												<button
													onClick={async () => {
														// Clear cache and force update
														await clearAppCache()
														await forceServiceWorkerUpdate()
														window.location.reload()
													}}
													className='bg-secondary text-white px-3 py-1 rounded text-sm hover:bg-secondary/90 transition-colors'
												>
													Clear Cache & Update
												</button>
											</div>
										),
										duration: 15000, // Show for 15 seconds
									})
								}
							})
						}
					})

					// Check for updates on page load
					registration.update()
				})
				.catch((registrationError) => {
					console.log('SW registration failed: ', registrationError)

					// Show error toast for debugging
					if (process.env.NODE_ENV === 'development') {
						toast({
							title: 'Service Worker Registration Failed',
							description: 'Check console for details',
							variant: 'destructive',
							duration: 5000,
						})
					}
				})

			// Listen for controller change (when update is activated)
			navigator.serviceWorker.addEventListener('controllerchange', () => {
				console.log('Service worker controller changed, reloading page')
				window.location.reload()
			})
		}
	}, [toast])

	// Handle offline/online status
	useEffect(() => {
		const handleOnline = () => {
			toast({
				title: "You're back online",
				description: 'Connection restored.',
				duration: 3000,
			})
		}

		const handleOffline = () => {
			toast({
				title: "You're offline",
				description: 'Some features may be limited.',
				variant: 'destructive',
				duration: 5000,
			})
		}

		window.addEventListener('online', handleOnline)
		window.addEventListener('offline', handleOffline)

		return () => {
			window.removeEventListener('online', handleOnline)
			window.removeEventListener('offline', handleOffline)
		}
	}, [toast])

	return null // This component doesn't render anything visible
}
