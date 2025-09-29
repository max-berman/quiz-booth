import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Button } from '@/components/ui/button'
import { PublicGameCard } from '@/components/public-game-card'
import { useQuery } from '@tanstack/react-query'
import type { Game } from '@shared/firebase-types'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Link } from 'wouter'
import { getFunctions, httpsCallable } from 'firebase/functions'

export default function Quizzes() {
	const [page, setPage] = useState(0)
	const limit = 12 // 12 cards per page (3x4 grid)

	// Fetch public games with pagination
	const { data: games, isLoading: gamesLoading } = useQuery<Game[]>({
		queryKey: ['public-games', page],
		queryFn: async () => {
			const functions = getFunctions()
			const getPublicGames = httpsCallable(functions, 'getPublicGames')
			const result = await getPublicGames({ limit, offset: page * limit })
			return result.data as Game[]
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
	})

	// Fetch total count for pagination
	const { data: totalCount } = useQuery<{ count: number }>({
		queryKey: ['public-games-count'],
		queryFn: async () => {
			const functions = getFunctions()
			const getPublicGamesCount = httpsCallable(
				functions,
				'getPublicGamesCount'
			)
			const result = await getPublicGamesCount()
			return result.data as { count: number }
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
	})

	const hasMore = totalCount ? (page + 1) * limit < totalCount.count : false

	const handleLoadMore = () => {
		setPage((prev) => prev + 1)
	}

	return (
		<>
			<Helmet>
				<title>Quiz Games - Play Free Trivia Quizzes | QuizBooth</title>
				<meta
					name='description'
					content='Discover and play free trivia games created by our community. Browse through various categories, industries, and difficulty levels. Find your next favorite quiz game!'
				/>
				<meta
					property='og:title'
					content='Quiz Games - Play Free Trivia Quizzes | QuizBooth'
				/>
				<meta
					property='og:description'
					content='Discover and play free trivia games created by our community. Browse through various categories, industries, and difficulty levels.'
				/>
				<meta property='og:url' content='https://quizbooth.games/quizzes' />
				<meta
					name='twitter:title'
					content='Quiz Games - Play Free Trivia Quizzes | QuizBooth'
				/>
				<meta
					name='twitter:description'
					content='Discover and play free trivia games created by our community. Browse through various categories, industries, and difficulty levels.'
				/>
				<link rel='canonical' href='https://quizbooth.games/quizzes' />
			</Helmet>

			<div className='container mx-auto px-4 py-8'>
				{/* Header */}
				<div className='mb-8'>
					<Link href='/'>
						<Button variant='ghost' className='mb-4'>
							<ArrowLeft className='mr-2 h-4 w-4' />
							Back to Home
						</Button>
					</Link>
					<div className='text-center'>
						<h1 className='text-3xl md:text-4xl font-bold text-foreground mb-4'>
							All Quiz Games
						</h1>
						<p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
							Discover and play trivia games created by our community. From tech
							challenges to general knowledge quizzes, there's something for
							everyone.
						</p>
					</div>
				</div>

				{/* Games Grid */}
				{gamesLoading && page === 0 ? (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
						{Array.from({ length: 12 }, (_, i) => (
							<div key={i} className='animate-pulse'>
								<div className='bg-muted rounded-lg h-80'></div>
							</div>
						))}
					</div>
				) : games && games.length > 0 ? (
					<>
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8'>
							{games.map((game, index) => (
								<div
									key={game.id}
									className='animate-slide-up'
									style={{ animationDelay: `${0.05 * index}s` }}
								>
									<PublicGameCard game={game} />
								</div>
							))}
						</div>

						{/* Load More Button */}
						{hasMore && (
							<div className='text-center'>
								<Button
									onClick={handleLoadMore}
									disabled={gamesLoading}
									className='px-8 py-3'
								>
									{gamesLoading ? (
										<>
											<Loader2 className='mr-2 h-4 w-4 animate-spin' />
											Loading...
										</>
									) : (
										'Load More Games'
									)}
								</Button>
							</div>
						)}

						{/* No more games message */}
						{!hasMore && games.length > 0 && (
							<div className='text-center py-8'>
								<p className='text-muted-foreground'>
									You've reached the end! Check back later for more games.
								</p>
							</div>
						)}
					</>
				) : (
					<div className='text-center py-16'>
						<div className='max-w-md mx-auto'>
							<h3 className='text-xl font-semibold text-foreground mb-4'>
								No Games Available
							</h3>
							<p className='text-muted-foreground mb-6'>
								There are no public games available yet. Be the first to create
								one!
							</p>
							<Link href='/setup'>
								<Button variant='default' size='lg'>
									Create Your Game
								</Button>
							</Link>
						</div>
					</div>
				)}
			</div>
		</>
	)
}
