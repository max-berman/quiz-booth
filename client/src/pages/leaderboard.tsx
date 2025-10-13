import { useParams, useLocation } from 'wouter'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Trophy, Home, Users, ExternalLink } from 'lucide-react'
import { Link } from 'wouter'
import type { Player, Game } from '@shared/firebase-types'
import { useFirebaseFunctions } from '@/hooks/use-firebase-functions'
import { formatTime } from '@/lib/time-utils'
import { formatDate } from '@/lib/date-utils'
import {
	applyGameCustomization,
	cleanupGameCustomization,
} from '@/lib/color-utils'
import { useGameLogo } from '@/hooks/use-game-logo'

export default function Leaderboard() {
	const { id } = useParams()
	const [, setLocation] = useLocation()

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

	// Apply customization styles for game-specific leaderboards
	useEffect(() => {
		if (isGameSpecific && game?.customization) {
			applyGameCustomization(game.customization)
		}

		// Cleanup function to reset styles
		return () => {
			cleanupGameCustomization()
		}
	}, [isGameSpecific, game?.customization])

	// Use custom hook for logo caching and retrieval
	const { logoUrl, logoAlt, cachedLogoUrl } = useGameLogo(
		id,
		game?.customization?.customLogoUrl
	)

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

	if (isLoading) {
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
		<div className='flex-1 bg-background'>
			{/* Top Navigation Bar - Same as game page */}
			<div className='sticky top-0 z-50 bg-background/80 backdrop-blur-sm shadow-md'>
				<div className='max-w-4xl mx-auto px-2 sm:px-6 lg:px-8'>
					<div className='max-w-4xl mx-auto px-2 sm:px-6 lg:px-8 w-full '>
						<div className='flex justify-center p-2 '>
							<a
								href={
									game?.customization?.customLogoLink || 'https://naknick.com'
								}
								target='_blank'
								rel='noopener noreferrer'
							>
								{cachedLogoUrl || game?.customization?.customLogoUrl ? (
									<img
										src={cachedLogoUrl || game?.customization?.customLogoUrl}
										alt='Custom game logo'
										className='max-h-12 '
									/>
								) : (
									<div className='flex flex-col items-center font-medium'>
										<img
											src='/assets/naknick-logo.png'
											alt='QuizBooth.games logo'
											className='max-h-12 w-auto'
										/>
										<span className='text-xs flex items-center mt-2'>
											Build by Naknick.com{' '}
											<ExternalLink className='ml-1 h-3 w-3' />
										</span>
									</div>
								)}
							</a>
						</div>
					</div>
				</div>
			</div>
			<div className='max-w-4xl mx-auto px-2 sm:px-4 lg:px-8 py-4'>
				<div className='text-center self-start justify-self-start'>
					<Link href='/'>
						<Button className='px-6 py-3'>
							<Home className='mr-2 h-4 w-4' />
							Home
						</Button>
					</Link>
				</div>

				<Card className='shadow-sm overflow-hidden my-4'>
					<div className='bg-card p-1 md:p-4 text-primary'>
						<div className='flex flex-col sm:flex-row items-center justify-between lg:gap-4'>
							<Trophy className='m-2 h-6 w-6 self-center' />
							<div className='flex justify-center'>
								<h3 className='text-base lg:text-2xl font-medium '>
									{isGameSpecific ? `${game?.gameTitle}` : 'Global Leaderboard'}
								</h3>
							</div>
							<div className='items-center justify-center flex text-base lg:text-2xl font-medium'>
								<div className='flex items-center mr-2'>
									<Users className='mr-1 h-4 w-4' />
									Total Players
								</div>
								<div className='text-2xl'>{leaderboard?.length || 0}</div>
							</div>
						</div>
					</div>

					<Separator />

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
										className={`flex items-center justify-between p-3 sm:p-4 transition-colors duration-150 ${
											index % 2 === 0 ? 'bg-primary-foreground' : 'bg-secondary'
										}`}
									>
										<div className='flex items-center space-x-3 sm:space-x-4'>
											<div className='flex-shrink-0'>
												<div
													className={`w-8 h-8 sm:w-10 sm:h-10 ${getRankIcon(
														index + 1
													)} flex items-center justify-center font-bold text-sm sm:text-base`}
												>
													{index + 1}
												</div>
											</div>
											<div className='min-w-0 flex-1'>
												<div className='font-semibold text-foreground text-sm sm:text-base truncate'>
													{player.name}
												</div>
												<div className='text-xs text-muted-foreground'>
													{formatTime(player.timeSpent)} •{' '}
													{formatDate(player.completedAt)}
												</div>
											</div>
										</div>
										<div className='text-right flex-shrink-0 ml-2'>
											<div className='text-lg sm:text-xl font-bold text-primary'>
												{player.score}
											</div>
											<div className='text-xs text-muted-foreground'>
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

					{/* <Separator /> */}

					<div className=' text-center'>
						<div className='flex sm:flex-row flex-col gap-4 justify-center'>
							{/* <Link href='/'>
								<Button className='px-6 py-3'>
									<Home className='mr-2 h-4 w-4' />
									Home
								</Button>
							</Link>
							{isGameSpecific && (
								<Link href='/leaderboard'>
									<Button variant='outline' className='px-6 py-3'>
										<Trophy className='mr-2 h-4 w-4' />
										Global Leaderboard
									</Button>
								</Link>
							)} */}
						</div>
					</div>
				</Card>
			</div>
		</div>
	)
}
