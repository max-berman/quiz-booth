import { useState } from 'react'
import { useLocation } from 'wouter'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { useApi, useApiMutation } from '@/hooks/use-api'
import { logger } from '@/lib/logger'
import { getAuthHeaders } from '@/lib/auth-utils'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Badge,
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	Input,
	Label,
} from '@/lib/ui-imports'
import {
	Edit3,
	BarChart3,
	Users,
	Calendar,
	Building,
	Plus,
	ArrowLeft,
	Database,
	Share2,
	Gift,
	Save,
	X,
	Play,
	Wrench,
} from 'lucide-react'
import { QRCodeModal } from '@/components/qr-code-modal'
import { ShareEmbedModal } from '@/components/share-embed-modal'
import type { Game } from '@shared/firebase-types'

export default function Dashboard() {
	const [location, setLocation] = useLocation()
	const { user, isAuthenticated } = useAuth()
	const { toast } = useToast()
	const queryClient = useQueryClient()
	const [editingPrizes, setEditingPrizes] = useState<string | null>(null)
	const [prizes, setPrizes] = useState([
		{ placement: '1st Place', prize: '' },
		{ placement: '2nd Place', prize: '' },
		{ placement: '3rd Place', prize: '' },
	])

	// Fetch games using Firebase authentication only
	const { data: allGames = [], isLoading } = useQuery<Game[]>({
		queryKey: ['/api/my-games', user?.uid],
		queryFn: async () => {
			if (!isAuthenticated) {
				logger.log('Dashboard: User not authenticated')
				return []
			}

			try {
				logger.log(
					'Dashboard: Fetching games for authenticated user:',
					user?.uid
				)
				const headers = await getAuthHeaders()
				logger.log('Dashboard: Using headers:', headers)

				const response = await fetch('/api/my-games', { headers })
				logger.log('Dashboard: Response status:', response.status)

				if (response.ok) {
					const games = await response.json()
					logger.log('Dashboard: Received games:', games)
					return games.sort(
						(a: Game, b: Game) =>
							new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
					)
				} else {
					const errorText = await response.text()
					logger.error(
						'Dashboard: Failed to fetch games:',
						response.status,
						errorText
					)
					return []
				}
			} catch (error) {
				logger.error('Dashboard: Error fetching games:', error)
				return []
			}
		},
		enabled: isAuthenticated,
	})

	const updatePrizesMutation = useMutation({
		mutationFn: async ({
			gameId,
			updatedPrizes,
		}: {
			gameId: string
			updatedPrizes: { placement: string; prize: string }[]
		}) => {
			const headers = await getAuthHeaders()
			const response = await fetch(`/api/games/${gameId}/prizes`, {
				method: 'PUT',
				headers: {
					...headers,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ prizes: updatedPrizes }),
			})

			if (!response.ok) {
				const errorData = await response
					.json()
					.catch(() => ({ message: 'Failed to update prizes' }))
				throw new Error(errorData.message || 'Failed to update prizes')
			}

			return response.json()
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/api/my-games', user?.uid] })
			toast({
				title: 'Prizes updated',
				description: 'Prize information has been saved successfully.',
			})
			setEditingPrizes(null)
		},
		onError: (error: any) => {
			toast({
				title: 'Failed to update prizes',
				description: error.message || 'Please try again.',
				variant: 'destructive',
			})
		},
	})

	const handleSavePrizes = () => {
		if (!editingPrizes) return

		// Filter out empty prizes
		const validPrizes = prizes.filter(
			(p) => p.placement.trim() && p.prize.trim()
		)
		updatePrizesMutation.mutate({
			gameId: editingPrizes,
			updatedPrizes: validPrizes,
		})
	}

	const addPrize = () => {
		setPrizes([...prizes, { placement: '', prize: '' }])
	}

	const removePrize = (index: number) => {
		if (prizes.length > 1) {
			setPrizes(prizes.filter((_, i) => i !== index))
		}
	}

	const updatePrize = (
		index: number,
		field: 'placement' | 'prize',
		value: string
	) => {
		const updatedPrizes = [...prizes]
		updatedPrizes[index][field] = value
		setPrizes(updatedPrizes)
	}

	if (!isAuthenticated) {
		return (
			<div className='flex-1 py-8'>
				<div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
					<Card>
						<CardContent className='p-8 text-center'>
							<h2 className='text-2xl font-bold mb-4'>Sign In Required</h2>
							<p className='text-foreground mb-6'>
								Please sign in to view and manage your trivia games.
							</p>
							<Button
								onClick={() => setLocation('/auth/sign-in')}
								data-testid='button-sign-in'
							>
								Sign In
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		)
	}

	if (allGames.length === 0 && !isLoading) {
		return (
			<div className='flex-1 py-8'>
				<div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='flex items-center gap-4 mb-8'>
						<Button
							variant='ghost'
							size='sm'
							onClick={() => setLocation('/')}
							data-testid='button-back-home'
						>
							<ArrowLeft className='h-4 w-4 mr-2' />
							Back to Home
						</Button>
					</div>

					<Card>
						<CardContent className='p-8 text-center'>
							<Building className='h-16 w-16 text-foreground mx-auto mb-4' />
							<h2 className='text-2xl font-bold mb-4'>No Games Created</h2>
							<p className='text-foreground mb-6'>
								You haven't created any trivia games yet. Get started by
								creating your first game!
							</p>
							<Button
								onClick={() => setLocation('/setup')}
								data-testid='button-create-first-game'
								className=' !text-white px-8 py-3'
							>
								<Plus className='mr-2 h-4 w-4' />
								Create Your First Game
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		)
	}

	if (isLoading) {
		return (
			<div className='flex-1 flex items-center justify-center'>
				<div className='text-center'>
					<div className='animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4'></div>
					<p>Loading your games...</p>
				</div>
			</div>
		)
	}

	return (
		<div className='flex-1 py-8'>
			<div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
				{/* Header */}
				<div className='flex items-center justify-between mb-8'>
					<div className='flex items-center gap-4'>
						<div>
							<h1 className='text-h1 text-foreground'>Creator Dashboard</h1>
							<p className='text-foreground'>
								Manage your {allGames.length} trivia game
								{allGames.length !== 1 ? 's' : ''}
							</p>
						</div>
					</div>
					<Button
						onClick={() => setLocation('/setup')}
						data-testid='button-create-new-game'
						className=' !text-white '
					>
						<Plus className='mr-2 h-4 w-4' />
						Create New Game
					</Button>
				</div>

				{/* Games Grid */}
				{allGames.length > 0 ? (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{allGames.map((game) => (
							<Card
								key={game.id}
								className='hover:shadow-xl hover:scale-[1.02] transition-all duration-200 border-2'
							>
								<CardHeader className='pb-3'>
									<div className='flex items-center justify-between'>
										<CardTitle
											title={game.companyName}
											className='text-xl font-bold line-clamp-2 text-foreground'
										>
											{game.companyName}
										</CardTitle>
										<Badge className='ml-2 font-semibold'>
											{game.industry}
										</Badge>
									</div>
								</CardHeader>
								<CardContent className='space-y-4'>
									{/* Game Details */}
									<div className='space-y-2 text-sm text-foreground'>
										<div className='flex items-center gap-2'>
											<Calendar className='h-4 w-4' />
											Created {new Date(game.createdAt).toLocaleDateString()}
										</div>
										<div className='flex items-center gap-2'>
											<Building className='h-4 w-4' />
											{game.questionCount} questions • {game.difficulty}{' '}
											difficulty
										</div>
										{game.categories.length > 0 && (
											<div className='flex flex-wrap gap-1 mt-2'>
												{game.categories.map((category, index) => (
													<Badge
														key={index}
														variant='secondary'
														className='text-xs'
													>
														{category}
													</Badge>
												))}
											</div>
										)}
									</div>

									{/* Action Buttons */}
									<div className='space-y-3 pt-4'>
										{/* Management Actions */}
										<div className='grid grid-cols-2 gap-2'>
											<Button
												variant='outline'
												className='w-full'
												size='sm'
												onClick={() =>
													setLocation(`/edit-questions/${game.id}`)
												}
												data-testid={`button-edit-questions-${game.id}`}
											>
												<Edit3 className='mr-1 h-4 w-4' />
												Questions
											</Button>
											<Button
												variant='outline'
												className='w-full '
												size='sm'
												onClick={() => setLocation(`/game/${game.id}`)}
												data-testid={`button-play-game-${game.id}`}
											>
												<Play className='mr-2 h-4 w-4' />
												Play Game
											</Button>
										</div>

										{/* Analytics Actions */}
										<div className='grid grid-cols-2 gap-2'>
											<Button
												variant='outline'
												className='w-full'
												size='sm'
												onClick={() => setLocation(`/leaderboard/${game.id}`)}
												data-testid={`button-leaderboard-${game.id}`}
											>
												<BarChart3 className='mr-1 h-4 w-4' />
												Leaderboard
											</Button>
											<Button
												variant='outline'
												className='w-full'
												size='sm'
												onClick={() => {
													// Store creator access for raw data
													localStorage.setItem(
														`game-${game.id}-creator-key`,
														game.creatorKey || ''
													)
													setLocation(`/submissions/${game.id}`)
												}}
												data-testid={`button-submissions-${game.id}`}
											>
												<Database className='mr-1 h-4 w-4' />
												Raw Data
											</Button>
										</div>

										{/* Sharing Actions */}
										<div className='grid grid-cols-2 gap-2'>
											<QRCodeModal
												gameId={game.id}
												gameTitle={game.companyName}
											/>
											<ShareEmbedModal
												gameId={game.id}
												gameTitle={game.companyName}
											/>
										</div>
									</div>

									{/* Prizes if configured */}

									<div className='flex border-t border-primary justify-between pt-4'>
										{/* <p className='text-xs font-medium text-foreground mb-1'>
												Prizes:
											</p> */}
										<ul className='text-xs flex flex-col flex-wrap  w-1/2'>
											{game.prizes &&
												game.prizes.length > 0 &&
												game.prizes.map((prize, index) => (
													<li key={index} className='mr-2'>
														<strong>{prize.placement}</strong>: {prize.prize}
													</li>
												))}
										</ul>
										<Button
											variant='outline'
											className='w-1/2'
											size='sm'
											onClick={() => {
												// Initialize prizes for this game
												const existingPrizes = []
												if (game.prizes && game.prizes.length > 0) {
													existingPrizes.push(...game.prizes)
												}
												if (existingPrizes.length === 0) {
													existingPrizes.push({
														placement: '1st Place',
														prize: '',
													})
												}
												setPrizes(existingPrizes)
												setEditingPrizes(game.id)
											}}
											data-testid={`button-edit-prizes-${game.id}`}
										>
											{game.prizes && game.prizes.length > 0 ? (
												<Wrench className='mr-1 h-4 w-4' />
											) : (
												<Gift className='mr-1 h-4 w-4' />
											)}
											Prizes
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				) : (
					<Card>
						<CardContent className='p-8 text-center'>
							<Building className='h-16 w-16 text-foreground mx-auto mb-4' />
							<h2 className='text-2xl font-bold mb-4'>No Games Found</h2>
							<p className='text-foreground mb-6'>
								There was an issue loading your games. Please try refreshing the
								page.
							</p>
							<Button onClick={() => window.location.reload()}>
								Refresh Page
							</Button>
						</CardContent>
					</Card>
				)}

				{/* Prize Edit Modal */}
				<Dialog
					open={!!editingPrizes}
					onOpenChange={() => setEditingPrizes(null)}
				>
					<DialogContent className='max-w-md'>
						<DialogHeader>
							<DialogTitle>Edit Prize Information</DialogTitle>
						</DialogHeader>
						<div className='space-y-4'>
							<div className='space-y-3'>
								{prizes.map((prize, index) => (
									<div key={index} className='flex gap-2 items-end'>
										<div className='flex-1'>
											<Label htmlFor={`placement-${index}`} className='text-xs'>
												Placement
											</Label>
											<Input
												id={`placement-${index}`}
												placeholder='e.g., 1st Place'
												value={prize.placement}
												onChange={(e) =>
													updatePrize(index, 'placement', e.target.value)
												}
												className='h-8 text-sm'
											/>
										</div>
										<div className='flex-1'>
											<Label htmlFor={`prize-${index}`} className='text-xs'>
												Prize
											</Label>
											<Input
												id={`prize-${index}`}
												placeholder='e.g., $100 Gift Card'
												value={prize.prize}
												onChange={(e) =>
													updatePrize(index, 'prize', e.target.value)
												}
												className='h-8 text-sm'
											/>
										</div>
										{prizes.length > 1 && (
											<Button
												type='button'
												variant='outline'
												size='sm'
												onClick={() => removePrize(index)}
												className='h-8 w-8 p-0'
											>
												<X className='h-3 w-3' />
											</Button>
										)}
									</div>
								))}
							</div>

							<div className='flex gap-2'>
								<Button
									type='button'
									variant='outline'
									size='sm'
									onClick={addPrize}
									className='flex-1'
								>
									<Plus className='h-3 w-3 mr-1' />
									Add Prize
								</Button>
							</div>

							<div className='flex gap-2 pt-2'>
								<Button
									onClick={handleSavePrizes}
									disabled={updatePrizesMutation.isPending}
									className='flex-1'
								>
									<Save className='h-4 w-4 mr-2' />
									{updatePrizesMutation.isPending ? 'Saving...' : 'Save Prizes'}
								</Button>
								<Button
									variant='outline'
									onClick={() => setEditingPrizes(null)}
									disabled={updatePrizesMutation.isPending}
								>
									Cancel
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	)
}
