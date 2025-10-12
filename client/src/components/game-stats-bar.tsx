import { Progress } from '@/components/ui/progress'
import { Timer } from 'lucide-react'

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
	return (
		<div className='flex justify-between items-center w-full'>
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
			<div className='space-y-4 w-full mx-4'>
				<div className='text-lg text-center font-medium'>
					Question <strong>{currentQuestionIndex + 1}</strong> of{' '}
					{questionsLength}
				</div>
				<Progress value={progressPercentage} className='h-4 bg-card' />
			</div>
			<div className='text-center p-2 h-full'>
				<div className='text-primary capitalize'>
					Score <strong className='text-lg'>{score}</strong>
				</div>
			</div>
		</div>
	)
}
