import React from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SimpleSidebarProps {
	isOpen: boolean
	onClose: () => void
	children: React.ReactNode
	side?: 'left' | 'right'
}

export function SimpleSidebar({
	isOpen,
	onClose,
	children,
	side = 'right',
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
					'fixed top-0 z-50 h-full w-80 bg-white border-l',
					side === 'left' ? 'left-0 border-r' : 'right-0 border-l'
				)}
			>
				{/* Close button */}
				<div className='flex justify-end p-4 border-b'>
					<Button
						variant='ghost'
						size='icon'
						onClick={onClose}
						className='h-8 w-8'
					>
						<X className='h-4 w-4' />
						<span className='sr-only'>Close sidebar</span>
					</Button>
				</div>

				{/* Content */}
				<div className='p-4'>{children}</div>
			</div>
		</>
	)
}
