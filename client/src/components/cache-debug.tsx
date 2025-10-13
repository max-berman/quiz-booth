import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useLogoCache } from '@/hooks/use-logo-cache'

/**
 * Debug component to test and monitor logo cache functionality
 * This component is for development purposes only
 */
export function CacheDebug() {
	const { getCacheStats, clearCache } = useLogoCache()
	const [cacheStats, setCacheStats] = useState<{
		size: number
		entries: string[]
	}>({ size: 0, entries: [] })
	const [isVisible, setIsVisible] = useState(false)

	// Update cache stats when component mounts or cache changes
	useEffect(() => {
		setCacheStats(getCacheStats())
	}, [getCacheStats])

	// Refresh stats periodically to monitor cache changes
	useEffect(() => {
		const interval = setInterval(() => {
			setCacheStats(getCacheStats())
		}, 2000)

		return () => clearInterval(interval)
	}, [getCacheStats])

	if (!isVisible) {
		return (
			<div className='fixed bottom-4 right-4 z-50'>
				<Button
					variant='outline'
					size='sm'
					onClick={() => setIsVisible(true)}
					className='bg-background/80 backdrop-blur-sm'
				>
					Cache Debug
				</Button>
			</div>
		)
	}

	return (
		<div className='fixed bottom-4 right-4 z-50 max-w-sm'>
			<Card className='bg-background/80 backdrop-blur-sm border-2 border-primary/20'>
				<CardContent className='p-4'>
					<div className='flex justify-between items-center mb-3'>
						<h3 className='font-semibold text-sm'>Logo Cache Debug</h3>
						<div className='flex gap-2'>
							<Button
								variant='outline'
								size='sm'
								onClick={() => setCacheStats(getCacheStats())}
								className='h-6 text-xs'
							>
								Refresh
							</Button>
							<Button
								variant='destructive'
								size='sm'
								onClick={() => {
									clearCache()
									setCacheStats(getCacheStats())
								}}
								className='h-6 text-xs'
							>
								Clear
							</Button>
							<Button
								variant='ghost'
								size='sm'
								onClick={() => setIsVisible(false)}
								className='h-6 text-xs'
							>
								×
							</Button>
						</div>
					</div>

					<div className='space-y-2 text-xs'>
						<div className='flex justify-between'>
							<span>Cache Size:</span>
							<span className='font-mono'>{cacheStats.size} / 100</span>
						</div>

						<div className='flex justify-between'>
							<span>Memory Usage:</span>
							<span className='font-mono'>
								{Math.round((cacheStats.size / 100) * 100)}%
							</span>
						</div>

						{cacheStats.entries.length > 0 && (
							<div>
								<div className='font-medium mb-1'>Cached Games:</div>
								<div className='max-h-32 overflow-y-auto space-y-1'>
									{cacheStats.entries.map((gameId) => (
										<div
											key={gameId}
											className='text-xs font-mono bg-primary/10 px-2 py-1 rounded'
										>
											{gameId.substring(0, 8)}...
										</div>
									))}
								</div>
							</div>
						)}

						{cacheStats.entries.length === 0 && (
							<div className='text-muted-foreground italic'>
								No cached logos
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
