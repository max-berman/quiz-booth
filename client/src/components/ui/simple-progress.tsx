'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SimpleProgressProps {
	value: number
	className?: string
}

const SimpleProgress = React.forwardRef<HTMLDivElement, SimpleProgressProps>(
	({ className, value, ...props }, ref) => {
		const clampedValue = Math.max(0, Math.min(100, value || 0))

		return (
			<div
				ref={ref}
				className={cn(
					'relative h-4 w-full overflow-hidden rounded-full border border-primary bg-background',
					className
				)}
				{...props}
			>
				<div
					className='h-full bg-primary transition-all duration-300 ease-in-out'
					style={{ width: `${clampedValue}%` }}
				/>
			</div>
		)
	}
)
SimpleProgress.displayName = 'SimpleProgress'

export { SimpleProgress }
