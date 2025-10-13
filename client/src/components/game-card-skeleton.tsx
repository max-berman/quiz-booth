import { Card, CardContent } from '@/components/ui/card'

interface GameCardSkeletonProps {
	/**
	 * Number of skeleton cards to display
	 * @default 3
	 */
	count?: number
}

/**
 * GameCardSkeleton component displays loading skeleton cards for game listings
 * Used during data fetching to provide visual feedback
 */
export function GameCardSkeleton({ count = 3 }: GameCardSkeletonProps) {
	return (
		<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
			{Array.from({ length: count }, (_, i) => (
				<Card key={i} className='animate-pulse'>
					<CardContent className='p-6'>
						<div className='space-y-3'>
							<div className='h-4 bg-muted rounded w-3/4 mx-auto'></div>
							<div className='h-3 bg-muted rounded w-1/2 mx-auto'></div>
							<div className='space-y-2'>
								<div className='h-3 bg-muted rounded'></div>
								<div className='h-3 bg-muted rounded'></div>
								<div className='h-3 bg-muted rounded w-2/3'></div>
							</div>
							<div className='h-10 bg-muted rounded mt-4'></div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	)
}
