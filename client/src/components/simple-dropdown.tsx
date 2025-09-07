import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface SimpleDropdownProps {
	trigger: React.ReactNode | ((isOpen: boolean) => React.ReactNode)
	children: React.ReactNode
	align?: 'start' | 'center' | 'end'
}

export function SimpleDropdown({
	trigger,
	children,
	align = 'end',
}: SimpleDropdownProps) {
	const [isOpen, setIsOpen] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false)
			}
		}

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside)
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [isOpen])

	const alignmentClasses = {
		start: 'left-0',
		center: 'left-1/2 transform -translate-x-1/2',
		end: 'right-0',
	}

	return (
		<div className='relative inline-block' ref={dropdownRef}>
			<div onClick={() => setIsOpen(!isOpen)}>
				{typeof trigger === 'function' ? trigger(isOpen) : trigger}
			</div>

			{isOpen && (
				<div
					className={cn(
						'absolute z-50 mt-1 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
						alignmentClasses[align]
					)}
				>
					{children}
				</div>
			)}
		</div>
	)
}

interface SimpleDropdownItemProps {
	children: React.ReactNode
	onClick?: () => void
	className?: string
}

export function SimpleDropdownItem({
	children,
	onClick,
	className,
}: SimpleDropdownItemProps) {
	return (
		<div
			onClick={onClick}
			className={cn(
				'relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground',
				className
			)}
		>
			{children}
		</div>
	)
}

export function SimpleDropdownSeparator() {
	return <div className='-mx-1 my-1 h-px bg-muted' />
}
