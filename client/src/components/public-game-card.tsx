import { Link } from 'wouter'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Badge,
	Button,
} from '@/lib/ui-imports-basic'
import { Building, Calendar, Gift, Play, Target, Trophy } from 'lucide-react'
import type { Game } from '@shared/firebase-types'
import { isWebsite, formatWebsite } from '@/lib/website-utils'

interface PublicGameCardProps {
	game: Game
}

export function PublicGameCard({ game }: PublicGameCardProps) {
	return (
		<Card className='hover:shadow-lg hover:scale-[1.02] transition-all duration-200 border-2 h-full flex flex-col'>
			{/* <CardHeader className='pb-3 px-4 pt-4'> */}
			<CardHeader className='p-4 px-4 pb-2 mb-2 bg-accent/50 rounded-md rounded-b-none'>
				<div className='flex items-center flex-col'>
					<CardTitle
						title={game.gameTitle || game.companyName}
						className='text-lg font-bold line-clamp-2 text-foreground mb-2 text-center'
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
			<CardContent className='space-y-3 px-4 pb-4 flex  flex-col'>
				{/* Game Details */}
				<div className='space-y-2 text-sm text-foreground '>
					{/* Website/Company */}
					<div className='flex items-center gap-2'>
						<Building className='h-4 w-4 text-primary' />
						<span className='truncate'>
							{isWebsite(game.companyName)
								? formatWebsite(game.companyName)
								: game.companyName}
						</span>
					</div>

					{/* Created Date */}
					{/* <div className='flex items-center gap-2'>
						<Calendar className='h-4 w-4 text-primary' />
						<span>Created {new Date(game.createdAt).toLocaleDateString()}</span>
					</div> */}

					{/* Question Categories */}
					{game.categories.length > 0 && (
						<div className='flex items-start gap-2'>
							<Target className='h-4 w-4 text-primary mt-0.5 flex-shrink-0' />
							<div className='flex flex-wrap gap-1'>
								{game.categories.map((category, index) => (
									<Badge key={index} variant='secondary' className='text-xs'>
										{category}
									</Badge>
								))}
							</div>
						</div>
					)}

					{/* Prize Info */}
					{/* {game.prizes && game.prizes.length > 0 && (
						<div className='flex items-start gap-2'>
							<Gift className='h-4 w-4 text-primary mt-0.5 flex-shrink-0' />
							<div className='text-sm'>
								{game.prizes.slice(0, 2).map((prize, index) => (
									<div key={index} className='truncate'>
										<strong>{prize.placement}</strong>: {prize.prize}
									</div>
								))}
								{game.prizes.length > 2 && (
									<div className='text-muted-foreground'>
										+{game.prizes.length - 2} more prizes
									</div>
								)}
							</div>
						</div>
					)} */}

					{/* Prizes if configured */}
					{game.prizes && Array.isArray(game.prizes) && (
						<div className='flex gap-2 items-start'>
							{game.prizes.length > 0 && <Gift className='h-4 w-4 mt-0.5' />}
							<div className='flex flex-wrap gap-1 mr-2 text-primary'>
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
				</div>

				{/* Action Buttons */}
				<div className='pt-2 self-center flex gap-2'>
					{/* <Link href={`/game/${game.id}`}>
						<button className='bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors'>
							<Play className='h-4 w-4' />
							Play Game
						</button>
					</Link> */}
					<Link href={`/game/${game.id}`}>
						<Button className='px-2 py-2'>
							<Play className='h-4 w-4' />
							Play Game
						</Button>
					</Link>

					<Link href={`/leaderboard/${game.id}`}>
						<Button variant='secondary' className='px-2 py-2'>
							<Trophy className='h-4 w-4' />
							Leaderboard
						</Button>
					</Link>
				</div>
			</CardContent>
		</Card>
	)
}
