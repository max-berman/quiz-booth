import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import {
	clearAppCache,
	getServiceWorkerInfo,
	getCacheInfo,
	forceServiceWorkerUpdate,
	createCacheDebugInfo,
} from '@/lib/cache-utils'

export function CacheDebug() {
	const { toast } = useToast()
	const [debugInfo, setDebugInfo] = useState(createCacheDebugInfo())
	const [serviceWorkerInfo, setServiceWorkerInfo] = useState<Awaited<
		ReturnType<typeof getServiceWorkerInfo>
	> | null>(null)
	const [cacheInfo, setCacheInfo] = useState<Awaited<
		ReturnType<typeof getCacheInfo>
	> | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [isVisible, setIsVisible] = useState(true)

	useEffect(() => {
		updateDebugInfo()
	}, [])

	const updateDebugInfo = async () => {
		setIsLoading(true)
		try {
			setDebugInfo(createCacheDebugInfo())
			setServiceWorkerInfo(await getServiceWorkerInfo())
			setCacheInfo(await getCacheInfo())
		} catch (error) {
			console.error('Error updating debug info:', error)
		} finally {
			setIsLoading(false)
		}
	}

	const handleClearCache = async () => {
		setIsLoading(true)
		try {
			const result = await clearAppCache()
			toast({
				title: result.success ? 'Cache Cleared' : 'Cache Clear Failed',
				description: result.message,
				variant: result.success ? 'default' : 'destructive',
			})
			await updateDebugInfo()
		} catch (error) {
			toast({
				title: 'Cache Clear Error',
				description: 'Failed to clear cache',
				variant: 'destructive',
			})
		} finally {
			setIsLoading(false)
		}
	}

	const handleForceUpdate = async () => {
		setIsLoading(true)
		try {
			const success = await forceServiceWorkerUpdate()
			toast({
				title: success ? 'Update Forced' : 'Update Failed',
				description: success
					? 'Service worker update forced'
					: 'Failed to force update',
				variant: success ? 'default' : 'destructive',
			})
			await updateDebugInfo()
		} catch (error) {
			toast({
				title: 'Update Error',
				description: 'Failed to force update',
				variant: 'destructive',
			})
		} finally {
			setIsLoading(false)
		}
	}

	const handleHardReload = () => {
		window.location.reload()
	}

	// Only show on localhost:5000 (development server) and if visible
	const isLocalhost5000 =
		window.location.hostname === 'localhost' && window.location.port === '5000'

	if (!isLocalhost5000 || !isVisible) {
		return null
	}

	return (
		<div className='fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm z-50'>
			<div className='flex justify-between items-center mb-3'>
				<h3 className='text-sm font-semibold text-gray-800'>Cache Debug</h3>
				<button
					onClick={updateDebugInfo}
					disabled={isLoading}
					className='text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors'
				>
					{isLoading ? '...' : 'Refresh'}
				</button>
			</div>

			<div className='space-y-2 text-xs'>
				<div className='flex justify-between'>
					<span className='text-gray-600'>PWA Mode:</span>
					<span
						className={
							debugInfo.isPWA ? 'text-green-600 font-medium' : 'text-gray-800'
						}
					>
						{debugInfo.isPWA ? 'Yes' : 'No'}
					</span>
				</div>

				<div className='flex justify-between'>
					<span className='text-gray-600'>Service Worker:</span>
					<span
						className={
							debugInfo.hasServiceWorker
								? 'text-green-600 font-medium'
								: 'text-gray-800'
						}
					>
						{debugInfo.hasServiceWorker ? 'Available' : 'Not Available'}
					</span>
				</div>

				<div className='flex justify-between'>
					<span className='text-gray-600'>Controlled:</span>
					<span
						className={
							debugInfo.isControlled
								? 'text-green-600 font-medium'
								: 'text-gray-800'
						}
					>
						{debugInfo.isControlled ? 'Yes' : 'No'}
					</span>
				</div>

				{serviceWorkerInfo && (
					<div className='flex justify-between'>
						<span className='text-gray-600'>SW Registrations:</span>
						<span className='text-gray-800'>
							{serviceWorkerInfo.registrations}
						</span>
					</div>
				)}

				{cacheInfo && (
					<div className='flex justify-between'>
						<span className='text-gray-600'>Caches:</span>
						<span className='text-gray-800'>{cacheInfo.totalCaches}</span>
					</div>
				)}

				{cacheInfo?.totalSize && (
					<div className='flex justify-between'>
						<span className='text-gray-600'>Cache Size:</span>
						<span className='text-gray-800'>
							{(cacheInfo.totalSize / 1024 / 1024).toFixed(2)} MB
						</span>
					</div>
				)}
			</div>

			<div className='mt-3 space-y-2'>
				<button
					onClick={handleClearCache}
					disabled={isLoading}
					className='w-full bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2 rounded transition-colors disabled:opacity-50'
				>
					{isLoading ? 'Clearing...' : 'Clear All Cache'}
				</button>

				<button
					onClick={handleForceUpdate}
					disabled={isLoading}
					className='w-full bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-2 rounded transition-colors disabled:opacity-50'
				>
					{isLoading ? 'Updating...' : 'Force SW Update'}
				</button>

				<button
					onClick={handleHardReload}
					className='w-full bg-gray-500 hover:bg-gray-600 text-white text-xs py-1 px-2 rounded transition-colors'
				>
					Hard Reload
				</button>

				<button
					onClick={() => window.open('/clear-sw.html', '_blank')}
					className='w-full bg-orange-500 hover:bg-orange-600 text-white text-xs py-1 px-2 rounded transition-colors'
				>
					Open Clear SW Page
				</button>
			</div>

			<div className='mt-2 text-xs text-gray-500'>
				<button
					onClick={() => setIsVisible(false)}
					className='text-blue-500 hover:text-blue-700'
				>
					Hide Debug
				</button>
			</div>
		</div>
	)
}
