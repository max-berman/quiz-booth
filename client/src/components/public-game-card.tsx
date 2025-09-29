import { Link } from 'wouter'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Badge,
} from '@/lib/ui-imports-basic'
import { Building, Calendar, Gift, Play, Target } from 'lucide-react'
import type { Game } from '@shared/firebase-types'

interface PublicGameCardProps {
	game: Game
}

export function PublicGameCard({ game }: PublicGameCardProps) {
	// Helper function to check if company name is a website
	const isWebsite = (text: string): boolean => {
		if (!text.includes('.')) return false
		if (text.startsWith('http://') || text.startsWith('https://')) return true

		const commonTLDs = [
			'.com',
			'.org',
			'.net',
			'.io',
			'.co',
			'.dev',
			'.app',
			'.tech',
			'.ai',
		]
		return commonTLDs.some((tld) => {
			const index = text.indexOf(tld)
			if (index === -1) return false
			const afterTLD = text.substring(index + tld.length)
			return (
				afterTLD.length === 0 ||
				afterTLD.startsWith('/') ||
				afterTLD.startsWith('?') ||
				afterTLD.startsWith('#')
			)
		})
	}

	// Format website for display
	const formatWebsite = (website: string): string => {
		try {
			const url = new URL(
				website.startsWith('http') ? website : `https://${website}`
			)
			return url.hostname
		} catch {
			return website
		}
	}

	return (
		<Card className='hover:shadow-lg hover:scale-[1.02] transition-all duration-200 border-2 h-full flex flex-col'>
			<CardHeader className='pb-3 px-4 pt-4'>
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
			<CardContent className='space-y-3 px-4 pb-4 flex-1'>
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

					{/* Created Date */}
					<div className='flex items-center gap-2'>
						<Calendar className='h-4 w-4 text-primary' />
						<span>Created {new Date(game.createdAt).toLocaleDateString()}</span>
					</div>

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
					{game.prizes && game.prizes.length > 0 && (
						<div className='flex items-start gap-2'>
							<Gift className='h-4 w-4 text-primary mt-0.5 flex-shrink-0' />
							<div className='text-xs'>
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
					)}
				</div>

				{/* Play Button */}
				<div className='pt-2 mt-auto'>
					<Link href={`/game/${game.id}`}>
						<button className='w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors'>
							<Play className='h-4 w-4' />
							Play Game
						</button>
					</Link>
				</div>
			</CardContent>
		</Card>
	)
}
