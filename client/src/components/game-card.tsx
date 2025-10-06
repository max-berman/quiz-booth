import { useLocation } from 'wouter'
import { Button, Card, CardContent } from '@/lib/ui-imports-basic'
import { Edit3, BarChart3, Database, Play, Plus } from 'lucide-react'
import { QRCodeModal } from '@/components/qr-code-modal'
import { ShareEmbedModal } from '@/components/share-embed-modal'
import type { Game } from '@shared/firebase-types'
import { GameCardHeader } from './game-card-header'
import { GameDetails } from './game-details'
import { getExistingPrizes } from '@/lib/game-utils'

interface GameCardProps {
	game: Game
	onEditPrizes: (
		gameId: string,
		prizes: { placement: string; prize: string }[]
	) => void
}

export function GameCard({ game, onEditPrizes }: GameCardProps) {
	const [, setLocation] = useLocation()

	const handleEditPrizes = () => {
		const existingPrizes = getExistingPrizes(game)
		onEditPrizes(game.id, existingPrizes)
	}

	return (
		<Card className='hover:shadow-xl hover:scale-[1.02] transition-all duration-200 border-2'>
			<GameCardHeader
				game={game}
				showBackground={false}
				className='pb-3 px-4 pt-2'
			/>
			<CardContent className='space-y-4 px-4'>
				{/* Game Details */}
				<GameDetails
					game={game}
					showPlayCount={false}
					showModifiedDate={true}
					showQuestionCount={true}
				/>

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
