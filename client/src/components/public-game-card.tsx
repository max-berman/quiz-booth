import { Link } from 'wouter'
import { Card, CardContent, Button } from '@/lib/ui-imports-basic'
import { Play, Trophy } from 'lucide-react'
import type { Game } from '@shared/firebase-types'
import { GameCardHeader } from './game-card-header'
import { GameDetails } from './game-details'

interface PublicGameCardProps {
	game: Game
}

export function PublicGameCard({ game }: PublicGameCardProps) {
	return (
		<Card className='hover:shadow-lg hover:scale-[1.02] transition-all duration-200 border-2 h-full flex flex-col'>
			<GameCardHeader game={game} />

			{game.customization?.customLogoUrl && (
				<div className='p-2 pt-0 flex items-center justify-center'>
					<img
						src={game.customization.customLogoUrl}
						alt='Custom Logo'
						className='h-10 w-auto'
					/>
				</div>
			)}
			<CardContent className='space-y-3 px-4 pb-4 flex flex-col h-full justify-between'>
				<GameDetails
					game={game}
					showPlayCount={true}
					showModifiedDate={false}
				/>

				{/* Action Buttons */}
				<div className='pt-2 self-center flex md:flex-col flex-row items-center justify-center gap-2 w-full md:w-[90%]'>
					<Link href={`/game/${game.id}`} className='w-full'>
						<Button className=' px-2 h-8 w-full py-0'>
							<Play className='h-4 w-4' />
							Play Game
						</Button>
					</Link>

					<Link href={`/leaderboard/${game.id}`} className='w-full'>
						<Button variant='secondary' className='px-2 h-8 w-full py-0 '>
							<Trophy className='h-4 w-4' />
							Leaderboard
						</Button>
					</Link>
				</div>
			</CardContent>
		</Card>
	)
}
