import { ArrowLeft } from 'lucide-react'

interface SwipeArrowProps {
	isVisible: boolean
	progress: number // 0-100
	direction: 'left' | 'right' | null
}

export function SwipeArrow({
	isVisible,
	progress,
	direction,
}: SwipeArrowProps) {
	// Only show for left swipes
	if (direction !== 'left') return null

	// Calculate animation values based on progress
	const opacity = Math.min(progress / 30, 1) // Fade in quickly
	const scale = 0.8 + (progress / 100) * 0.4 // Scale from 0.8 to 1.2
	const translateX = -Math.min(progress / 2, 20) // Move left up to 20px

	return (
		<div
			className='fixed right-4 top-1/2 transform -translate-y-1/2 z-40 pointer-events-none'
			style={{
				opacity: isVisible ? opacity : 0,
				transform: `translateX(${translateX}px) scale(${scale})`,
				transition: isVisible
					? 'opacity 0.2s ease-out, transform 0.2s ease-out'
					: 'opacity 0.3s ease-out, transform 0.3s ease-out',
			}}
		>
			<div className='flex items-center gap-2 bg-primary/20 backdrop-blur-sm rounded-full p-3 border border-primary/30 shadow-lg'>
				<ArrowLeft className='h-6 w-6 text-primary' />
				<span className='text-sm font-medium text-primary pr-2'>
					Swipe to continue
				</span>
			</div>
		</div>
	)
}
