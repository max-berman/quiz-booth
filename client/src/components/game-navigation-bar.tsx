import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
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
		<div className='sticky top-0 z-50 bg-background/80 backdrop-blur-sm shadow-md'>
			<div className='max-w-4xl mx-auto px-2 sm:px-6 lg:px-8'>
				<ul className='flex items-center justify-between h-20'>
					<li className='w-1/4 flex justify-start'>
						<a
							href='/'
							rel='noopener noreferrer'
							className='flex items-center gap-2 text-xl text-foreground hover:text-secondary-foreground'
						>
							<img
								src='/assets/logo_.svg'
								alt='QuizBooth.games logo'
								className='h-8 w-auto'
							/>
							<span className='hidden lg:block hover:scale-[1.02] transition-all font-medium'>
								QuizBooth
							</span>
						</a>
					</li>

					<li className='w-2/4 flex justify-center'>
						<a
							href={game.customization?.customLogoLink || '/'}
							target='_blank'
							rel='noopener noreferrer'
						>
							{game.customization?.customLogoUrl ? (
								<img
									src={game.customization.customLogoUrl}
									alt='Custom game logo'
									className='max-h-16 w-auto'
								/>
							) : (
								<img
									src='/assets/naknick-logo.png'
									alt='QuizBooth.games logo'
									className='max-h-16 w-auto'
								/>
							)}
						</a>
					</li>

					<li className='w-1/4 flex justify-end'>
						{isAnswered && (
							<Button
								size='sm'
								onClick={onNextQuestion}
								className='flex items-center gap-2 !text-secondary'
							>
								{currentQuestionIndex < questionsLength - 1 ? (
									<>
										Next <ArrowRight className='h-4 w-4' />
									</>
								) : (
									'Finish'
								)}
							</Button>
						)}
					</li>
				</ul>
			</div>
		</div>
	)
}
