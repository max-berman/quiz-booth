import { useState, useEffect } from 'react'
import { useParams, useLocation } from 'wouter'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
	CheckCircle,
	XCircle,
	Zap,
	Timer,
	Home,
	ArrowRight,
	Lightbulb,
} from 'lucide-react'
import type { Game, Question } from '@shared/schema'

export default function GamePage() {
	const { id } = useParams()
	const [, setLocation] = useLocation()
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
	const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
	const [score, setScore] = useState(0)
	const [correctAnswers, setCorrectAnswers] = useState(0)
	const [wrongAnswers, setWrongAnswers] = useState(0)
	const [streak, setStreak] = useState(0)
	const [timeLeft, setTimeLeft] = useState(30)
	const [totalTime, setTotalTime] = useState(0)
	const [gameStartTime] = useState(Date.now())
	const [isAnswered, setIsAnswered] = useState(false)
	const [showExplanation, setShowExplanation] = useState(false)

	const { data: game } = useQuery<Game>({
		queryKey: ['/api/games', id],
	})

	const { data: questions, isLoading } = useQuery<Question[]>({
		queryKey: ['/api/games', id, 'questions'],
	})

	const currentQuestion = questions?.[currentQuestionIndex]
	const progressPercentage = questions
		? ((currentQuestionIndex + 1) / questions.length) * 100
		: 0

	// Timer effect
	useEffect(() => {
		if (timeLeft > 0 && !isAnswered) {
			const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
			return () => clearTimeout(timer)
		} else if (timeLeft === 0 && !isAnswered) {
			// Time's up, auto-advance
			handleNextQuestion()
		}
	}, [timeLeft, isAnswered])

	// Reset timer for new question
	useEffect(() => {
		setTimeLeft(30)
		setSelectedAnswer(null)
		setIsAnswered(false)
		setShowExplanation(false)
	}, [currentQuestionIndex])

	const handleAnswerSelect = (answerIndex: number) => {
		if (isAnswered) return

		setSelectedAnswer(answerIndex)
		setIsAnswered(true)
		setShowExplanation(true)

		const timeSpent = 30 - timeLeft
		const isCorrect = answerIndex === currentQuestion?.correctAnswer

		if (isCorrect) {
			const basePoints = 100
			const timeBonus = Math.max(0, 30 - timeSpent) * 2 // Up to 60 bonus points for speed
			const streakBonus = streak * 10 // 10 points per streak
			const questionPoints = basePoints + timeBonus + streakBonus

			setScore((prev) => prev + questionPoints)
			setCorrectAnswers((prev) => prev + 1)
			setStreak((prev) => prev + 1)
		} else {
			setWrongAnswers((prev) => prev + 1)
			setStreak(0)
		}

		setTotalTime((prev) => prev + timeSpent)
	}

	const handleNextQuestion = () => {
		if (currentQuestionIndex < (questions?.length || 0) - 1) {
			setCurrentQuestionIndex((prev) => prev + 1)
		} else {
			// Game finished
			const finalTimeSpent = Math.floor((Date.now() - gameStartTime) / 1000)
			const gameResult = {
				score,
				correctAnswers,
				totalQuestions: questions?.length || 0,
				timeSpent: finalTimeSpent,
				streak,
			}

			setLocation(
				`/results/${id}?score=${score}&correct=${correctAnswers}&total=${questions?.length}&time=${finalTimeSpent}&streak=${streak}`
			)
		}
	}

	if (isLoading || !questions || !game) {
		return (
			<div className='flex-1 bg-background flex items-center justify-center'>
				<div className='text-center'>
					<p className='flex items-center justify-center my-4'>
						<img
							// src='/src/assets/images/owl.svg'
							src='/src/assets/images/naknick-logo.png'
							alt='QuizBooth.games logo'
							className='h-16 w-auto'
						/>
					</p>
					<div className='animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4'></div>

					<p>Loading game...</p>
				</div>
			</div>
		)
	}

	return (
		<div className='flex-1 bg-background'>
			{/* Top Navigation Bar */}
			<div className='sticky top-0 z-50 bg-background/80 backdrop-blur-sm shadow-md'>
				<div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='flex items-center justify-between h-20'>
						<Button
							variant='secondary'
							size='sm'
							onClick={() => setLocation('/')}
							className=''
						>
							<Home className='h-4 w-4' />
							Home
						</Button>

						<div className='text-center'>
							<div className='text-sm font-medium text-foreground'>
								<img
									src='/src/assets/images/naknick-logo.png'
									alt='QuizBooth.games logo'
									className='h-14 w-auto'
								/>
							</div>
						</div>

						{isAnswered && (
							<Button
								size='sm'
								onClick={handleNextQuestion}
								className='flex items-center gap-2 !text-white'
							>
								{currentQuestionIndex < questions.length - 1 ? (
									<>
										Next <ArrowRight className='h-4 w-4' />
									</>
								) : (
									'Finish'
								)}
							</Button>
						)}

						{!isAnswered && (
							<div className='w-[84px]' /> /* Placeholder to center the middle content */
						)}
					</div>
				</div>
			</div>
			<div className='max-w-4xl mx-auto px-4 lg:px-8 py-4 space-y-4 text-primary'>
				{/* Timer and Stats - Compact version */}
				<div className='flex justify-between items-center w-full'>
					<div className='text-center p-2  h-full min-w-[60px]'>
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
							{questions.length}
						</div>
						{/* <div className='text-xs text-muted-foreground'>Score: {score}</div> */}
						<Progress value={progressPercentage} className='h-4  bg-card' />
					</div>
					<div className='text-center p-2 h-full'>
						<div className='text-primary capitalize'>
							Score <strong className='text-lg'>{score}</strong>
						</div>
					</div>
				</div>

				{/* 
					<div className='grid grid-cols-4 gap-3 mb-6'>
					<div className='text-center p-3 bg-popover rounded-lg shadow-sm'>
						<CheckCircle className='h-4 w-4 mx-auto mb-1 text-primary' />
						<div className='text-lg font-bold text-primary'>
							{correctAnswers}
						</div>
						<div className='text-xs text-muted-foreground'>Correct</div>
					</div>

					<div className='text-center p-3 bg-popover rounded-lg shadow-sm'>
						<XCircle className='h-4 w-4 mx-auto mb-1 text-destructive' />
						<div className='text-lg font-bold text-destructive'>
							{wrongAnswers}
						</div>
						<div className='text-xs text-muted-foreground'>Wrong</div>
					</div>

					<div className='text-center p-3 bg-popover rounded-lg shadow-sm'>
						<Zap className='h-4 w-4 mx-auto mb-1 text-foreground' />
						<div className='text-lg font-bold text-foreground'>{streak}</div>
						<div className='text-xs text-muted-foreground'>Streak</div>
					</div> 
					</div>
					*/}

				{/* Question Card - Optimized for future customization */}
				<Card className='game-card animate-slide-up shadow-md  border-border'>
					<CardContent className='p-4 md:p-8'>
						{/* Question Text - Optimized for readability */}
						<div className='mb-2'>
							<div className='bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-6 mb-8'>
								<h2 className='text-xl md:text-2xl font-bold text-primary leading-relaxed text-center'>
									{currentQuestion?.questionText}
								</h2>
							</div>

							{/* Answer Options - Better spacing and visual hierarchy */}
							<div className='space-y-4'>
								{currentQuestion?.options.map((option, index) => {
									// Helper function to determine button styling based on answer state
									const getButtonClasses = () => {
										if (!isAnswered) {
											// Question not answered yet - interactive state
											return 'border-primary hover:border-primary bg-background border-dashed hover:scale-[1.02]'
										}

										if (selectedAnswer === index) {
											// This is the selected answer
											return index === currentQuestion.correctAnswer
												? 'font-bold bg-primary/20 border-primary text-primary' // Correct answer selected
												: 'bg-destructive/20 border-destructive text-destructive' // Wrong answer selected
										}

										if (index === currentQuestion.correctAnswer) {
											// This is the correct answer (but not selected by user)
											return 'font-bold bg-primary/20 border-primary text-primaryed'
										}

										// Default state - answered but not selected and not correct
										return 'bg-background/80 border-primary border-dashed'
									}

									// Helper function to determine letter badge styling
									const getLetterBadgeClasses = () => {
										if (isAnswered && selectedAnswer === index) {
											// This is the selected answer
											return index === currentQuestion.correctAnswer
												? 'bg-primary text-primary-foreground' // Correct answer selected
												: 'bg-destructive text-destructive-foreground' // Wrong answer selected
										}

										if (isAnswered && index === currentQuestion.correctAnswer) {
											// This is the correct answer (but not selected)
											return 'bg-primary text-primary-foreground'
										}

										// Default state - not answered or not special case
										return 'bg-primary/20 text-primary'
									}

									return (
										<button
											key={index}
											type='button'
											className={`w-full p-4 md:p-5 rounded-xl border-2 text-left transition-all duration-200 ${getButtonClasses()}`}
											onClick={() => handleAnswerSelect(index)}
											disabled={isAnswered}
											data-testid={`button-answer-${String.fromCharCode(
												65 + index
											)}`}
										>
											<div className='flex items-center justify-between'>
												<div className='flex items-center gap-4'>
													<span
														className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getLetterBadgeClasses()}`}
													>
														{String.fromCharCode(65 + index)}
													</span>
													<span className='text-base md:text-lg font-medium'>
														{option}
													</span>
												</div>
												{isAnswered &&
													selectedAnswer === index &&
													(index === currentQuestion.correctAnswer ? (
														<CheckCircle className='h-8 w-8 text-primary' />
													) : (
														<XCircle className='h-8 w-8 text-destructive' />
													))}
												{isAnswered &&
													selectedAnswer !== index &&
													index === currentQuestion.correctAnswer && (
														<CheckCircle className='h-8 w-8 text-primary' />
													)}
											</div>
										</button>
									)
								})}
							</div>

							{/* Explanation - Enhanced styling */}
							{showExplanation && currentQuestion?.explanation && (
								<div className='mt-6 p-6 bg-background/70 rounded-sm shadow-md animate-slide-up'>
									<div className='flex items-center gap-3 mb-4'>
										<div className='w-10 h-10 bg-primary rounded-full flex items-center justify-center'>
											{/* <span className='text-white text-lg'>💡</span> */}
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
									onClick={handleNextQuestion}
									size='lg'
									className='px-8 py-4 text-xl font-semibold uppercase'
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
			</div>
		</div>
	)
}
// TODO: Add this to FAQ section
/* 
__How Your Score is Calculated__

Your final score is based on three factors:

1. __Correct Answers__: You earn 100 points for each question you answer correctly.

2. __Speed Bonus__: Answer quickly to earn bonus points! You get 2 points for every second you save out of the 30-second time limit. Here are some examples:

   - Answer in 10 seconds: (30-10)*2 = 40 bonus points
   - Answer in 20 seconds: (30-20)*2 = 20 bonus points
   - Answer in 25 seconds: (30-25)*2 = 10 bonus points
   - Answer instantly (0 seconds): 60 bonus points (maximum)
   - Answer at 30 seconds: 0 bonus points

3. __Streak Bonus__: Maintain consecutive correct answers to build your streak. Each correct answer in a row earns you 10 bonus points per streak level.

__Example__: If you answer 3 questions correctly in a row and answer each in 10 seconds, you could earn 170 points per question (100 + 40 + 30)!

The faster you answer and the longer your streak, the higher your score will be. Good luck!


*/
