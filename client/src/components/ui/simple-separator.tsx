'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SimpleSeparatorProps {
	className?: string
	orientation?: 'horizontal' | 'vertical'
	decorative?: boolean
}

const SimpleSeparator = React.forwardRef<HTMLDivElement, SimpleSeparatorProps>(
	(
		{ className, orientation = 'horizontal', decorative = true, ...props },
		ref
	) => (
		<div
			ref={ref}
			className={cn(
				'shrink-0 bg-primary',
				orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
				className
			)}
			{...props}
		/>
	)
)
SimpleSeparator.displayName = 'SimpleSeparator'

export { SimpleSeparator }
