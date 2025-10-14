// Common component for displaying game details to eliminate duplication

import { Badge } from '@/lib/ui-imports-basic'
import {
	Building,
	Calendar,
	Target,
	Gift,
	BarChart3,
	GalleryVerticalEnd,
} from 'lucide-react'
import type { Game } from '@shared/firebase-types'
import { formatCompanyName } from '@/lib/game-utils'
import { formatDate } from '@/lib/date-utils'

interface GameDetailsProps {
	game: Game
	showPlayCount?: boolean
	showQuestionCount?: boolean
	showModifiedDate?: boolean
	showCategories?: boolean
	showPrizes?: boolean
}

export function GameDetails({
	game,
	showPlayCount = false,
	showQuestionCount = false,
	showModifiedDate = false,
	showCategories = true,
	showPrizes = true,
}: GameDetailsProps) {
	const companyInfo = formatCompanyName(game.companyName)

	return (
		<div className='space-y-2 text-sm text-foreground'>
			{/* Company/Website */}
			<div className='flex items-center gap-2'>
				<Building className='h-4 w-4 text-primary' />
				<span className='truncate' title={companyInfo.display}>
					{companyInfo.display}
				</span>
			</div>

			{/* Created Date */}
			<div className='flex items-center gap-2'>
				<Calendar className='h-4 w-4' />
				<span>Created {formatDate(game.createdAt)}</span>
			</div>

			{/* Modified Date */}
			{showModifiedDate &&
				game.modifiedAt &&
				new Date(game.modifiedAt).getTime() !==
					new Date(game.createdAt).getTime() && (
					<div className='flex items-center gap-2'>
						<Calendar className='h-4 w-4' />
						<span>Modified {formatDate(game.modifiedAt)}</span>
					</div>
				)}

			{/* Question Count */}
			{showQuestionCount && (
				<div className='flex items-center gap-2'>
					<GalleryVerticalEnd className='h-4 w-4' />
					<span>
						{game.actualQuestionCount !== undefined ? (
							<>
								<strong>{game.actualQuestionCount}</strong> of{' '}
								<strong>{game.questionCount}</strong> questions generated •{' '}
								{game.difficulty} difficulty
								{game.actualQuestionCount < game.questionCount && (
									<span className='text-amber-600 ml-1 text-xs'>
										(Incomplete)
									</span>
								)}
							</>
						) : (
							<>
								<strong>{game.questionCount}</strong> questions •{' '}
								{game.difficulty} difficulty
							</>
						)}
					</span>
				</div>
			)}

			{/* Categories */}
			{showCategories && game.categories.length > 0 && (
				<div className='flex gap-1 mt-2 items-start'>
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

			{/* Prizes */}
			{showPrizes &&
				game.prizes &&
				Array.isArray(game.prizes) &&
				game.prizes.length > 0 && (
					<div className='flex gap-2 items-start'>
						<Gift className='h-4 w-4 mt-0.5' />
						<div className='flex flex-wrap gap-1 mr-2'>
							{game.prizes.map((prize, index) => (
								<span key={index}>
									<strong>{prize.placement}</strong>: {prize.prize}
									{index !== game.prizes!.length - 1 && <span> • </span>}
								</span>
							))}
						</div>
					</div>
				)}
		</div>
	)
}
