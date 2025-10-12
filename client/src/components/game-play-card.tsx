import { useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Lightbulb } from 'lucide-react'
import type { Question } from '@shared/firebase-types'
import { useSwipeGesture } from '@/hooks/use-swipe-gesture'
import { useIsMobile } from '@/hooks/use-mobile'

interface GamePlayCardProps {
	currentQuestion: Question | undefined
	currentQuestionIndex: number
	questions: Question[]
	selectedAnswer: number | null
	isAnswered: boolean
	showExplanation: boolean
	onAnswerSelect: (answerIndex: number) => void
	onNextQuestion: () => void
}

export function GamePlayCard({
	currentQuestion,
	currentQuestionIndex,
	questions,
	selectedAnswer,
	isAnswered,
	showExplanation,
	onAnswerSelect,
	onNextQuestion,
}: GamePlayCardProps) {
	const isMobile = useIsMobile()
	const gameCardRef = useRef<HTMLDivElement>(null)

	// Helper function to determine button styling based on answer state
	const getButtonClasses = (index: number) => {
		if (!isAnswered) {
			// Question not answered yet - interactive state
			return 'border-primary hover:border-primary bg-background border-dashed hover:scale-[1.02]'
		}

		if (selectedAnswer === index) {
			// This is the selected answer
			return index === currentQuestion?.correctAnswer
				? 'font-bold bg-primary/20 border-primary text-primary scale-[1.02]' // Correct answer selected
				: 'bg-destructive/20 border-destructive text-destructive' // Wrong answer selected
		}

		if (index === currentQuestion?.correctAnswer) {
			// This is the correct answer (but not selected by user)
			return 'font-bold bg-primary/20 border-primary text-primaryed'
		}

		// Default state - answered but not selected and not correct
		return 'bg-background/80 border-primary border-dashed'
	}

	// Helper function to determine letter badge styling
	const getLetterBadgeClasses = (index: number) => {
		if (isAnswered && selectedAnswer === index) {
			// This is the selected answer
			return index === currentQuestion?.correctAnswer
				? 'bg-primary text-primary-foreground' // Correct answer selected
				: 'bg-destructive text-destructive-foreground' // Wrong answer selected
		}

		if (isAnswered && index === currentQuestion?.correctAnswer) {
			// This is the correct answer (but not selected)
			return 'bg-primary text-primary-foreground'
		}

		// Default state - not answered or not special case
		return 'bg-primary/20 text-primary'
	}

	// Swipe gesture handler for mobile devices
	useSwipeGesture(gameCardRef, {
		onSwipeLeft: () => {
			// Only trigger swipe left if question is answered and on mobile
			if (isMobile && isAnswered) {
				console.log('Swipe left detected')
				onNextQuestion()
			}
		},
		threshold: 50, // Minimum swipe distance in pixels
		preventDefault: false, // Allow button taps to work properly
	})

	return (
		<Card
			ref={gameCardRef}
			className='game-card !my-8 bg-card animate-slide-up rounded-none md:rounded-2xl shadow-md border-0 md:border-1'
		>
			<CardContent className='p-0 pb-4 md:p-6'>
				{/* Question Text */}
				<div className=''>
					<div className='bg-gradient-to-r from-primary/20 to-card/10 rounded-none md:rounded-2xl p-4 mb-4'>
						<h2 className='text-lg md:text-2xl font-bold text-primary leading-relaxed text-center'>
							{currentQuestion?.questionText}
						</h2>
					</div>

					{/* Answer Options */}
					<div className='space-y-4 px-4 md:px-0'>
						{currentQuestion?.options.map((option, index) => (
							<button
								key={index}
								type='button'
								className={`w-full p-4 md:p-5 rounded-xl border-2 text-left transition-all duration-200 ${getButtonClasses(
									index
								)}`}
								onClick={() => onAnswerSelect(index)}
								disabled={isAnswered}
								data-testid={`button-answer-${String.fromCharCode(65 + index)}`}
							>
								<div className='flex items-center justify-between'>
									<div className='flex items-center gap-4'>
										{/* <span
											className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getLetterBadgeClasses(index)}`}
										>
											{String.fromCharCode(65 + index)}
										</span> */}
										<span className='text-base md:text-lg font-medium'>
											{option}
										</span>
									</div>
									{isAnswered &&
										selectedAnswer === index &&
										(index === currentQuestion.correctAnswer ? (
											<CheckCircle className='h-10 w-10 text-primary' />
										) : (
											<XCircle className='h-10 w-10 text-destructive' />
										))}
									{isAnswered &&
										selectedAnswer !== index &&
										index === currentQuestion.correctAnswer && (
											<CheckCircle className='h-10 w-10 text-primary' />
										)}
								</div>
							</button>
						))}
					</div>

					{/* Explanation */}
					{showExplanation && currentQuestion?.explanation && (
						<div className='mt-6 mx-4 md:mx-0 p-6 bg-background/70 rounded-2xl shadow-md animate-slide-up'>
							<div className='flex items-center gap-3 mb-4'>
								<div className='w-10 h-10 bg-primary rounded-full flex items-center justify-center'>
									<Lightbulb className='h-6 w-6 text-primary-foreground' />
								</div>
								<h3 className='font-bold text-lg text-'>Explanation</h3>
							</div>
							<p className='text-foreground leading-relaxed text-base'>
								{currentQuestion.explanation}
							</p>
						</div>
					)}
				</div>

				{/* Bottom Action - Show after answering */}
				{isAnswered && (
					<div className='text-center pt-4 '>
						<p className='text-sm text-foreground mb-3'>
							{currentQuestionIndex < questions.length - 1
								? 'Ready for the next question?'
								: 'Great job! See your final results.'}
						</p>
						<Button
							type='button'
							onClick={onNextQuestion}
							size='lg'
							className='px-8 py-4 text-xl font-semibold uppercase text-secondary'
							data-testid='button-continue'
						>
							{currentQuestionIndex < questions.length - 1
								? 'Continue →'
								: 'View Results'}
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	)
}
