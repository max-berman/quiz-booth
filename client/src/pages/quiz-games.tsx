import { useState, useEffect, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { Button } from '@/components/ui/button'
import { PublicGameCard } from '@/components/public-game-card'
import { GameCardSkeleton } from '@/components/game-card-skeleton'
import { useQuery } from '@tanstack/react-query'
import type { Game } from '@shared/firebase-types'
import {
	ArrowLeft,
	Loader2,
	Filter,
	X,
	ChevronsUpDown,
	Check,
} from 'lucide-react'
import { Link } from 'wouter'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { INDUSTRY_OPTIONS } from '@shared/constants'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { logoCache } from '@/lib/logo-cache'

export default function Quizzes() {
	const [page, setPage] = useState(0)
	const [selectedIndustry, setSelectedIndustry] = useState<string>('all')
	const [selectedCategories, setSelectedCategories] = useState<string[]>([])
	const [showFilters, setShowFilters] = useState(false)
	const [industryOpen, setIndustryOpen] = useState(false)
	const limit = 12 // 12 cards per page (3x4 grid)

	// Reset page when filters change
	useEffect(() => {
		setPage(0)
	}, [selectedIndustry, selectedCategories])

	// Fetch public games with pagination and filtering
	const { data: games, isLoading: gamesLoading } = useQuery<Game[]>({
		queryKey: ['public-games', page, selectedIndustry, selectedCategories],
		queryFn: async () => {
			const functions = getFunctions()
			const getPublicGames = httpsCallable(functions, 'getPublicGames')
			const result = await getPublicGames({
				limit,
				offset: page * limit,
				industry: selectedIndustry,
				categories: selectedCategories,
			})

			const games = result.data as Game[]

			// Cache logo URLs for all fetched games
			games.forEach((game) => {
				if (game.customization?.customLogoUrl) {
					logoCache.addLogo(game.id, game.customization.customLogoUrl)
				}
			})

			return games
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

	const handleCategoryToggle = (category: string) => {
		setSelectedCategories((prev) =>
			prev.includes(category)
				? prev.filter((c) => c !== category)
				: [...prev, category]
		)
	}

	const clearFilters = () => {
		setSelectedIndustry('all')
		setSelectedCategories([])
	}

	// Extract unique categories from existing games
	const categories = useMemo(() => {
		if (!games) return []

		const allCategories = games.flatMap((game) => game.categories || [])
		const uniqueCategories = Array.from(new Set(allCategories)).sort()

		return uniqueCategories
	}, [games])

	const hasActiveFilters =
		selectedIndustry !== 'all' || selectedCategories.length > 0

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

			<div className='container flex-col flex-1 flex mx-auto px-4 py-8'>
				{/* Header */}
				<div className='mb-8'>
					<div className='text-center'>
						<h1 className='text-3xl md:text-4xl font-bold text-foreground mb-4'>
							All Quiz Games
						</h1>
						<p className='text-lg text-foreground max-w-2xl mx-auto'>
							Discover and play trivia games created by our community. From tech
							challenges to general knowledge quizzes, there's something for
							everyone.
						</p>
					</div>
				</div>

				{/* Filters Section */}
				<div className='mb-8'>
					<div className='flex flex-col md:flex-row gap-4 items-start md:items-center justify-between'>
						<div className='flex items-center gap-4'>
							<Button
								variant='outline'
								onClick={() => setShowFilters(!showFilters)}
								className='flex items-center gap-2'
							>
								<Filter className='h-4 w-4' />
								Filters
								{hasActiveFilters && (
									<span className='bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs'>
										{selectedCategories.length +
											(selectedIndustry !== 'all' ? 1 : 0)}
									</span>
								)}
							</Button>

							{hasActiveFilters && (
								<Button
									variant='ghost'
									onClick={clearFilters}
									className='flex items-center gap-2 text-muted-foreground hover:text-foreground'
								>
									<X className='h-4 w-4' />
									Clear Filters
								</Button>
							)}
						</div>

						{/* Active Filters Display */}
						{hasActiveFilters && (
							<div className='flex flex-wrap gap-2'>
								{selectedIndustry !== 'all' && (
									<span className='bg-primary/20 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-1'>
										Industry: {selectedIndustry}
										<button
											onClick={() => setSelectedIndustry('all')}
											className='hover:text-primary-foreground'
										>
											<X className='h-3 w-3' />
										</button>
									</span>
								)}
								{selectedCategories.map((category) => (
									<span
										key={category}
										className='bg-secondary/20 text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-1'
									>
										{category}
										<button
											onClick={() => handleCategoryToggle(category)}
											className='hover:text-secondary-foreground'
										>
											<X className='h-3 w-3' />
										</button>
									</span>
								))}
							</div>
						)}
					</div>

					{/* Filter Options */}
					{showFilters && (
						<div className='mt-6 p-6 bg-card border rounded-lg'>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
								{/* Industry Filter */}
								<div>
									<h3 className='font-semibold text-foreground mb-4'>
										Industry
									</h3>
									<Popover open={industryOpen} onOpenChange={setIndustryOpen}>
										<PopoverTrigger asChild>
											<Button
												variant='outline'
												role='combobox'
												aria-expanded={industryOpen}
												className={`w-full justify-between text-base ${
													selectedIndustry !== 'all'
														? 'border-primary'
														: 'border-border '
												}`}
											>
												{selectedIndustry !== 'all'
													? selectedIndustry
													: 'All Industries'}
												<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
											</Button>
										</PopoverTrigger>
										<PopoverContent className='w-full p-0'>
											<Command>
												<CommandInput
													placeholder='Search industry...'
													className='h-9'
												/>
												<CommandList>
													<CommandEmpty>No industry found.</CommandEmpty>
													<CommandGroup>
														<CommandItem
															value='all'
															onSelect={() => {
																setSelectedIndustry('all')
																setIndustryOpen(false)
															}}
														>
															All Industries
															<Check
																className={cn(
																	'ml-auto',
																	selectedIndustry === 'all'
																		? 'opacity-100'
																		: 'opacity-0'
																)}
															/>
														</CommandItem>
														{INDUSTRY_OPTIONS.map((industry) => (
															<CommandItem
																key={industry}
																value={industry}
																onSelect={() => {
																	setSelectedIndustry(industry)
																	setIndustryOpen(false)
																}}
															>
																{industry}
																<Check
																	className={cn(
																		'ml-auto',
																		selectedIndustry === industry
																			? 'opacity-100'
																			: 'opacity-0'
																	)}
																/>
															</CommandItem>
														))}
													</CommandGroup>
												</CommandList>
											</Command>
										</PopoverContent>
									</Popover>
								</div>

								{/* Categories Filter */}
								<div>
									<h3 className='font-semibold text-foreground mb-4'>
										Question Categories
									</h3>
									<div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
										{categories.map((category) => (
											<button
												key={category}
												onClick={() => handleCategoryToggle(category)}
												className={`px-1 py-1 rounded-lg text-sm border transition-colors bg-background ${
													selectedCategories.includes(category)
														? 'border-border hover:bg-accent border-primary font-semibold'
														: 'text-secondary-foreground'
												}`}
											>
												{category}
											</button>
										))}
									</div>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Games Grid */}
				{gamesLoading && page === 0 ? (
					<GameCardSkeleton count={12} />
				) : games && games.length > 0 ? (
					<>
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8'>
							{games.map((game, index) => (
								<div
									key={game.id}
									className='animate-slide-up'
									style={{ animationDelay: `${0.05 * index}s` }}
								>
									<PublicGameCard game={game} showPlayCount={false} />
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
