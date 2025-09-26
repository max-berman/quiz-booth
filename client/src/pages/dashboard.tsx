import { useState } from 'react'
import { useLocation } from 'wouter'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { logger } from '@/lib/logger'
import { useFirebaseFunctions } from '@/hooks/use-firebase-functions'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Badge,
} from '@/lib/ui-imports'
import { Plus, ArrowLeft, Building } from 'lucide-react'
import { PrizeEditModal } from '@/components/prize-edit-modal'
import { GameCardEnhanced } from '@/components/game-card-enhanced'
import type { Game } from '@shared/firebase-types'

export default function Dashboard() {
	const [location, setLocation] = useLocation()
	const { user, isAuthenticated } = useAuth()
	const { toast } = useToast()
	const queryClient = useQueryClient()
	const [editingPrizes, setEditingPrizes] = useState<string | null>(null)
	const [initialPrizes, setInitialPrizes] = useState([
		{ placement: '1st Place', prize: '' },
		{ placement: '2nd Place', prize: '' },
		{ placement: '3rd Place', prize: '' },
	])

	const handleEditPrizes = (
		gameId: string,
		prizes: { placement: string; prize: string }[]
	) => {
		setInitialPrizes(prizes)
		setEditingPrizes(gameId)
	}

	// Initialize Firebase Functions
	const { getGamesByUser } = useFirebaseFunctions()

	// Fetch games using Firebase Functions
	const {
		data: allGames = [],
		isLoading,
		isError,
	} = useQuery<Game[]>({
		queryKey: ['getGamesByUser', user?.uid],
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

				const result = await getGamesByUser({})
				const games = result.data as Game[]
				logger.log('Dashboard: Received games:', games)

				return games.sort(
					(a: Game, b: Game) =>
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
				)
			} catch (error) {
				logger.error('Dashboard: Error fetching games:', error)
				throw error
			}
		},
		enabled: isAuthenticated,
		retry: 2,
		retryDelay: 1000,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	})

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

	if (allGames.length === 0 && !isLoading && !isError) {
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
								className='text-white px-8 py-3'
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
				<div className='flex items-bottom justify-between mb-8'>
					<div className='flex  gap-4'>
						<div>
							<h1 className='text-h1 text-foreground'>Dashboard</h1>
							<p className='text-foreground'>
								Manage your <strong>{allGames.length}</strong> trivia game
								{allGames.length !== 1 ? 's' : ''}
							</p>
						</div>
					</div>
					<Button
						onClick={() => setLocation('/setup')}
						data-testid='button-create-new-game'
						className='text-white self-end'
					>
						<Plus className='mr-2 h-4 w-4' />
						Create New Game
					</Button>
				</div>

				{/* Games Grid */}
				{allGames.length > 0 ? (
					<div className='grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-4'>
						{allGames.map((game) => (
							<GameCardEnhanced
								key={game.id}
								game={game}
								onEditPrizes={handleEditPrizes}
							/>
						))}
					</div>
				) : isError ? (
					<Card>
						<CardContent className='p-8 text-center'>
							<Building className='h-16 w-16 text-foreground mx-auto mb-4' />
							<h2 className='text-2xl font-bold mb-4'>Error Loading Games</h2>
							<p className='text-foreground mb-6'>
								Failed to load your games. Please try refreshing the page.
							</p>
							<Button onClick={() => window.location.reload()}>
								Refresh Page
							</Button>
						</CardContent>
					</Card>
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
				<PrizeEditModal
					open={!!editingPrizes}
					onOpenChange={() => setEditingPrizes(null)}
					gameId={editingPrizes}
					initialPrizes={initialPrizes}
				/>
			</div>
		</div>
	)
}
