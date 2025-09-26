import { useParams } from 'wouter'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Trophy, Home, Users } from 'lucide-react'
import { Link } from 'wouter'
import type { Player, Game } from '@shared/firebase-types'
import { useFirebaseFunctions } from '@/hooks/use-firebase-functions'

export default function Leaderboard() {
	const { id } = useParams()

	// If ID is provided, show game-specific leaderboard, otherwise show global
	const isGameSpecific = Boolean(id)

	// Initialize Firebase Functions
	const { getGame, getGameLeaderboard } = useFirebaseFunctions()

	const { data: game } = useQuery<Game>({
		queryKey: [`game-${id}`],
		queryFn: async () => {
			const result = await getGame({ gameId: id })
			return result.data as Game
		},
		enabled: isGameSpecific && !!id,
	})

	// Fetch actual leaderboard data from Firebase Functions
	const { data: leaderboard, isLoading } = useQuery<Player[]>({
		queryKey: isGameSpecific ? [`leaderboard-${id}`] : ['global-leaderboard'],
		queryFn: async () => {
			if (isGameSpecific && id) {
				// Get game-specific leaderboard
				const result = await getGameLeaderboard({ gameId: id })
				return result.data as Player[]
			} else {
				// TODO: Implement global leaderboard functionality
				// For now, return empty array for global leaderboard
				return []
			}
		},
		enabled: isGameSpecific ? !!id : true,
	})

	const getRankIcon = (rank: number) => {
		switch (rank) {
			case 1:
				return 'border-primary/70 border-2 bg-primary/70 text-primary-foreground text-2xl rounded-full'
			case 2:
				return 'border-primary/60 border-2 bg-primary/60 text-primary-foreground text-xl rounded-full'
			case 3:
				return 'border-primary/50 border-2 bg-primary/50 text-primary-foreground text-lg rounded-full'
			default:
				return 'border-primary/50 border-2 bg-muted text-primary text-lg rounded-full'
		}
	}

	const formatTime = (seconds: number) => {
		const minutes = Math.floor(seconds / 60)
		const remainingSeconds = seconds % 60
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
	}

	if (isLoading) {
		return (
			<div className='flex-1 flex items-center justify-center'>
				<div className='text-center'>
					<div className='animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4'></div>
					<p>Loading leaderboard...</p>
				</div>
			</div>
		)
	}

	return (
		<div className='flex-1 py-8'>
			<div className='max-w-4xl mx-auto px-2 sm:px-4 lg:px-8'>
				<Card className='shadow-xl overflow-hidden'>
					<div className='bg-primary p-4 text-primary-foreground'>
						<div className='flex items-center justify-between'>
							<div>
								<h3 className='text-2xl font-bold mb-2 flex items-center'>
									<Trophy className='mr-2 h-6 w-6' />
									{isGameSpecific
										? `${game?.companyName} Leaderboard`
										: 'Global Leaderboard'}
								</h3>
								<p className='opacity-90'>
									{isGameSpecific
										? 'Top performers in this trivia challenge'
										: 'Top performers across all trivia games'}
								</p>
							</div>
							<div className='text-right'>
								<div className='text-3xl font-bold'>
									{leaderboard?.length || 0}
								</div>
								<div className='text-sm opacity-90 flex items-center'>
									<Users className='mr-1 h-4 w-4' />
									Total Players
								</div>
							</div>
						</div>
					</div>

					{/* Prize Information (only for game-specific leaderboard) */}
					{isGameSpecific &&
						game &&
						(game.firstPrize || game.secondPrize || game.thirdPrize) && (
							<div className='bg-muted p-4 border-b'>
								<div className='flex flex-wrap justify-center gap-4 text-sm'>
									{game.firstPrize && (
										<div className='flex items-center'>
											<div className='w-3 h-3 bg-primary rounded-full mr-2'></div>
											<span className='font-medium'>1st:</span>
											<span className='ml-1'>{game.firstPrize}</span>
										</div>
									)}
									{game.secondPrize && (
										<div className='flex items-center'>
											<div className='w-3 h-3 bg-secondary rounded-full mr-2'></div>
											<span className='font-medium'>2nd:</span>
											<span className='ml-1'>{game.secondPrize}</span>
										</div>
									)}
									{game.thirdPrize && (
										<div className='flex items-center'>
											<div className='w-3 h-3 bg-muted-foreground rounded-full mr-2'></div>
											<span className='font-medium'>3rd:</span>
											<span className='ml-1'>{game.thirdPrize}</span>
										</div>
									)}
								</div>
							</div>
						)}

					<CardContent className='p-0'>
						{leaderboard && leaderboard.length > 0 ? (
							<div className='space-y-0'>
								{leaderboard.map((player, index) => (
									<div
										key={player.id}
										className={`flex items-center justify-between p-4 transition-colors duration-150 ${
											index % 2 === 0 ? 'bg-accent' : ''
										}`}
									>
										<div className='flex items-center space-x-4'>
											<div className='flex-shrink-0'>
												<div
													className={`w-10 h-10 ${getRankIcon(
														index + 1
													)} flex items-center justify-center font-bold`}
												>
													{index + 1}
												</div>
											</div>
											<div>
												<div className='font-semibold text-foreground'>
													{player.name}
												</div>
												<div className='text-xs text-muted-foreground'>
													{formatTime(player.timeSpent)} •{' '}
													{new Date(player.completedAt).toLocaleDateString()}
												</div>
											</div>
										</div>
										<div className='text-right'>
											<div className='text-xl font-bold text-primary'>
												{player.score}
											</div>
											<div className='text-sm text-muted-foreground'>
												{player.correctAnswers}/{player.totalQuestions} correct
											</div>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className='text-center py-12'>
								<Trophy className='mx-auto h-12 w-12 text-muted-foreground mb-4' />
								<h4 className='text-lg font-semibold text-foreground mb-2'>
									No players yet
								</h4>
								<p className='text-muted-foreground'>
									Be the first to play and make it to the leaderboard!
								</p>
							</div>
						)}
					</CardContent>

					<Separator />

					<div className=' p-4 text-center'>
						<div className='flex sm:flex-row flex-col gap-4 justify-center'>
							<Link href='/'>
								<Button className='px-6 py-3'>
									<Home className='mr-2 h-4 w-4' />
									Back to Home
								</Button>
							</Link>
							{isGameSpecific && (
								<Link href='/leaderboard'>
									<Button variant='outline' className='px-6 py-3'>
										<Trophy className='mr-2 h-4 w-4' />
										Global Leaderboard
									</Button>
								</Link>
							)}
						</div>
					</div>
				</Card>
			</div>
		</div>
	)
}
