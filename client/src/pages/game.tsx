import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useLocation } from 'wouter'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { GamePlayCard } from '@/components/game-play-card'
import { GameBrandingBar } from '@/components/game-branding-bar'
import { GameStatsBar } from '@/components/game-stats-bar'
import { XCircle } from 'lucide-react'
import type { Game, Question } from '@shared/firebase-types'
import { useFirebaseFunctions } from '@/hooks/use-firebase-functions'
import { useGameSession } from '@/hooks/use-game-session'
import { useSwipeGesture } from '@/hooks/use-swipe-gesture'
import { useIsMobile } from '@/hooks/use-mobile'
import { useGameLogo } from '@/hooks/use-game-logo'
import { analytics } from '@/lib/analytics'
import {
	applyGameCustomization,
	cleanupGameCustomization,
} from '@/lib/color-utils'
import {
	hasFirstCompletion,
	getLockedResults,
} from '@/lib/first-completion-utils'
import { loadGameResults } from '@/lib/session-utils'

// Audio elements for reliable sound playback
let scoreAudio: HTMLAudioElement | null = null
let isAudioInitialized = false

// Audio configuration - easily adjustable volume levels
const audioConfig = {
	volume: {
		score: 0.5, // 50% volume for correct answers
	},
	// Audio paths for public directory (production-ready)
	paths: {
		score: {
			mp3: '/assets/audio/ping.mp3',
			m4a: '/assets/audio/ping.m4a',
			ogg: '/assets/audio/ping.ogg',
			wav: '/assets/audio/ping.wav',
		},
	},
}

// Initialize audio system using HTML5 Audio (more reliable)
const initializeAudio = async (): Promise<boolean> => {
	try {
		if (isAudioInitialized) return true

		// Try different audio formats in order of preference for score sound
		const scoreFormats = [
			{ type: 'mp3', path: audioConfig.paths.score.mp3 },
			{ type: 'm4a', path: audioConfig.paths.score.m4a },
			{ type: 'ogg', path: audioConfig.paths.score.ogg },
			{ type: 'ogg', path: audioConfig.paths.score.wav },
		]

		// Load score sound
		for (const { type, path } of scoreFormats) {
			try {
				scoreAudio = new Audio(path)

				// Test if audio can be loaded
				await new Promise((resolve, reject) => {
					if (!scoreAudio) return reject(new Error('Audio element not created'))

					scoreAudio.addEventListener('canplaythrough', resolve)
					scoreAudio.addEventListener('error', reject)
					scoreAudio.load()
				})

				if (process.env.NODE_ENV === 'development') {
					// console.log(`Score audio loaded successfully: ${type}`)
				}
				break
			} catch (formatError) {
				console.log(`Failed to load score audio format ${type}:`, formatError)
				continue
			}
		}

		if (!scoreAudio) {
			throw new Error('All audio formats failed to load')
		}

		isAudioInitialized = true
		return true
	} catch (error) {
		console.warn('Failed to initialize audio system:', error)
		return false
	}
}

// Play score sound
const playScoreSound = () => {
	if (!scoreAudio || !isAudioInitialized) {
		console.warn('Audio not initialized, cannot play sound')
		return
	}

	try {
		// Clone the audio element to allow overlapping plays
		const audioClone = scoreAudio.cloneNode() as HTMLAudioElement
		audioClone.volume = audioConfig.volume.score // Use config volume
		audioClone.play().catch((error) => {
			console.warn('Failed to play audio:', error)
		})
		if (process.env.NODE_ENV === 'development') {
			console.log('Score sound played')
		}
	} catch (error) {
		console.warn('Failed to play score sound:', error)
	}
}

/**
 * GamePage component handles the main gameplay experience including questions,
 * timer, scoring, and session management.
 *
 * @returns The game page component
 */
export default function GamePage() {
	const { id } = useParams()
	const [, setLocation] = useLocation()

	// Validate game ID
	if (!id) {
		return (
			<div className='flex-1 bg-background flex items-center justify-center'>
				<div className='text-center max-w-md mx-auto p-6'>
					<p className='flex items-center justify-center my-4'>
						<a href='https://www.naknick.com' rel='noopener noreferrer'>
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
							Invalid Game
						</h2>
						<p className='text-foreground mb-4'>
							Game ID is missing. Please check the URL and try again.
						</p>
					</div>
					<Button onClick={() => setLocation('/')} className='mt-4'>
						Home
					</Button>
				</div>
			</div>
		)
	}

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

	// Mobile detection and swipe gesture setup
	const isMobile = useIsMobile()
	const gameCardRef = useRef<HTMLDivElement>(null)

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
	const [isAudioReady, setIsAudioReady] = useState(false)

	const {
		data: game,
		isLoading: gameLoading,
		error: gameError,
	} = useQuery<Game>({
		queryKey: [`game-${id}`],
		queryFn: async () => {
			const result = await getGame({ gameId: id })
			if (!result.data) {
				throw new Error('Game not found')
			}
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
			if (!result.data) {
				throw new Error('Questions not found')
			}
			return result.data as Question[]
		},
		enabled: !!id,
	})

	const isLoading = gameLoading || questionsLoading

	const currentQuestion = questions?.[currentQuestionIndex]
	const progressPercentage = questions
		? ((currentQuestionIndex + 1) / questions.length) * 100
		: 0

	// Use custom hook for logo caching and retrieval
	const { logoUrl, logoAlt } = useGameLogo(
		id,
		game?.customization?.customLogoUrl
	)

	// Apply customization styles
	useEffect(() => {
		if (game?.customization) {
			applyGameCustomization(game.customization)
		}

		// Cleanup function to reset styles
		return () => {
			cleanupGameCustomization()
		}
	}, [game?.customization])

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
	}, [isSessionLoaded, sessionState?.currentQuestionTimeLeft])

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

	// Initialize audio on component mount
	useEffect(() => {
		const initAudio = async () => {
			const success = await initializeAudio()
			setIsAudioReady(success)
			if (success) {
				if (process.env.NODE_ENV === 'development') {
					console.log('Audio ready for score changes')
				}
			} else {
				console.warn('Audio initialization failed')
			}
		}
		initAudio()
	}, [])

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

			// Play score sound for correct answers
			if (isAudioReady) {
				playScoreSound()
			} else {
				console.log('Audio not ready yet, skipping sound')
			}
		} else {
			newWrongAnswers = wrongAnswers + 1
			newStreak = 0

			// Play error sound here for wrong answers

			// Vibration feedback for wrong answers
			if ('vibrate' in navigator) {
				// Check if vibration API is supported
				try {
					navigator.vibrate(200) // 200ms vibration for wrong answers
				} catch (error) {
					console.warn('Vibration API not supported or failed:', error)
				}
			}
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

	const handleNextQuestion = useCallback(() => {
		const questionsLength = questions?.length || 0

		if (currentQuestionIndex < questionsLength - 1) {
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
				totalQuestions: questionsLength,
				totalTime: finalTimeSpent,
				maxStreak: streak,
			})

			// Create final results object
			const finalResults = {
				score,
				correctAnswers,
				totalQuestions: questionsLength,
				timeSpent: finalTimeSpent,
				streak,
				gameId: id!,
				sessionId: sessionState?.sessionId || '',
				completedAt: Date.now(),
			}

			// Debug logging
			if (process.env.NODE_ENV === 'development') {
				console.log('Game completion - final results:', finalResults)
			}

			// Complete the session with final results and navigate to results
			completeSession(finalResults)
			// Use setTimeout to ensure redirect happens after render cycle
			setTimeout(() => {
				setLocation(`/results/${id}`)
			}, 0)
		}
	}, [
		currentQuestionIndex,
		questions?.length,
		updateSessionState,
		gameStartTime,
		id,
		score,
		correctAnswers,
		streak,
		sessionState?.sessionId,
		completeSession,
		setLocation,
	])

	// Keyboard event handler for SPACE key
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			// Only trigger if SPACE key is pressed and question is answered
			if (event.code === 'Space' || event.key === ' ' || event.keyCode === 32) {
				event.preventDefault() // Prevent default space behavior (scrolling)
				if (isAnswered) {
					if (process.env.NODE_ENV === 'development') {
						console.log('Space key detected')
					}
					handleNextQuestion()
				}
			}
		}

		// Add event listener
		document.addEventListener('keydown', handleKeyDown)

		// Cleanup function to remove event listener
		return () => {
			document.removeEventListener('keydown', handleKeyDown)
		}
	}, [isAnswered, handleNextQuestion])

	// Swipe gesture handler for mobile devices
	useSwipeGesture(gameCardRef, {
		onSwipeLeft: () => {
			// Only trigger swipe left if question is answered and on mobile
			if (isMobile && isAnswered) {
				if (process.env.NODE_ENV === 'development') {
					console.log('Swipe left detected')
				}
				handleNextQuestion()
			}
		},
		threshold: 30, // Minimum swipe distance in pixels
		preventDefault: false, // Allow button taps to work properly
	})

	// Check if game was already completed (either first completion exists OR session is marked as completed)
	useEffect(() => {
		if (id && !sessionState?.isCompleted) {
			const firstCompletionExists = hasFirstCompletion(id)
			const loadedResults = loadGameResults(id)

			// Redirect if either:
			// 1. First completion exists (score was submitted) OR
			// 2. Game results exist but no session (game was completed but score not submitted)
			if (firstCompletionExists || (loadedResults && !sessionState)) {
				// Game was already completed, redirect to results page
				if (process.env.NODE_ENV === 'development') {
					console.log('Game already completed, redirecting to results:', {
						gameId: id,
						firstCompletionExists,
						hasResults: !!loadedResults,
						hasSession: !!sessionState,
					})
				}
				// Use setTimeout to ensure redirect happens after render cycle
				setTimeout(() => {
					setLocation(`/results/${id}`)
				}, 0)
			}
		}
	}, [id, sessionState?.isCompleted, sessionState, setLocation])

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
							<a href='https://www.naknick.com' rel='noopener noreferrer'>
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
					<a
						href='/'
						target='_blank'
						rel='noopener noreferrer'
						className='flex items-center justify-center my-4'
					>
						<img
							src={logoUrl}
							alt={logoAlt}
							className='h-auto w-auto max-w-[90%]'
						/>
					</a>
					<div className='animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4'></div>

					<p className='animate-bounce'>Loading game...</p>
				</div>
			</div>
		)
	}

	return (
		<div className='flex-1 flex flex-col bg-background'>
			{/* Top Navigation Bar */}
			<div className='sticky flex justify-center top-0 z-50 bg-background/80 backdrop-blur-sm shadow-md'>
				{/* Timer and Stats - Compact version */}
				<GameStatsBar
					timeLeft={timeLeft}
					currentQuestionIndex={currentQuestionIndex}
					questionsLength={questions.length}
					progressPercentage={progressPercentage}
					score={score}
				/>
			</div>

			<GameBrandingBar
				game={game}
				isAnswered={isAnswered}
				currentQuestionIndex={currentQuestionIndex}
				questionsLength={questions.length}
				onNextQuestion={handleNextQuestion}
			/>

			<div className='max-w-4xl w-full mx-auto px-0 text-primary'>
				{/* Question Card */}
				<GamePlayCard
					currentQuestion={currentQuestion}
					currentQuestionIndex={currentQuestionIndex}
					questions={questions}
					questionsLength={questions.length}
					selectedAnswer={selectedAnswer}
					isAnswered={isAnswered}
					showExplanation={showExplanation}
					onAnswerSelect={handleAnswerSelect}
					onNextQuestion={handleNextQuestion}
				/>
			</div>
		</div>
	)
}
