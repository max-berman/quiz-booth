import { useLocation } from 'wouter'
import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Badge,
} from '@/lib/ui-imports'
import {
	Edit3,
	BarChart3,
	Calendar,
	Building,
	Database,
	Gift,
	Wrench,
	Play,
	Plus,
} from 'lucide-react'
import { QRCodeModal } from '@/components/qr-code-modal'
import { ShareEmbedModal } from '@/components/share-embed-modal'
import type { Game } from '@shared/firebase-types'
import { useQuery } from '@tanstack/react-query'

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

	// Fetch actual question count for this game
	const { data: actualQuestionCount } = useQuery<number>({
		queryKey: ['/api/games', game.id, 'questions-count'],
		queryFn: async () => {
			const response = await fetch(`/api/games/${game.id}/questions`)
			const questions = await response.json()
			return questions.length
		},
		enabled: !!game.id,
		staleTime: 5 * 60 * 1000, // 5 minutes
	})

	// Fetch play count for this game
	const { data: playCount } = useQuery<number>({
		queryKey: ['/api/games', game.id, 'play-count'],
		queryFn: async () => {
			const response = await fetch(`/api/games/${game.id}/play-count`)
			const data = await response.json()
			return data.count
		},
		enabled: !!game.id,
		staleTime: 2 * 60 * 1000, // 2 minutes
	})

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

	return (
		<Card className='hover:shadow-xl hover:scale-[1.02] transition-all duration-200 border-2'>
			<CardHeader className='pb-3 px-4 pt-2'>
				<div className='flex items-center flex-col '>
					<CardTitle
						title={game.companyName}
						className='text-xl font-bold line-clamp-2 text-foreground mb-1'
					>
						{game.gameTitle || game.companyName}
					</CardTitle>
					<Badge
						title={game.industry}
						className='font-semibold whitespace-nowrap block truncate text-ellipsis overflow-hidden '
					>
						{game.industry}
					</Badge>
				</div>
			</CardHeader>
			<CardContent className='space-y-4 px-4'>
				{/* Game Details */}
				<div className='space-y-2 text-sm text-foreground'>
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
						<Building className='h-4 w-4' />
						{actualQuestionCount !== undefined
							? actualQuestionCount
							: game.questionCount}{' '}
						questions • {game.difficulty} difficulty
					</div>
					{playCount !== undefined && (
						<div className='flex items-center gap-2'>
							<BarChart3 className='h-4 w-4' />
							{playCount} {playCount === 1 ? 'play' : 'plays'}
						</div>
					)}
					{game.categories.length > 0 && (
						<div className='flex flex-wrap gap-1 mt-2'>
							{game.categories.map((category, index) => (
								<Badge key={index} variant='secondary' className='text-xs'>
									{category}
								</Badge>
							))}
						</div>
					)}
				</div>

				{/* Action Buttons */}
				<div className='space-y-2 pt-2'>
					{/* Management Actions */}
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
				</div>

				{/* Prizes if configured */}
				<div className='flex border-dotted border-t border-primary items-end pt-4'>
					{/* Remove commented prize label */}
					{game.prizes && Array.isArray(game.prizes) ? (
						<ul className='text-xs flex flex-col flex-wrap w-2/3 p-1  mr-2'>
							{game.prizes.length > 0 &&
								game.prizes.map((prize, index) => (
									<li key={index} className='mr-2'>
										<strong>{prize.placement}</strong>: {prize.prize}
									</li>
								))}
						</ul>
					) : (
						<div className='w-2/3' />
					)}
					<Button
						variant='outline'
						className='w-1/3 '
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
			</CardContent>
		</Card>
	)
}
