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
	RotateCcw,
} from 'lucide-react'
import type { Game, Question } from '@shared/firebase-types'
import { useFirebaseFunctions } from '@/hooks/use-firebase-functions'
import { useGameSession } from '@/hooks/use-game-session'
import { analytics } from '@/lib/analytics'

export default function GamePage() {
	const { id } = useParams()
	const [, setLocation] = useLocation()

	// Initialize Firebase Functions
	const { getGame, getQuestions } = useFirebaseFunctions()

	// Use game session management
	const {
		sessionState,
		isSessionLoaded,
		hasExistingSession,
		updateSessionState,
		completeSession,
	} = useGameSession(id)

	// Timer configuration - will be moved to database later
	const QUESTION_TIMER_DURATION = 30 // seconds - can be 30 or 60 in the future

	// Extract state from session
	const currentQuestionIndex = sessionState?.currentQuestionIndex || 0
	const selectedAnswer =
		sessionState?.selectedAnswers[currentQuestionIndex] ?? null
	const score = sessionState?.score || 0
	const correctAnswers = sessionState?.correctAnswers || 0
	const wrongAnswers = sessionState?.wrongAnswers || 0
	const streak = sessionState?.streak || 0
	const totalTime = sessionState?.totalTime || 0
	const gameStartTime = sessionState?.startTime || Date.now()
	const isAnswered = selectedAnswer !== null

	const [timeLeft, setTimeLeft] = useState(QUESTION_TIMER_DURATION)
	const [showExplanation, setShowExplanation] = useState(false)

	const {
		data: game,
		isLoading: gameLoading,
		error: gameError,
	} = useQuery<Game>({
		queryKey: [`game-${id}`],
		queryFn: async () => {
			const result = await getGame({ gameId: id })
			return result.data as Game
		},
		enabled: !!id,
	})

	const {
		data: questions,
		isLoading: questionsLoading,
		error: questionsError,
	} = useQuery<Question[]>({
		queryKey: [`questions-${id}`],
		queryFn: async () => {
			const result = await getQuestions({ gameId: id })
			return result.data as Question[]
		},
		enabled: !!id,
	})

	const isLoading = gameLoading || questionsLoading

	const currentQuestion = questions?.[currentQuestionIndex]
	const progressPercentage = questions
		? ((currentQuestionIndex + 1) / questions.length) * 100
		: 0

	// Apply customization styles
	useEffect(() => {
		if (game?.customization) {
			const { primaryColor, secondaryColor, tertiaryColor } = game.customization

			// Convert hex colors to HSL and update CSS variables
			const root = document.documentElement

			if (primaryColor) {
				const hsl = hexToHSL(primaryColor)
				root.style.setProperty('--primary-h', hsl.h.toString())
				root.style.setProperty('--primary-s', `${hsl.s}%`)
				root.style.setProperty('--primary-l', `${hsl.l}%`)
			}

			if (secondaryColor) {
				const hsl = hexToHSL(secondaryColor)
				root.style.setProperty('--secondary-h', hsl.h.toString())
				root.style.setProperty('--secondary-s', `${hsl.s}%`)
				root.style.setProperty('--secondary-l', `${hsl.l}%`)
			}

			if (tertiaryColor) {
				const hsl = hexToHSL(tertiaryColor)
				root.style.setProperty('--background-h', hsl.h.toString())
				root.style.setProperty('--background-s', `${hsl.s}%`)
				root.style.setProperty('--background-l', `${hsl.l}%`)
			}
		}

		// Cleanup function to reset styles
		return () => {
			const root = document.documentElement
			root.style.removeProperty('--primary-h')
			root.style.removeProperty('--primary-s')
			root.style.removeProperty('--primary-l')
			root.style.removeProperty('--secondary-h')
			root.style.removeProperty('--secondary-s')
			root.style.removeProperty('--secondary-l')
			root.style.removeProperty('--background-h')
			root.style.removeProperty('--background-s')
			root.style.removeProperty('--background-l')
		}
	}, [game?.customization])

	// Helper function to convert hex to HSL
	function hexToHSL(hex: string) {
		// Remove the hash if it exists
		hex = hex.replace(/^#/, '')

		// Parse the hex values
		let r, g, b
		if (hex.length === 3) {
			r = parseInt(hex[0] + hex[0], 16)
			g = parseInt(hex[1] + hex[1], 16)
			b = parseInt(hex[2] + hex[2], 16)
		} else if (hex.length === 6) {
			r = parseInt(hex.slice(0, 2), 16)
			g = parseInt(hex.slice(2, 4), 16)
			b = parseInt(hex.slice(4, 6), 16)
		} else {
			throw new Error('Invalid hex color')
		}

		// Convert to 0-1 range
		r /= 255
		g /= 255
		b /= 255

		const max = Math.max(r, g, b)
		const min = Math.min(r, g, b)
		let h = 0,
			s = 0,
			l = (max + min) / 2

		if (max !== min) {
			const d = max - min
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

			switch (max) {
				case r:
					h = (g - b) / d + (g < b ? 6 : 0)
					break
				case g:
					h = (b - r) / d + 2
					break
				case b:
					h = (r - g) / d + 4
					break
			}

			h /= 6
		}

		return {
			h: Math.round(h * 360),
			s: Math.round(s * 100),
			l: Math.round(l * 100),
		}
	}

	// Track game start when game data is loaded
	useEffect(() => {
		if (game && questions && !hasExistingSession) {
			analytics.trackGameStart({
				gameId: id!,
				difficulty: game.difficulty,
				categories: game.categories,
				questionCount: questions.length,
			})
		}
	}, [game, questions, hasExistingSession, id])

	// Timer initialization - handles both resume and new questions
	useEffect(() => {
		if (isSessionLoaded) {
			if (sessionState?.currentQuestionTimeLeft !== undefined) {
				// Resume from saved state
				let resumedTime = sessionState.currentQuestionTimeLeft

				// Add safety buffer if time is below 10 seconds
				if (resumedTime < 5) {
					resumedTime = Math.min(resumedTime + 5, QUESTION_TIMER_DURATION)
				}

				setTimeLeft(resumedTime)
			} else {
				// Start new question with full timer
				setTimeLeft(QUESTION_TIMER_DURATION)
			}
		}
	}, [
		isSessionLoaded,
		sessionState?.currentQuestionTimeLeft,
		QUESTION_TIMER_DURATION,
	])

	// Timer effect
	useEffect(() => {
		// Don't run timer if there are errors (game is private)
		if (gameError || questionsError) {
			return
		}

		if (timeLeft > 0 && !isAnswered) {
			const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
			return () => clearTimeout(timer)
		} else if (timeLeft === 0 && !isAnswered) {
			// Time's up, auto-advance
			handleNextQuestion()
		}
	}, [timeLeft, isAnswered, gameError, questionsError])

	// Save current timer state when page is about to unload
	useEffect(() => {
		const handleBeforeUnload = () => {
			if (!isAnswered && timeLeft > 0) {
				updateSessionState({
					currentQuestionTimeLeft: timeLeft,
				})
			}
		}

		window.addEventListener('beforeunload', handleBeforeUnload)
		return () => window.removeEventListener('beforeunload', handleBeforeUnload)
	}, [timeLeft, isAnswered, updateSessionState])

	// Reset explanation when moving to new question
	useEffect(() => {
		setShowExplanation(false)
	}, [currentQuestionIndex])

	const handleAnswerSelect = (answerIndex: number) => {
		if (isAnswered) return

		setShowExplanation(true)

		const timeSpent = QUESTION_TIMER_DURATION - timeLeft
		const isCorrect = answerIndex === currentQuestion?.correctAnswer

		// Calculate score updates
		let newScore = score
		let newCorrectAnswers = correctAnswers
		let newWrongAnswers = wrongAnswers
		let newStreak = streak
		let newTotalTime = totalTime + timeSpent

		if (isCorrect) {
			const basePoints = 100
			const timeBonus = Math.max(0, QUESTION_TIMER_DURATION - timeSpent) * 2 // Up to 60 bonus points for speed
			const streakBonus = streak * 10 // 10 points per streak
			const questionPoints = basePoints + timeBonus + streakBonus

			newScore = score + questionPoints
			newCorrectAnswers = correctAnswers + 1
			newStreak = streak + 1
		} else {
			newWrongAnswers = wrongAnswers + 1
			newStreak = 0
		}

		// Track question answered event
		analytics.trackQuestionAnswered({
			gameId: id!,
			questionIndex: currentQuestionIndex,
			isCorrect,
			timeSpent,
			currentStreak: newStreak,
			totalScore: newScore,
		})

		// Update session state
		updateSessionState({
			selectedAnswers: {
				...sessionState?.selectedAnswers,
				[currentQuestionIndex]: answerIndex,
			},
			answeredQuestions: [
				...(sessionState?.answeredQuestions || []),
				currentQuestionIndex,
			],
			score: newScore,
			correctAnswers: newCorrectAnswers,
			wrongAnswers: newWrongAnswers,
			streak: newStreak,
			totalTime: newTotalTime,
		})
	}

	const handleNextQuestion = () => {
		if (currentQuestionIndex < (questions?.length || 0) - 1) {
			// Move to next question - clear the saved timer state and reset timer
			updateSessionState({
				currentQuestionIndex: currentQuestionIndex + 1,
				currentQuestionTimeLeft: undefined, // Clear saved timer for next question
			})
			// Reset timer to full duration for the next question
			setTimeLeft(QUESTION_TIMER_DURATION)
		} else {
			// Game finished
			const finalTimeSpent = Math.floor((Date.now() - gameStartTime) / 1000)

			// Track game completion event
			analytics.trackGameCompleted({
				gameId: id!,
				finalScore: score,
				correctAnswers: correctAnswers,
				totalQuestions: questions?.length || 0,
				totalTime: finalTimeSpent,
				maxStreak: streak,
			})

			// Complete the session and navigate to results
			completeSession()
			setLocation(
				`/results/${id}?score=${score}&correct=${correctAnswers}&total=${questions?.length}&time=${finalTimeSpent}&streak=${streak}`
			)
		}
	}

	// Check for permission denied errors (game is private)
	if (gameError || questionsError) {
		const error = gameError || questionsError
		const isPermissionDenied =
			(error as any)?.code === 'permission-denied' ||
			(error as any)?.message?.includes('Access denied') ||
			(error as any)?.message?.includes('permission-denied')

		if (isPermissionDenied) {
			return (
				<div className='bg-background flex items-center justify-center'>
					<div className='text-center max-w-md mx-auto p-6'>
						<p className='flex items-center justify-center my-4'>
							<a
								href='https://www.naknick.com'
								target='_blank'
								rel='noopener noreferrer'
							>
								<img
									src='/assets/logo.png'
									alt='NaknNick games logo'
									className='h-32 w-auto'
								/>
							</a>
						</p>
						<div className='bg-destructive/10 border border-destructive/20 rounded-lg p-6 mb-6'>
							<XCircle className='h-16 w-16 text-destructive mx-auto mb-4' />
							<h2 className='text-xl font-bold text-destructive mb-2'>
								Game Not Available
							</h2>
							<p className='text-foreground mb-4'>
								This game is currently set to private and cannot be accessed by
								the public.
							</p>
						</div>
						<Button onClick={() => setLocation('/')} className='mt-4'>
							Return to Home
						</Button>
					</div>
				</div>
			)
		}
	}

	if (isLoading || !questions || !game) {
		return (
			<div className='flex-1 bg-background flex items-center justify-center'>
				<div className='text-center'>
					<p className='flex items-center justify-center my-4'>
						<a
							href='https://www.naknick.com'
							target='_blank'
							rel='noopener noreferrer'
						>
							<img
								src='/assets/logo.png'
								alt='NaknNick games logo'
								className='h-32 w-auto '
							/>
						</a>
					</p>
					<div className='animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4'></div>

					<p className='animate-bounce'>Loading game...</p>
				</div>
			</div>
		)
	}

	return (
		<div className='flex-1 bg-background'>
			{/* Top Navigation Bar */}
			<div className='sticky top-0 z-50 bg-background/80 backdrop-blur-sm shadow-md'>
				<div className='max-w-4xl mx-auto px-2 sm:px-6 lg:px-8'>
					<ul className='flex items-center justify-between h-20'>
						<li className='w-1/4 flex justify-start'>
							<a
								href='/'
								target='_blank'
								rel='noopener noreferrer'
								className='flex items-center gap-2 text-xl text-foreground hover:text-secondary-foreground'
							>
								{game.customization?.customLogoUrl ? (
									<img
										src={game.customization.customLogoUrl}
										alt='Custom game logo'
										className='h-8 w-auto'
									/>
								) : (
									<>
										<img
											src='/assets/logo_.svg'
											alt='QuizBooth.games logo'
											className='h-8 w-auto'
										/>
										<span className='hidden lg:block hover:scale-[1.02] transition-all font-medium'>
											QuizBooth
										</span>
									</>
								)}
							</a>
						</li>

						<li className='w-2/4 flex justify-center'>
							<a href='/' target='_blank' rel='noopener noreferrer'>
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
						</li>
					</ul>
				</div>
			</div>
			<div className='max-w-4xl mx-auto px-0 lg:px-6 py-4 space-y-4 text-primary'>
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
						<Progress value={progressPercentage} className='h-4  bg-card' />
					</div>
					<div className='text-center p-2 h-full'>
						<div className='text-primary capitalize'>
							Score <strong className='text-lg'>{score}</strong>
						</div>
					</div>
				</div>

				{/* Question Card */}
				<Card className='game-card !my-8 animate-slide-up rounded-none md:rounded-2xl shadow-md border-0 md:border-1'>
					<CardContent className='p-0 pb-4 md:p-6'>
						{/* Question Text */}
						<div className=''>
							<div className='bg-gradient-to-r from-primary/10 to-secondary/10 rounded-none md:rounded-2xl p-4 mb-4'>
								<h2 className='text-lg md:text-2xl font-bold text-primary leading-relaxed text-center'>
									{currentQuestion?.questionText}
								</h2>
							</div>

							{/* Answer Options */}
							<div className='space-y-4 px-4 md:px-0'>
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
				<div className='flex items-center justify-center mb-2'>
					<a
						href='https://www.naknick.com'
						target='_blank'
						rel='noopener noreferrer'
					>
						<img
							src='/assets/logo.png'
							alt='NaknNick games logo'
							className='h-32 w-auto'
						/>
					</a>
				</div>
			</div>
		</div>
	)
}
