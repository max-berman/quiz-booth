import React from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CircleUserRound } from 'lucide-react'

interface SimpleSidebarProps {
	isOpen: boolean
	onClose: () => void
	children: React.ReactNode
	side?: 'left' | 'right'
	title?: string
}

export function SimpleSidebar({
	isOpen,
	onClose,
	children,
	side = 'right',
	title,
}: SimpleSidebarProps) {
	React.useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = 'unset'
		}

		return () => {
			document.body.style.overflow = 'unset'
		}
	}, [isOpen])

	if (!isOpen) return null

	return (
		<>
			{/* Backdrop - simple clickable overlay */}

			<div className='fixed inset-0 bg-black/50 z-40' onClick={onClose} />

			{/* Sidebar */}
			<div
				className={cn(
					'fixed top-0 z-50 h-full w-80  border-l bg-background border-primary',
					side === 'left' ? 'left-0 border-r' : 'right-0 border-l'
				)}
			>
				{/* Close button */}
				<div className='flex justify-between items-center p-2 border-b bg-card border-primary'>
					<div className='flex w-3/4 text-center mr-2'>
						<CircleUserRound className='!h-6 !w-6 mx-2' />
						<strong>{title}</strong>
					</div>
					<Button
						variant='ghost'
						className='mr-2'
						size='icon'
						onClick={onClose}
					>
						<X className='!h-6 !w-6' />
						<span className='sr-only'>Close sidebar</span>
					</Button>
				</div>

				{/* Content */}
				<div className='p-4'>{children}</div>
			</div>
		</>
	)
}
