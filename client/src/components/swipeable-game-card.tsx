import React, { useRef, useEffect, useState } from 'react'
import TinderCard from 'react-tinder-card'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Lightbulb, ArrowRight } from 'lucide-react'
import type { Question } from '@shared/firebase-types'

interface SwipeableGameCardProps {
	currentQuestion: Question
	questions: Question[]
	currentQuestionIndex: number
	isAnswered: boolean
	selectedAnswer: number | null
	showExplanation: boolean
	gameCardRef: React.RefObject<HTMLDivElement>
	onAnswerSelect: (answerIndex: number) => void
	onNextQuestion: () => void
	shouldSwipe: boolean
}

export function SwipeableGameCard({
	currentQuestion,
	questions,
	currentQuestionIndex,
	isAnswered,
	selectedAnswer,
	showExplanation,
	gameCardRef,
	onAnswerSelect,
	onNextQuestion,
	shouldSwipe,
}: SwipeableGameCardProps) {
	const tinderCardRef = useRef<any>(null)
	const [isSwiping, setIsSwiping] = useState(false)

	// Programmatically swipe the card when shouldSwipe becomes true
	useEffect(() => {
		if (shouldSwipe && tinderCardRef.current && !isSwiping) {
			console.log('Programmatically swiping card left')
			setIsSwiping(true)

			// Use a faster swipe with higher velocity
			tinderCardRef.current.swipe('left').catch(() => {
				// If swipe fails, still trigger next question
				console.log('Swipe failed, triggering next question directly')
				onNextQuestion()
				setIsSwiping(false)
			})

			// After swipe animation completes, trigger next question
			const timer = setTimeout(() => {
				console.log('Swipe animation complete, triggering next question')
				onNextQuestion()
				setIsSwiping(false)
			}, 300) // Faster animation - reduced from 500ms to 300ms

			return () => clearTimeout(timer)
		}
	}, [shouldSwipe, isSwiping, onNextQuestion])

	const handleCardLeftScreen = (myIdentifier: string) => {
		console.log(`${myIdentifier} left the screen`)
		// We don't trigger navigation here anymore since we handle it in the useEffect
	}

	// Helper function to determine button styling based on answer state
	const getButtonClasses = (index: number) => {
		if (!isAnswered) {
			// Question not answered yet - interactive state
			return 'border-primary hover:border-primary bg-background border-dashed hover:scale-[1.02]'
		}

		if (selectedAnswer === index) {
			// This is the selected answer
			return index === currentQuestion.correctAnswer
				? 'font-bold bg-primary/20 border-primary text-primary scale-[1.02]' // Correct answer selected
				: 'bg-destructive/20 border-destructive text-destructive' // Wrong answer selected
		}

		if (index === currentQuestion.correctAnswer) {
			// This is the correct answer (but not selected by user)
			return 'font-bold bg-primary/20 border-primary text-primaryed'
		}

		// Default state - answered but not selected and not correct
		return 'bg-background/80 border-primary border-dashed'
	}

	return (
		<TinderCard
			ref={tinderCardRef}
			className='swipe'
			preventSwipe={['up', 'down', 'left', 'right']} // Completely disable user swiping
			onCardLeftScreen={() => handleCardLeftScreen('gameCard')}
			swipeRequirementType='position'
			swipeThreshold={1000} // Very high threshold to prevent accidental swipes
			flickOnSwipe={false} // Disable flick swiping
		>
			<Card
				ref={gameCardRef}
				className='game-card !my-8 bg-card animate-slide-up rounded-none md:rounded-2xl shadow-md border-0 md:border-1 cursor-default' // Changed from cursor-grab to cursor-default
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
									data-testid={`button-answer-${String.fromCharCode(
										65 + index
									)}`}
								>
									<div className='flex items-center justify-between'>
										<div className='flex items-center gap-4'>
											<span className='text-base md:text-lg font-medium'>
												{option}
											</span>
										</div>
										{isAnswered &&
											selectedAnswer === index &&
											(index === currentQuestion.correctAnswer ? (
												<CheckCircle className='h-9 w-10 text-primary' />
											) : (
												<XCircle className='h-10 w-10 text-destructive' />
											))}
										{isAnswered &&
											selectedAnswer !== index &&
											index === currentQuestion.correctAnswer && (
												<CheckCircle className='h-8 w-8 text-primary' />
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
						<div className='text-center pt-4'>
							<p className='text-sm text-foreground mb-3'>
								{currentQuestionIndex < questions.length - 1
									? 'Ready for the next question? Swipe left or click Continue'
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
		</TinderCard>
	)
}
