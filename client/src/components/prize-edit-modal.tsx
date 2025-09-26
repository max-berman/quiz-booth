import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { logger } from '@/lib/logger'
import {
	Button,
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	Input,
	Label,
} from '@/lib/ui-imports'
import { Plus, Save, X } from 'lucide-react'
import { useFirebaseFunctions } from '@/hooks/use-firebase-functions'

interface Prize {
	placement: string
	prize: string
}

interface PrizeEditModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	gameId: string | null
	initialPrizes?: Prize[]
	onPrizesUpdated?: () => void
}

export function PrizeEditModal({
	open,
	onOpenChange,
	gameId,
	initialPrizes = [{ placement: '1st Place', prize: '' }],
	onPrizesUpdated,
}: PrizeEditModalProps) {
	const { user } = useAuth()
	const { toast } = useToast()
	const queryClient = useQueryClient()
	const [prizes, setPrizes] = useState<Prize[]>(initialPrizes)
	const { updateGamePrizes } = useFirebaseFunctions()

	// Reset prizes when initialPrizes changes (when opening modal for different game)
	useEffect(() => {
		setPrizes(initialPrizes)
	}, [initialPrizes])

	const updatePrizesMutation = useMutation({
		mutationFn: async (updatedPrizes: Prize[]) => {
			if (!gameId) throw new Error('Game ID is required')

			// Convert the prize array to the flexible object format expected by the Firebase Function
			const prizesObject = updatedPrizes.reduce((acc, prize) => {
				if (prize.placement.trim() && prize.prize.trim()) {
					// Use the placement as the key (normalized)
					const key = prize.placement.toLowerCase().replace(/\s+/g, '_')
					acc[key] = prize.prize
				}
				return acc
			}, {} as Record<string, string>)

			const result = await updateGamePrizes({ gameId, prizes: prizesObject })
			return result.data
		},
		onSuccess: () => {
			// Invalidate all relevant queries to refresh the data
			queryClient.invalidateQueries({ queryKey: ['getGamesByUser'] })
			queryClient.invalidateQueries({ queryKey: ['getGamesByUser', user?.uid] })
			if (gameId) {
				queryClient.invalidateQueries({ queryKey: [`game-${gameId}`] })
			}
			toast({
				title: 'Prizes updated',
				description: 'Prize information has been saved successfully.',
			})
			onPrizesUpdated?.()
			onOpenChange(false)
		},
		onError: (error: Error) => {
			toast({
				title: 'Failed to update prizes',
				description: error.message || 'Please try again.',
				variant: 'destructive',
			})
		},
	})

	const handleSavePrizes = () => {
		if (!gameId) return

		// Filter out empty prizes
		const validPrizes = prizes.filter(
			(p) => p.placement.trim() && p.prize.trim()
		)
		updatePrizesMutation.mutate(validPrizes)
	}

	const addPrize = () => {
		setPrizes([...prizes, { placement: '', prize: '' }])
	}

	const removePrize = (index: number) => {
		if (prizes.length > 1) {
			setPrizes(prizes.filter((_, i) => i !== index))
		}
	}

	const updatePrize = (index: number, field: keyof Prize, value: string) => {
		const updatedPrizes = [...prizes]
		updatedPrizes[index][field] = value
		setPrizes(updatedPrizes)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-w-md'>
				<DialogHeader>
					<DialogTitle>Edit Prize Information</DialogTitle>
				</DialogHeader>
				<div className='space-y-4'>
					<div className='space-y-3'>
						{prizes.map((prize, index) => (
							<div key={index} className='flex gap-2 items-end'>
								<div className='flex-1'>
									<Label htmlFor={`placement-${index}`} className='text-xs'>
										Placement
									</Label>
									<Input
										id={`placement-${index}`}
										placeholder='e.g., 1st Place'
										value={prize.placement}
										onChange={(e) =>
											updatePrize(index, 'placement', e.target.value)
										}
										className='h-8 text-sm'
									/>
								</div>
								<div className='flex-1'>
									<Label htmlFor={`prize-${index}`} className='text-xs'>
										Prize
									</Label>
									<Input
										id={`prize-${index}`}
										placeholder='e.g., $100 Gift Card'
										value={prize.prize}
										onChange={(e) =>
											updatePrize(index, 'prize', e.target.value)
										}
										className='h-8 text-sm'
									/>
								</div>
								{prizes.length > 1 && (
									<Button
										type='button'
										variant='outline'
										size='sm'
										onClick={() => removePrize(index)}
										className='h-8 w-8 p-0'
										aria-label='Remove prize'
									>
										<X className='h-3 w-3' />
									</Button>
								)}
							</div>
						))}
					</div>

					<div className='flex gap-2'>
						<Button
							type='button'
							variant='outline'
							size='sm'
							onClick={addPrize}
							className='flex-1'
						>
							<Plus className='h-3 w-3 mr-1' />
							Add Prize
						</Button>
					</div>

					<div className='flex gap-2 pt-2'>
						<Button
							onClick={handleSavePrizes}
							disabled={updatePrizesMutation.isPending}
							className='flex-1'
						>
							<Save className='h-4 w-4 mr-2' />
							{updatePrizesMutation.isPending ? 'Saving...' : 'Save Prizes'}
						</Button>
						<Button
							variant='outline'
							onClick={() => onOpenChange(false)}
							disabled={updatePrizesMutation.isPending}
						>
							Cancel
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
