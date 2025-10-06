import { useState, useEffect } from 'react'
import { useParams, useLocation } from 'wouter'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Trophy, RotateCcw, Eye, Edit3, Check, AlertCircle } from 'lucide-react'
import { Link } from 'wouter'
import { queryClient } from '@/lib/queryClient'
import { useToast } from '@/hooks/use-toast'
import { ShareEmbedModal } from '@/components/share-embed-modal'
import type { Game } from '@shared/firebase-types'
import { useFirebaseFunctions } from '@/hooks/use-firebase-functions'
import { formatTime } from '@/lib/time-utils'
import { hasSubmittedScore, markScoreSubmitted } from '@/lib/fingerprint-utils'

export default function Results() {
	const { id } = useParams()
	const [, setLocation] = useLocation()
	const { toast } = useToast()
	const [playerName, setPlayerName] = useState('')
	const [playerEmail, setPlayerEmail] = useState('')
	const [isScoreSaved, setIsScoreSaved] = useState(false)
	const [hasAlreadySubmitted, setHasAlreadySubmitted] = useState(false)

	// Get URL parameters
	const urlParams = new URLSearchParams(window.location.search)
	const score = parseInt(urlParams.get('score') || '0')
	const correctAnswers = parseInt(urlParams.get('correct') || '0')
	const totalQuestions = parseInt(urlParams.get('total') || '0')
	const timeSpent = parseInt(urlParams.get('time') || '0')
	const streak = parseInt(urlParams.get('streak') || '0')

	// Initialize Firebase Functions
	const { getGame, savePlayerScore } = useFirebaseFunctions()

	// Check if player has already submitted for this game
	useEffect(() => {
		if (id) {
			const alreadySubmitted = hasSubmittedScore(id)
			setHasAlreadySubmitted(alreadySubmitted)
			if (alreadySubmitted) {
				setIsScoreSaved(true)
			}
		}
	}, [id])

	const { data: game } = useQuery<Game>({
		queryKey: [`game-${id}`],
		queryFn: async () => {
			const result = await getGame({ gameId: id })
			return result.data as Game
		},
		enabled: !!id,
	})

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
			toast({
				title: 'Success!',
				description: 'Your score has been saved to the leaderboard.',
			})
		},
		onError: () => {
			toast({
				title: 'Error',
				description: 'Failed to save score. Please try again.',
				variant: 'destructive',
			})
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

		const playerData = {
			gameId: id!,
			playerName: playerName.trim(),
			company: playerEmail.trim() || undefined, // Using company field to store email for now
			score,
			correctAnswers,
			totalQuestions,
			timeSpent,
		}

		saveScoreMutation.mutate(playerData)
	}

	return (
		<div className='flex-1 py-4 flex items-center'>
			<div className='w-full md:max-w-4xl mx-auto px-2 md:px-6'>
				<Card className='shadow-smmd:shadow-xl border-border'>
					<CardContent className='p-4 md:p-8 text-center'>
						<div className='mb-4'>
							<div className=' w-16 h-16 md:w-20 md:h-20 border-primary border-2 bg-background  text-4xl rounded-full flex items-center justify-center mx-auto mb-4'>
								<Trophy className='h-8 w-8 md:h-12 md:w-12 text-primary ' />
							</div>
							<h3 className='text-2xl md:text-3xl font-bold text-dark mb-2 text-primary'>
								Game Complete!
							</h3>
							<p className='text-primary'>Here are your results</p>
						</div>

						<ul className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4'>
							<li className='p-2 md:p-6 rounded-xl bg-primary/30'>
								<div className='text-xl md:text-3xl font-bold text-primary mb-2'>
									{score}
								</div>
								<div className='text-sm font-medium text-card-foreground'>
									Final Score
								</div>
							</li>
							<li className='p-2 md:p-6 rounded-xl bg-primary/25'>
								<div className='text-xl md:text-3xl font-bold text-primary mb-2'>
									{correctAnswers}/{totalQuestions}
								</div>
								<div className='text-sm font-medium text-card-foreground'>
									Correct Answers
								</div>
							</li>
							<li className='p-2 md:p-6 rounded-xl bg-primary/20'>
								<div className='text-xl md:text-3xl font-bold text-primary mb-2'>
									{streak}
								</div>
								<div className='text-sm font-medium text-card-foreground'>
									Final Streak
								</div>
							</li>
							<li className='p-2 md:p-6 rounded-xl bg-primary/15'>
								<div className='text-xl md:text-3xl font-bold text-primary mb-2'>
									{formatTime(timeSpent)}
								</div>
								<div className='text-sm font-medium text-card-foreground'>
									Time Taken
								</div>
							</li>
						</ul>

						{/* Player Registration */}
						{!isScoreSaved && !hasAlreadySubmitted && (
							<div className='bg-accent/10 p-4 rounded-xl mb-6'>
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
									Save Score
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

						{hasAlreadySubmitted && (
							<div className='bg-accent/10 p-4 rounded-xl mb-6'>
								<div className='flex items-center justify-center gap-2 mb-2'>
									<AlertCircle className='h-6 w-6 text-primary' />
									<h3 className='text-base md:text-lg font-semibold text-primary'>
										Score Already Submitted
									</h3>
								</div>
								<p className='text-foreground text-sm'>
									You've already submitted your score for this game. You can
									still play again for fun, but your score won't be saved to the
									leaderboard.
								</p>
							</div>
						)}

						<div className='flex flex-col gap-3 max-w-sm mx-auto'>
							{/* Primary Actions Row */}
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
								<Button
									variant='secondary'
									onClick={() => setLocation(`/game/${id}`)}
									className='px-6 py-3 w-full'
									data-testid='button-play-again'
								>
									<RotateCcw className='mr-2 h-4 w-4' />
									Play Again
								</Button>
								<Button
									variant='secondary'
									onClick={() => setLocation(`/leaderboard/${id}`)}
									className='px-6 py-3 w-full'
									data-testid='button-view-leaderboard'
								>
									<Eye className='mr-2 h-4 w-4' />
									View Leaderboard
								</Button>
							</div>

							{/* Share and Creator Actions */}
							<div className='grid grid-cols-1 gap-3'>
								<ShareEmbedModal gameId={id} gameTitle={game?.companyName} />
								{/* Creator-only links */}
								{localStorage.getItem(`game-${id}-creator-key`) && (
									<Button
										onClick={() => setLocation(`/edit-questions/${id}`)}
										variant='outline'
										className='px-6 py-3 w-full'
										data-testid='button-edit-questions'
									>
										<Edit3 className='mr-2 h-4 w-4' />
										Edit Questions
									</Button>
								)}
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
