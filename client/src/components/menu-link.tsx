import { Link } from 'wouter'
import { ReactNode, AnchorHTMLAttributes } from 'react'

interface MenuLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
	children: ReactNode
	href: string
	className?: string
	variant?: 'default' | 'ghost'
	size?: 'default' | 'sm' | 'lg'
}

export function MenuLink({
	children,
	className = '',
	variant = 'default',
	size = 'sm',
	...props
}: MenuLinkProps) {
	const baseClasses =
		'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background motion-reduce:transition-none motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'

	const variantClasses = {
		default:
			'text-foreground shadow-sm hover:bg-accent hover:scale-[1.01] active:scale-[.99]',
		ghost:
			'text-foreground hover:bg-accent/60 hover:shadow-sm hover:scale-[1.01] active:scale-[.99] transition-all',
	}

	const sizeClasses = {
		default: 'h-10 px-4 py-2',
		sm: 'h-9 px-3',
		lg: 'h-11 px-8',
	}

	const combinedClassName = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`

	return (
		<Link className={combinedClassName} {...props}>
			{children}
		</Link>
	)
}
