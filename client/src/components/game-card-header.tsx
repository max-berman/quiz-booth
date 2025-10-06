// Common component for game card headers to eliminate duplication

import { CardHeader, CardTitle, Badge } from '@/lib/ui-imports-basic'
import type { Game } from '@shared/firebase-types'

interface GameCardHeaderProps {
	game: Game
	className?: string
	showBackground?: boolean
}

export function GameCardHeader({
	game,
	className = '',
	showBackground = true,
}: GameCardHeaderProps) {
	return (
		<CardHeader
			className={`p-4 px-4 pb-2 mb-2 ${
				showBackground ? 'bg-accent/50 rounded-md rounded-b-none' : ''
			} ${className}`}
		>
			<div className='flex items-center flex-col'>
				<CardTitle
					title={game.gameTitle || game.companyName}
					className='text-xl font-bold line-clamp-2 text-foreground mb-2 text-center'
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
	)
}
