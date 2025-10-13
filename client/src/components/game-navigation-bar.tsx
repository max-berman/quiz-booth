import { Button } from '@/components/ui/button'
import { ArrowRight, ExternalLink } from 'lucide-react'
import type { Game } from '@shared/firebase-types'

interface GameNavigationBarProps {
	game: Game
	isAnswered: boolean
	currentQuestionIndex: number
	questionsLength: number
	onNextQuestion: () => void
}

export function GameNavigationBar({
	game,
	isAnswered,
	currentQuestionIndex,
	questionsLength,
	onNextQuestion,
}: GameNavigationBarProps) {
	return (
		<div className='max-w-4xl mx-auto px-2 sm:px-6 lg:px-8 w-full '>
			<div className='flex justify-center p-2 mt-4'>
				<a
					href={game.customization?.customLogoLink || 'https://naknick.com'}
					target='_blank'
					rel='noopener noreferrer'
				>
					{game.customization?.customLogoUrl ? (
						<img
							src={game.customization.customLogoUrl}
							alt='Custom game logo'
							className='max-h-12 '
						/>
					) : (
						<div className='flex flex-col items-center font-medium'>
							<img
								src='/assets/naknick-logo.png'
								alt='QuizBooth.games logo'
								className='max-h-12 w-auto'
							/>
							<span className='text-xs flex items-center mt-2'>
								Build by Naknick.com <ExternalLink className='ml-1 h-3 w-3' />
							</span>
						</div>
					)}
				</a>
			</div>
		</div>
	)
}
