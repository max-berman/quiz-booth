import { useState } from 'react'
import { useLocation } from 'wouter'
import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Badge,
} from '@/lib/ui-imports-basic'
import {
	Edit3,
	BarChart3,
	Calendar,
	Building,
	Database,
	Gift,
	Target,
	Wrench,
	Play,
	Plus,
	Trash2,
	GalleryVerticalEnd,
} from 'lucide-react'
import { QRCodeModal } from '@/components/qr-code-modal'
import { ShareEmbedModal } from '@/components/share-embed-modal'
import { Checkbox } from '@/components/ui/checkbox'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import type { Game } from '@shared/firebase-types'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { isWebsite, formatWebsite } from '@/lib/website-utils'

interface GameCardEnhancedProps {
	game: Game
	onEditPrizes: (
		gameId: string,
		prizes: { placement: string; prize: string }[]
	) => void
}

export function GameCardEnhanced({
	game,
	onEditPrizes,
}: GameCardEnhancedProps) {
	const [, setLocation] = useLocation()
	const [isPublic, setIsPublic] = useState(game.isPublic === true)
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
	const { toast } = useToast()
	const queryClient = useQueryClient()

	// Fetch actual question count for this game
	const {
		data: actualQuestionCount,
		isLoading: questionsLoading,
		error: questionsError,
	} = useQuery<number>({
		queryKey: ['/api/games', game.id, 'questions'],
		queryFn: async () => {
			console.log(`Fetching questions for game ${game.id}`)
			const response = await fetch(`/api/games/${game.id}/questions`)
			if (!response.ok) {
				throw new Error(`Failed to fetch questions: ${response.status}`)
			}
			const questions = await response.json()
			console.log(`Questions response for game ${game.id}:`, questions)
			return questions.length
		},
		enabled: !!game.id,
		staleTime: 5 * 60 * 1000, // 5 minutes
		retry: 2,
	})

	// Fetch play count for this game
	const {
		data: playCount,
		isLoading: playCountLoading,
		error: playCountError,
	} = useQuery<number>({
		queryKey: ['/api/games', game.id, 'play-count'],
		queryFn: async () => {
			console.log(`Fetching play count for game ${game.id}`)
			const response = await fetch(`/api/games/${game.id}/play-count`)
			if (!response.ok) {
				throw new Error(`Failed to fetch play count: ${response.status}`)
			}
			const data = await response.json()
			console.log(`Play count response for game ${game.id}:`, data)
			return data.count
		},
		enabled: !!game.id,
		staleTime: 2 * 60 * 1000, // 2 minutes
		retry: 2,
	})

	// Delete game mutation
	const deleteGameMutation = useMutation({
		mutationFn: async (gameId: string) => {
			const { getFunctions, httpsCallable } = await import('firebase/functions')
			const functions = getFunctions()
			const deleteGameFunction = httpsCallable(functions, 'deleteGame')
			const result = await deleteGameFunction({ gameId })
			return result.data
		},
		onSuccess: () => {
			// Invalidate the games query to refresh the dashboard
			queryClient.invalidateQueries({ queryKey: ['getGamesByUser'] })
			toast({
				title: 'Game deleted',
				description:
					'The game and all related data have been permanently deleted.',
				variant: 'default',
			})
			setIsDeleteDialogOpen(false)
		},
		onError: (error: any) => {
			console.error('Failed to delete game:', error)
			toast({
				title: 'Failed to delete game',
				description:
					error.message || 'An error occurred while deleting the game.',
				variant: 'destructive',
			})
		},
	})

	const handleDeleteGame = () => {
		deleteGameMutation.mutate(game.id)
	}

	const handleEditPrizes = () => {
		const existingPrizes = []
		if (game.prizes && Array.isArray(game.prizes) && game.prizes.length > 0) {
			existingPrizes.push(...game.prizes)
		}
		if (existingPrizes.length === 0) {
			existingPrizes.push({
				placement: '1st Place',
				prize: '',
			})
		}
		onEditPrizes(game.id, existingPrizes)
	}

	const handlePublicToggle = async (newValue: boolean | 'indeterminate') => {
		const isPublicValue = newValue === true
		console.log(
			'Checkbox changed:',
			isPublicValue,
			'Game ID:',
			game.id,
			'Current isPublic:',
			isPublic
		)

		// Update UI immediately for better UX
		setIsPublic(isPublicValue)

		try {
			const { getFunctions, httpsCallable } = await import('firebase/functions')
			const functions = getFunctions()
			const updateGamePublicStatus = httpsCallable(
				functions,
				'updateGamePublicStatus'
			)

			console.log('Calling updateGamePublicStatus...')
			const result = await updateGamePublicStatus({
				gameId: game.id,
				isPublic: isPublicValue,
			})
			console.log('Update result:', result)

			// Success - state is already updated
		} catch (error) {
			console.error('Failed to update game public status:', error)
			// Revert the UI state on error
			setIsPublic(!isPublicValue)
		}
	}

	return (
		<Card className='hover:shadow-xl hover:scale-[1.02] transition-all duration-200 border-2'>
			<CardHeader className='p-4 px-4 pb-2 mb-2 bg-accent/50 rounded-md rounded-b-none'>
				<div className='flex items-center flex-col '>
					<CardTitle
						title={game.companyName}
						className='text-xl font-bold line-clamp-2 text-foreground mb-2'
					>
						{game.gameTitle || game.companyName}
					</CardTitle>
					<Badge
						title={game.industry}
						className='font-semibold whitespace-nowrap block truncate text-ellipsis overflow-hidden mb-2'
					>
						{game.industry}
					</Badge>
				</div>
			</CardHeader>

			<CardContent className='space-y-4 px-4'>
				{/* Game Details */}
				<div className='space-y-2 text-sm text-foreground'>
					{/* Website/Company */}
					<div className='flex items-center gap-2'>
						<Building className='h-4 w-4 text-primary' />
						<span className='truncate'>
							{isWebsite(game.companyName)
								? formatWebsite(game.companyName)
								: game.companyName}
						</span>
					</div>

					<div className='flex items-center gap-2'>
						<Calendar className='h-4 w-4' />
						Created {new Date(game.createdAt).toLocaleDateString()}
					</div>
					{game.modifiedAt &&
						new Date(game.modifiedAt).getTime() !==
							new Date(game.createdAt).getTime() && (
							<div className='flex items-center gap-2'>
								<Calendar className='h-4 w-4' />
								Modified {new Date(game.modifiedAt).toLocaleDateString()}
							</div>
						)}

					<div className='flex items-center gap-2'>
						<GalleryVerticalEnd className='h-4 w-4' />
						{questionsLoading ? (
							<span className='text-muted-foreground'>
								Loading questions...
							</span>
						) : questionsError ? (
							<span className='text-destructive text-xs'>
								Error loading questions
							</span>
						) : actualQuestionCount !== undefined ? (
							<>
								{actualQuestionCount} questions • {game.difficulty} difficulty
							</>
						) : (
							<>
								{game.questionCount} questions • {game.difficulty} difficulty
							</>
						)}
					</div>
					{playCountLoading && (
						<div className='flex items-center gap-2'>
							<BarChart3 className='h-4 w-4' />
							<span className='text-muted-foreground'>Loading plays...</span>
						</div>
					)}
					{playCountError && (
						<div className='flex items-center gap-2'>
							<BarChart3 className='h-4 w-4 text-destructive' />
							<span className='text-destructive text-xs'>
								Error loading plays
							</span>
						</div>
					)}
					{playCount !== undefined && !playCountLoading && !playCountError && (
						<div className='flex items-center gap-2'>
							<BarChart3 className='h-4 w-4' />
							{playCount} {playCount === 1 ? 'play' : 'plays'}
						</div>
					)}

					{/* Prizes if configured */}
					{game.prizes && Array.isArray(game.prizes) && (
						<div className='flex gap-2 items-start'>
							{game.prizes.length > 0 && <Gift className='h-4 w-4 mt-0.5' />}
							<div className='flex flex-wrap gap-1 mr-2'>
								{game.prizes.length > 0 &&
									game.prizes.map((prize, index) => (
										<span key={index}>
											<strong>{prize.placement}</strong>: {prize.prize}
											{index !== game.prizes!.length - 1 && <span> • </span>}
										</span>
									))}
							</div>
						</div>
					)}

					{/* Question Categories */}
					{game.categories.length > 0 && (
						<div className='flex gap-1 mt-2 items-start'>
							<Target className='h-4 w-4 text-primary' />
							<div className='flex flex-wrap gap-1'>
								{game.categories.map((category, index) => (
									<Badge key={index} variant='secondary' className='text-xs'>
										{category}
									</Badge>
								))}
							</div>
						</div>
					)}
				</div>

				{/* Action Buttons */}
				<div className='space-y-3'>
					{/* Management Actions */}

					<div className='grid grid-cols-2 gap-2'>
						{/* Public/Private Toggle */}
						<div className='flex items-center justify-center border-primary border px-4 rounded-lg bg-background'>
							<Checkbox
								id={`public-toggle-${game.id}`}
								checked={isPublic}
								className='mr-2'
								onCheckedChange={handlePublicToggle}
							/>
							<label
								htmlFor={`public-toggle-${game.id}`}
								className='text-sm font-medium cursor-pointer flex-1'
							>
								Public
							</label>
							{/* <span className='text-xs text-muted-foreground'>
								{isPublic ? 'Public' : 'Private'}
							</span> */}
						</div>
						<Button
							variant='outline'
							size='sm'
							onClick={handleEditPrizes}
							data-testid={`button-edit-prizes-${game.id}`}
							aria-label={`Edit prizes for ${game.companyName}`}
						>
							{game.prizes &&
							Array.isArray(game.prizes) &&
							game.prizes.length > 0 ? (
								<Edit3 className='mr-1 h-4 w-4' aria-hidden='true' />
							) : (
								<Plus className='mr-1 h-4 w-4' aria-hidden='true' />
							)}
							Prizes
						</Button>
					</div>
					<div className='grid grid-cols-2 gap-2'>
						<Button
							variant='outline'
							className='w-full'
							size='sm'
							onClick={() => setLocation(`/edit-questions/${game.id}`)}
							data-testid={`button-edit-questions-${game.id}`}
							aria-label={`Edit questions for ${game.companyName}`}
						>
							<Edit3 className='mr-1 h-4 w-4' aria-hidden='true' />
							Questions
						</Button>
						<Button
							variant='outline'
							className='w-full'
							size='sm'
							onClick={() => setLocation(`/game/${game.id}`)}
							data-testid={`button-play-game-${game.id}`}
							aria-label={`Play ${game.companyName} game`}
						>
							<Play className='mr-2 h-4 w-4' aria-hidden='true' />
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
						<QRCodeModal gameId={game.id} gameTitle={game.companyName} />
						<ShareEmbedModal gameId={game.id} gameTitle={game.companyName} />
					</div>

					{/* Delete Action */}
					<div className='grid grid-cols-2 gap-2'>
						<AlertDialog
							open={isDeleteDialogOpen}
							onOpenChange={setIsDeleteDialogOpen}
						>
							<AlertDialogTrigger asChild>
								<Button
									variant='destructive'
									className='w-full'
									size='sm'
									disabled={deleteGameMutation.isPending}
									data-testid={`button-delete-game-${game.id}`}
									aria-label={`Delete ${game.companyName} game`}
								>
									{deleteGameMutation.isPending ? (
										<>
											<div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
											Deleting...
										</>
									) : (
										<>
											<Trash2 className='mr-1 h-4 w-4' />
											Delete Game
										</>
									)}
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
									<AlertDialogDescription className='text-foreground'>
										This action cannot be undone. This will permanently delete
										the game{' '}
										<strong>"{game.gameTitle || game.companyName}"</strong> and
										all related data including:
										<ul className='mt-2 ml-4 list-disc space-y-1'>
											<li>All questions and answers</li>
											<li>All player submissions and scores</li>
											<li>Leaderboard data</li>
											<li>Any associated analytics</li>
										</ul>
										<p className='mt-2 font-semibold text-destructive'>
											All data will be permanently lost and cannot be recovered.
										</p>
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel disabled={deleteGameMutation.isPending}>
										Cancel
									</AlertDialogCancel>
									<AlertDialogAction
										onClick={handleDeleteGame}
										disabled={deleteGameMutation.isPending}
										className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
									>
										{deleteGameMutation.isPending
											? 'Deleting...'
											: 'Delete Permanently'}
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
