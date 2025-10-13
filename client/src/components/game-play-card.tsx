import { useRef, useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
	CheckCircle,
	XCircle,
	Lightbulb,
	ArrowBigRight,
	ArrowBigLeft,
	Hand,
} from 'lucide-react'
import type { Question } from '@shared/firebase-types'
import { useSwipeGesture } from '@/hooks/use-swipe-gesture'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { getResizeHandleElementIndex } from 'react-resizable-panels'

// Tutorial management utilities
const TUTORIAL_KEY = 'quizbooth_swipe_tutorial_seen'

/**
 * Check if the user has seen the swipe tutorial
 */
function hasSeenTutorial(): boolean {
	try {
		return localStorage.getItem(TUTORIAL_KEY) === 'true'
	} catch (error) {
		console.warn('Failed to check tutorial status:', error)
		return false
	}
}

/**
 * Mark the tutorial as seen by the user
 */
function markTutorialSeen(): void {
	try {
		localStorage.setItem(TUTORIAL_KEY, 'true')
	} catch (error) {
		console.warn('Failed to mark tutorial as seen:', error)
	}
}

interface GamePlayCardProps {
	currentQuestion: Question | undefined
	currentQuestionIndex: number
	questions: Question[]
	questionsLength: number
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
	questionsLength,
}: GamePlayCardProps) {
	const isMobile = useIsMobile()
	const gameCardRef = useRef<HTMLDivElement>(null)
	const [isNewQuestion, setIsNewQuestion] = useState(false)
	const [hasSeenTutorialState, setHasSeenTutorialState] = useState(false)

	// Check tutorial status on component mount
	useEffect(() => {
		const seen = hasSeenTutorial()
		setHasSeenTutorialState(seen)
		if (process.env.NODE_ENV === 'development') {
			console.log('Tutorial localStorage check:', {
				seen,
				localStorageValue: localStorage.getItem(TUTORIAL_KEY),
				TUTORIAL_KEY,
			})
		}
	}, [])

	// Determine if we should show the tutorial
	const shouldShowTutorial =
		isAnswered && isMobile && currentQuestionIndex < 2 && !hasSeenTutorialState

	// Debug logging
	useEffect(() => {
		if (process.env.NODE_ENV === 'development') {
			console.log('Tutorial debug:', {
				isAnswered,
				isMobile,
				currentQuestionIndex,
				hasSeenTutorialState,
				shouldShowTutorial,
			})
		}
	}, [
		isAnswered,
		isMobile,
		currentQuestionIndex,
		hasSeenTutorialState,
		shouldShowTutorial,
	])

	// Mark tutorial as seen after user completes second question
	useEffect(() => {
		if (currentQuestionIndex >= 2 && !hasSeenTutorialState) {
			// User completed first 2 questions, mark tutorial as seen
			if (process.env.NODE_ENV === 'development') {
				console.log(
					'User completed first 2 questions, marking tutorial as seen'
				)
			}
			markTutorialSeen()
			setHasSeenTutorialState(true)
		}
	}, [currentQuestionIndex, hasSeenTutorialState])

	// Track when a new question appears to trigger animation
	useEffect(() => {
		// Only trigger animation if we have a valid question and it's not the first question
		if (currentQuestion && currentQuestionIndex > 0) {
			setIsNewQuestion(true)
			const timer = setTimeout(() => setIsNewQuestion(false), 500)
			return () => clearTimeout(timer)
		}
	}, [currentQuestionIndex, currentQuestion])

	// Combine animation classes
	const animationClasses = cn('', isNewQuestion && 'animate-slide-in-right')

	// Helper function to determine button styling based on answer state
	const getButtonClasses = (index: number) => {
		if (!isAnswered) {
			// Question not answered yet - interactive state
			return `border-primary hover:border-primary bg-background hover:scale-[1.02] `
		}

		if (selectedAnswer === index) {
			// This is the selected answer
			return index === currentQuestion?.correctAnswer
				? 'font-bold bg-primary/20 border-primary text-primary scale-[1.01]' // Correct answer selected
				: 'bg-destructive/20 border-destructive text-destructive' // Wrong answer selected
		}

		if (index === currentQuestion?.correctAnswer) {
			// This is the correct answer (but not selected by user)
			return 'font-bold bg-primary/20 border-primary text-primary'
		}

		// Default state - answered but not selected and not correct
		return 'bg-background/80 border-primary '
	}

	const getAngle = () => {
		if (isMobile && !isAnswered) {
			// Apply random angle between -2 and 2 degrees
			const angle = Math.floor(Math.random() * 5) - 2 // Generates -2, -1, 0, 1, 2

			// Map angle values to Tailwind rotation classes
			const rotationClasses = {
				'-2': '-rotate-2',
				'-1': '-rotate-1',
				'0': '',
				'1': 'rotate-1',
				'2': 'rotate-2',
			}

			return rotationClasses[angle.toString() as keyof typeof rotationClasses]
		}
		return ''
	}

	// Swipe gesture handler for mobile devices
	useSwipeGesture(gameCardRef, {
		onSwipeLeft: () => {
			// Only trigger swipe left if question is answered and on mobile
			if (isMobile && isAnswered) {
				if (process.env.NODE_ENV === 'development') {
					// console.log('Swipe left detected')
				}
				onNextQuestion()
			}
		},
		threshold: 50, // Minimum swipe distance in pixels
		preventDefault: false, // Allow button taps to work properly
	})

	return (
		<Card
			ref={gameCardRef}
			className={`${animationClasses} game-card overflow-hidden mx-2 my-2 bg-card rounded-2xl shadow-md border-1 `}
		>
			<CardContent className='p-0 pb-4 md:p-6'>
				{/* Question Text */}
				<div className=''>
					<div className='bg-gradient-to-r from-primary/20 to-card/10 rounded-none md:rounded-2xl p-4 mb-4 '>
						<h2 className='text-lg md:text-2xl font-medium lg:font-bold text-primary leading-6 lg:leading-relaxed '>
							{currentQuestion?.questionText}
						</h2>
					</div>

					{/* Answer Options */}
					<div className='space-y-4 px-2 lg:px-4 md:px-0'>
						{shouldShowTutorial && (
							<div className='mt-2 justify-end text-primary items-center flex animate-slide-up'>
								<div className='flex-col flex mr-4 items-center '>
									<Hand className='h-6 w-6 animate-swipe ' />
									<span className='text-xs '>Swipe to the next question</span>
								</div>
							</div>
						)}

						{currentQuestion?.options.map((option, index) => (
							<button
								key={index}
								type='button'
								className={`w-full p-3 lg:p-4 md:p-5 rounded-xl border-2 text-left transition-all duration-300 ${getButtonClasses(
									index
								)} `}
								onClick={() => onAnswerSelect(index)}
								disabled={isAnswered}
								data-testid={`button-answer-${String.fromCharCode(65 + index)}`}
							>
								<div className='flex items-center justify-between'>
									<div className='flex items-center mr-4 w-auto'>
										<span
											className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2  flex items-center justify-center font-bold text-sm ${
												isAnswered &&
												selectedAnswer === index &&
												currentQuestion &&
												index !== currentQuestion.correctAnswer
													? 'border-destructive'
													: 'border-primary'
											}`}
										>
											{String.fromCharCode(65 + index)}
										</span>
									</div>
									<div
										className={`flex ${isAnswered ? 'w-4/5' : 'w-full'} gap-4 `}
									>
										<span className='text-base md:text-xl font-medium'>
											{option}
										</span>
									</div>

									{isAnswered && (
										<div className='w-1/5  flex justify-end'>
											{selectedAnswer === index &&
												currentQuestion &&
												(index === currentQuestion.correctAnswer ? (
													<CheckCircle className='h-8 w-8 lg:h-10 lg:w-10 text-primary' />
												) : (
													<XCircle className='h-8 w-8 lg:h-10 lg:w-10 text-destructive' />
												))}
											{selectedAnswer !== index &&
												currentQuestion &&
												index === currentQuestion.correctAnswer && (
													<CheckCircle className='h-8 w-8 lg:h-10 lg:w-10 text-primary' />
												)}
										</div>
									)}
								</div>
							</button>
						))}
					</div>

					{/* Explanation */}
					{showExplanation && currentQuestion?.explanation && (
						<div className='mt-6 mx-2 md:mx-0 lg:p-6 p-4 bg-background/70 rounded-2xl shadow-md animate-slide-up'>
							<div className='flex items-center gap-3 mb-2 lg:mb-4'>
								<div className='h-8 w-8 lg:w-10 lg:h-10 bg-primary rounded-full flex items-center justify-center'>
									<Lightbulb className='h-6 w-6 lg:h-8 lg:w-8 text-primary-foreground animate-pulse' />
								</div>
								<h3 className='font-medium text-base lg:text-lg '>
									Explanation
								</h3>
							</div>
							<p className='text-foreground leading-relaxed text-sm lg:text-xl'>
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
