import { useState, useEffect } from 'react'
import { useParams, useLocation } from 'wouter'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
	Trophy,
	RotateCcw,
	Eye,
	Edit3,
	Check,
	AlertCircle,
	Loader2,
	Home,
	Lock,
} from 'lucide-react'
import { Link } from 'wouter'
import { queryClient } from '@/lib/queryClient'
import { useToast } from '@/hooks/use-toast'
import { ShareEmbedModal } from '@/components/share-embed-modal'
import type { Game } from '@shared/firebase-types'
import { useFirebaseFunctions } from '@/hooks/use-firebase-functions'
import { formatTime } from '@/lib/time-utils'
import { hasSubmittedScore, markScoreSubmitted } from '@/lib/fingerprint-utils'
import { loadGameResults, hasValidResults } from '@/lib/session-utils'
import {
	applyGameCustomization,
	cleanupGameCustomization,
} from '@/lib/color-utils'
import {
	hasFirstCompletion,
	getLockedResults,
	isFirstCompletion,
	saveFirstCompletion,
} from '@/lib/first-completion-utils'

export default function Results() {
	const { id } = useParams()
	const [, setLocation] = useLocation()
	const { toast } = useToast()
	const [playerName, setPlayerName] = useState('')
	const [playerEmail, setPlayerEmail] = useState('')
	const [isScoreSaved, setIsScoreSaved] = useState(false)
	const [hasAlreadySubmitted, setHasAlreadySubmitted] = useState(false)
	const [results, setResults] = useState<{
		score: number
		correctAnswers: number
		totalQuestions: number
		timeSpent: number
		streak: number
	} | null>(null)
	const [isScoreLocked, setIsScoreLocked] = useState(false)
	const [isReplayedGame, setIsReplayedGame] = useState(false)

	// Initialize Firebase Functions
	const { getGame, savePlayerScore } = useFirebaseFunctions()

	// Load results and check for locked scores
	useEffect(() => {
		if (id) {
			const loadedResults = loadGameResults(id)
			if (loadedResults) {
				// Check if this is a replayed game (first completion exists but current session is different)
				const firstCompletionExists = hasFirstCompletion(id)
				const isFirstCompletionSession = isFirstCompletion(
					id,
					loadedResults.sessionId
				)

				if (firstCompletionExists && !isFirstCompletionSession) {
					// This is a replayed game - show locked score from first completion
					const lockedResults = getLockedResults(id)
					if (lockedResults) {
						setResults({
							score: lockedResults.score,
							correctAnswers: lockedResults.correctAnswers,
							totalQuestions: lockedResults.totalQuestions,
							timeSpent: lockedResults.timeSpent,
							streak: lockedResults.streak,
						})
						setIsScoreLocked(true)
						setIsReplayedGame(true)

						// Debug logging
						if (process.env.NODE_ENV === 'development') {
							// console.log(
							// 	'Showing locked results from first completion:',
							// 	lockedResults
							// )
						}
					}
				} else {
					// This is the first completion or same session
					setResults({
						score: loadedResults.score,
						correctAnswers: loadedResults.correctAnswers,
						totalQuestions: loadedResults.totalQuestions,
						timeSpent: loadedResults.timeSpent,
						streak: loadedResults.streak,
					})
					setIsScoreLocked(firstCompletionExists)
					setIsReplayedGame(false)
				}
			} else {
				// No valid results found, redirect to game page
				toast({
					title: 'No Results Found',
					description: 'Please complete the game first.',
					variant: 'destructive',
				})
				setLocation(`/game/${id}`)
			}
		}
	}, [id, setLocation, toast])

	// Check if player has already submitted for this game
	useEffect(() => {
		if (id) {
			const alreadySubmitted = hasSubmittedScore(id)
			setHasAlreadySubmitted(alreadySubmitted)
			if (alreadySubmitted) {
				setIsScoreSaved(true)
			}

			// Debug logging to help identify issues
			if (process.env.NODE_ENV === 'development') {
				// console.log('Results page submission check:', {
				// 	gameId: id,
				// 	alreadySubmitted,
				// 	hasAlreadySubmitted,
				// 	isScoreSaved,
				// })
			}
		}
	}, [id])

	// Handle Enter key submission
	useEffect(() => {
		const handleKeyPress = (event: KeyboardEvent) => {
			if (
				event.key === 'Enter' &&
				!isScoreSaved &&
				!hasAlreadySubmitted &&
				results?.score &&
				playerName.trim() // Only submit if player name is filled
			) {
				handleSaveScore()
			}
		}

		document.addEventListener('keydown', handleKeyPress)
		return () => {
			document.removeEventListener('keydown', handleKeyPress)
		}
	}, [isScoreSaved, hasAlreadySubmitted, results?.score, playerName])

	const { data: game } = useQuery<Game>({
		queryKey: [`game-${id}`],
		queryFn: async () => {
			const result = await getGame({ gameId: id })
			return result.data as Game
		},
		enabled: !!id,
	})

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

	// Determine which logo to show - use game data if available, otherwise use default
	const logoUrl = game?.customization?.customLogoUrl || '/assets/logo.png'
	const logoAlt = game?.customization?.customLogoUrl
		? 'Custom game logo'
		: 'NaknNick games logo'

	const saveScoreMutation = useMutation({
		mutationFn: async (playerData: any) => {
			// Use the actual Firebase Function to save the score
			const result = await savePlayerScore(playerData)
			return result.data
		},
		onSuccess: () => {
			setIsScoreSaved(true)
			// Mark as submitted in localStorage
			if (id) {
				markScoreSubmitted(id)
			}

			// Save first completion data only after successful submission
			if (id && results && !hasFirstCompletion(id)) {
				const firstCompletionData = {
					...results,
					gameId: id,
					sessionId: loadGameResults(id)?.sessionId || '',
					completedAt: Date.now(),
				}
				saveFirstCompletion(firstCompletionData)

				if (process.env.NODE_ENV === 'development') {
					// console.log(
					// 	'First completion saved after successful submission:',
					// 	firstCompletionData
					// )
				}
			}

			toast({
				title: 'Success!',
				description: 'Your score has been saved to the leaderboard.',
			})
		},
		onError: (error: any) => {
			console.error('Score submission error:', error)

			// Check if this is a validation error from the server
			if (
				error?.code === 'failed-precondition' ||
				error?.details?.validationErrors
			) {
				toast({
					title: 'Score Validation Failed',
					description:
						error.message ||
						'Score validation failed. Please complete the game properly to save your score.',
					variant: 'destructive',
				})
			} else {
				toast({
					title: 'Error',
					description: 'Failed to save score. Please try again.',
					variant: 'destructive',
				})
			}
		},
	})

	const handleSaveScore = () => {
		if (!playerName.trim()) {
			toast({
				title: 'Error',
				description: 'Please enter your name.',
				variant: 'destructive',
			})
			return
		}

		if (!results) {
			toast({
				title: 'Error',
				description: 'No results available to save.',
				variant: 'destructive',
			})
			return
		}

		const playerData = {
			gameId: id!,
			playerName: playerName.trim(),
			company: playerEmail.trim() || undefined, // Using company field to store email for now
			score: results.score,
			correctAnswers: results.correctAnswers,
			totalQuestions: results.totalQuestions,
			timeSpent: results.timeSpent,
		}

		saveScoreMutation.mutate(playerData)
	}
	return (
		<div className='flex-1 py-4 flex  items-center justify-center'>
			<div className='w-full md:max-w-4xl mx-auto px-2 md:px-6'>
				<div className=' my-4 text-center self-start justify-self-start'>
					<Link href='/'>
						<Button className='px-6 py-3'>
							<Home className='mr-2 h-4 w-4' />
							Home
						</Button>
					</Link>
				</div>
				<Card className='shadow-sm mb-4 border-border'>
					<CardContent className='p-4 md:p-8 text-center'>
						<div className='mb-4'>
							<div className=' w-16 h-16 md:w-20 md:h-20 border-primary border-2 bg-primary/80  text-4xl rounded-full flex items-center justify-center mx-auto mb-4'>
								<Trophy className='h-8 w-8 md:h-12 md:w-12 text-secondary ' />
							</div>
							<h3 className='text-2xl md:text-3xl font-bold text-dark mb-2 text-primary'>
								Game Complete!
							</h3>
							<p className='text-primary'>Here are your results</p>
						</div>

						{!results ? (
							<div className='text-center py-8'>
								<div className='animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4'></div>
								<p>Loading results...</p>
							</div>
						) : (
							<>
								{/* Score Locked Banner */}
								{isScoreLocked && (
									<div className='bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6'>
										<div className='flex items-center justify-center gap-2 mb-2'>
											<Lock className='h-6 w-6 text-amber-600' />
											<h3 className='text-base md:text-lg font-semibold text-amber-800'>
												Score Locked
											</h3>
										</div>
										<p className='text-amber-700 text-sm text-center'>
											{isReplayedGame
												? "Your score from your first completion is locked. You can play again for fun, but your score won't be saved to the leaderboard."
												: 'You’ve already submitted your score for this game. '}
										</p>
									</div>
								)}

								<ul className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-2'>
									<li className='p-2 md:p-6 rounded-xl border-2 border-primary bg-primary/30 relative'>
										{isScoreLocked && (
											<div className='absolute -top-2 -right-2 bg-amber-500 text-white rounded-full p-1'>
												<Lock className='h-4 w-4' />
											</div>
										)}
										<div className='text-xl md:text-3xl font-bold text-primary mb-2'>
											{results.score}
										</div>
										<div className='text-sm font-medium text-card-foreground'>
											Final Score
										</div>
									</li>
									<li className='p-2 md:p-6 rounded-xl border-2 border-primary bg-primary/25'>
										<div className='text-xl md:text-3xl font-bold text-primary mb-2'>
											{results.correctAnswers}/{results.totalQuestions}
										</div>
										<div className='text-sm font-medium text-card-foreground'>
											Correct Answers
										</div>
									</li>
									<li className='p-2 md:p-6 rounded-xl border-2 border-primary bg-primary/20'>
										<div className='text-xl md:text-3xl font-bold text-primary mb-2'>
											{results.streak}
										</div>
										<div className='text-sm font-medium text-card-foreground'>
											Final Streak
										</div>
									</li>
									<li className='p-2 md:p-6 rounded-xl border-2 border-primary bg-primary/15'>
										<div className='text-xl md:text-3xl font-bold text-primary mb-2'>
											{formatTime(results.timeSpent)}
										</div>
										<div className='text-sm font-medium text-card-foreground'>
											Time Taken
										</div>
									</li>
								</ul>

								{/* Player Registration */}
								{!isScoreSaved &&
									!hasAlreadySubmitted &&
									results.score > 0 &&
									!isScoreLocked && (
										<div className='bg-accent/10 py-4 rounded-xl mb-6'>
											<h3 className='text-base md:text-lg font-semibold text-primary mb-4'>
												Save Your Score to Leaderboard
											</h3>
											<div className='grid sm:grid-cols-2 gap-4 mb-4'>
												<div>
													<Input
														id='playerName'
														placeholder='Enter your name'
														//className='border-primary'
														value={playerName}
														onChange={(e) => setPlayerName(e.target.value)}
													/>
												</div>
												<div>
													<Input
														id='playerEmail'
														type='email'
														placeholder='your.email@company.com'
														//className='border-primary'
														value={playerEmail}
														onChange={(e) => setPlayerEmail(e.target.value)}
													/>
												</div>
											</div>
											<Button
												onClick={handleSaveScore}
												disabled={saveScoreMutation.isPending}
												className='px-6 py-3 text-lg'
											>
												{saveScoreMutation.isPending ? (
													<>
														<Loader2 className='mr-2 h-4 w-4 animate-spin' />
														Saving...
													</>
												) : (
													'Save Score'
												)}
											</Button>
										</div>
									)}

								{isScoreSaved && !hasAlreadySubmitted && (
									<div className='bg-accent/10 p-4 rounded-xl mb-6'>
										<p className='text-primary font-semibold flex justify-center'>
											<Check className='h-6 w-6 text-primary' /> Score saved
											successfully!
										</p>
									</div>
								)}

								{/* {hasAlreadySubmitted && (
									<div className='bg-accent/10 p-4 rounded-xl mb-6'>
										<div className='flex items-center justify-center gap-2 mb-2'>
											<AlertCircle className='h-6 w-6 text-primary' />
											<h3 className='text-base md:text-lg font-semibold text-primary'>
												Score Already Submitted
											</h3>
										</div>
										<p className='text-foreground text-sm'>
											You've already submitted your score for this game. You can
											still play again for fun, but your score won't be saved to
											the leaderboard.
										</p>
									</div>
								)} */}

								<div className='flex mt-4 flex-col gap-3 max-w-sm mx-auto'>
									{/* Primary Actions Row */}
									<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
										{/* <Button
											variant='outline'
											onClick={() => setLocation(`/game/${id}`)}
											className='px-6 py-3 w-full'
											data-testid='button-play-again'
										>
											<RotateCcw className='mr-2 h-4 w-4' />
											Play Again
										</Button> */}
										<Button
											variant='outline'
											onClick={() => setLocation(`/leaderboard/${id}`)}
											className='px-6 py-3 w-full'
											data-testid='button-view-leaderboard'
										>
											<Eye className='mr-2 h-4 w-4' />
											View Leaderboard
										</Button>
										<ShareEmbedModal
											gameId={id}
											gameTitle={game?.companyName}
											style='py-4'
										/>
									</div>

									{/* Share and Creator Actions */}
									{/* <div className='grid grid-cols-1 gap-3'>
										<ShareEmbedModal
											gameId={id}
											gameTitle={game?.companyName}
										/>
									</div> */}
								</div>
							</>
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
