import { useState } from 'react'
import { useLocation } from 'wouter'
import { Button, Card, CardContent } from '@/lib/ui-imports-basic'
import {
	Edit3,
	Database,
	Play,
	Plus,
	Trash2,
	GalleryVerticalEnd,
	Palette,
	BarChart3,
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
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { GameCardHeader } from './game-card-header'
import { GameDetails } from './game-details'
import { getExistingPrizes } from '@/lib/game-utils'
import app from '@/lib/firebase'

interface GameCardEnhancedProps {
	game: Game
	onEditPrizes: (
		gameId: string,
		prizes: { placement: string; prize: string }[]
	) => void
}

export function GameCardDashboard({
	game,
	onEditPrizes,
}: GameCardEnhancedProps) {
	const [, setLocation] = useLocation()
	const [isPublic, setIsPublic] = useState(game.isPublic === true)
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
	const { toast } = useToast()
	const queryClient = useQueryClient()

	// Delete game mutation
	const deleteGameMutation = useMutation({
		mutationFn: async (gameId: string) => {
			const { getFunctions, httpsCallable } = await import('firebase/functions')
			const functions = getFunctions(app)
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
		const existingPrizes = getExistingPrizes(game)
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
			const functions = getFunctions(app)
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
		<>
			<Card className='hover:shadow-xl hover:scale-[1.02] transition-all duration-200 border-2'>
				<GameCardHeader game={game} />
				<CardContent className='space-y-4 px-4'>
					{/* Game Details */}
					<GameDetails
						game={game}
						showPlayCount={false}
						showModifiedDate={true}
						showQuestionCount={true}
					/>

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

						{/* Customization Action */}
						<div className='grid grid-cols-2 gap-2'>
							<Button
								variant='outline'
								className='w-full'
								size='sm'
								onClick={() => setLocation(`/game-customization/${game.id}`)}
								data-testid={`button-customize-game-${game.id}`}
								aria-label={`Customize appearance for ${game.companyName}`}
							>
								<Palette className='mr-1 h-4 w-4' />
								Customize
							</Button>

							{/* Delete Action */}

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
										<AlertDialogTitle>
											Are you absolutely sure?
										</AlertDialogTitle>
										<AlertDialogDescription className='text-foreground'>
											This action cannot be undone. This will permanently delete
											the game{' '}
											<strong>"{game.gameTitle || game.companyName}"</strong>{' '}
											and all related data including:
											<ul className='mt-2 ml-4 list-disc space-y-1'>
												<li>All questions and answers</li>
												<li>All player submissions and scores</li>
												<li>Leaderboard data</li>
												<li>Any associated analytics</li>
											</ul>
											<p className='mt-2 font-semibold text-destructive'>
												All data will be permanently lost and cannot be
												recovered.
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

						{/* Sharing Actions */}
						<div className='grid grid-cols-2 gap-2'>
							<QRCodeModal gameId={game.id} gameTitle={game.companyName} />
							<ShareEmbedModal gameId={game.id} gameTitle={game.companyName} />
						</div>
					</div>
				</CardContent>
			</Card>
		</>
	)
}
