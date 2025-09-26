import { useState } from 'react'
import { useParams, useLocation } from 'wouter'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Trophy, RotateCcw, Eye, Edit3, Check } from 'lucide-react'
import { Link } from 'wouter'
import { queryClient } from '@/lib/queryClient'
import { useToast } from '@/hooks/use-toast'
import { ShareEmbedModal } from '@/components/share-embed-modal'
import type { Game } from '@shared/firebase-types'
import { useFirebaseFunctions } from '@/hooks/use-firebase-functions'

export default function Results() {
	const { id } = useParams()
	const [, setLocation] = useLocation()
	const { toast } = useToast()
	const [playerName, setPlayerName] = useState('')
	const [playerEmail, setPlayerEmail] = useState('')
	const [isScoreSaved, setIsScoreSaved] = useState(false)

	// Get URL parameters
	const urlParams = new URLSearchParams(window.location.search)
	const score = parseInt(urlParams.get('score') || '0')
	const correctAnswers = parseInt(urlParams.get('correct') || '0')
	const totalQuestions = parseInt(urlParams.get('total') || '0')
	const timeSpent = parseInt(urlParams.get('time') || '0')
	const streak = parseInt(urlParams.get('streak') || '0')

	// Initialize Firebase Functions
	const { getGame, savePlayerScore } = useFirebaseFunctions()

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

	const formatTime = (seconds: number) => {
		const minutes = Math.floor(seconds / 60)
		const remainingSeconds = seconds % 60
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
	}

	return (
		<div className='flex-1 py-8 flex items-center'>
			<div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
				<Card className='shadow-xl border-border'>
					<CardContent className='p-8 text-center'>
						<div className='mb-8'>
							<div className='w-20  bg-background h-20 text-4xl rounded-full flex items-center justify-center mx-auto mb-4'>
								<Trophy className='h-12 w-12 text-primary' />
							</div>
							<h3 className='text-3xl font-bold text-dark mb-2 text-primary'>
								Game Complete!
							</h3>
							<p className='text-primary'>Here are your results</p>
						</div>

						<div className='grid md:grid-cols-4 gap-6 mb-8'>
							<div className='p-6 rounded-xl bg-primary/30'>
								<div className='text-3xl font-bold text-primary mb-2'>
									{score}
								</div>
								<div className='text-sm font-medium text-card-foreground'>
									Final Score
								</div>
							</div>
							<div className='p-6 rounded-xl bg-primary/25'>
								<div className='text-3xl font-bold text-primary mb-2'>
									{correctAnswers}/{totalQuestions}
								</div>
								<div className='text-sm font-medium text-card-foreground'>
									Correct Answers
								</div>
							</div>
							<div className='p-6 rounded-xl bg-primary/20'>
								<div className='text-3xl font-bold text-primary mb-2'>
									{streak}
								</div>
								<div className='text-sm font-medium text-card-foreground'>
									Final Streak
								</div>
							</div>
							<div className='p-6 rounded-xl bg-primary/15'>
								<div className='text-3xl font-bold text-primary mb-2'>
									{formatTime(timeSpent)}
								</div>
								<div className='text-sm font-medium text-card-foreground'>
									Time Taken
								</div>
							</div>
						</div>

						{/* Player Registration */}
						{!isScoreSaved && (
							<div className='bg-accent/10 p-4 rounded-xl mb-6'>
								<h3 className='text-lg font-semibold text-primary mb-4'>
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
									className='px-6 py-3'
								>
									Save Score
								</Button>
							</div>
						)}

						{isScoreSaved && (
							<div className='bg-accent/10 p-4 rounded-xl mb-6'>
								<p className='text-primary font-semibold flex justify-center'>
									<Check className='h-6 w-6 text-primary' /> Score saved
									successfully!
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
