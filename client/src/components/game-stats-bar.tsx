import { SimpleProgress } from '@/components/ui/simple-progress'
import { Timer } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface GameStatsBarProps {
	timeLeft: number
	currentQuestionIndex: number
	questionsLength: number
	progressPercentage: number
	score: number
}

export function GameStatsBar({
	timeLeft,
	currentQuestionIndex,
	questionsLength,
	progressPercentage,
	score,
}: GameStatsBarProps) {
	const [animationKey, setAnimationKey] = useState(0)
	const [isAnimating, setIsAnimating] = useState(false)
	const animationTimerRef = useRef<NodeJS.Timeout | null>(null)
	const previousScoreRef = useRef(score)

	// Detect when score changes and trigger animation
	useEffect(() => {
		if (score !== previousScoreRef.current) {
			// Clear any existing timer
			if (animationTimerRef.current) {
				clearTimeout(animationTimerRef.current)
			}

			setAnimationKey((prev) => prev + 1)
			previousScoreRef.current = score
			setIsAnimating(true)

			// Reset animation state after animation completes
			animationTimerRef.current = setTimeout(() => {
				setIsAnimating(false)
				animationTimerRef.current = null
			}, 1000) // Match animate-duration-slow duration
		}
	}, [score])

	// Cleanup timer on unmount
	useEffect(() => {
		return () => {
			if (animationTimerRef.current) {
				clearTimeout(animationTimerRef.current)
			}
		}
	}, [])

	return (
		<div className='flex justify-between items-center w-full max-w-4xl'>
			<div className='text-center p-2 h-full min-w-[60px]'>
				<Timer
					className={`h-6 w-6 -rotate-[30deg] mx-auto mb-1 ${
						timeLeft <= 10 ? 'text-destructive animate-ping' : ''
					}`}
				/>
				<div
					className={`text-lg font-bold ${
						timeLeft <= 10 ? 'text-destructive text-xl' : ''
					}`}
					data-testid='text-timer'
				>
					{timeLeft}s
				</div>
			</div>

			{/* Game Progress */}
			<div className='space-y-1 w-full mx-4 '>
				<div className='text-lg text-center font-medium'>
					Question <strong>{currentQuestionIndex + 1}</strong> of{' '}
					{questionsLength}
				</div>
				<SimpleProgress value={progressPercentage} className='h-4 bg-card' />
			</div>
			<div className='text-center p-2 h-full mr-1'>
				<div className='text-primary capitalize'>
					<span>Score </span>

					<strong
						key={animationKey}
						className={`block text-2xl transition-all ${
							isAnimating ? 'animate-jelly' : ''
						}`}
					>
						{score}
					</strong>
				</div>
			</div>
		</div>
	)
}
