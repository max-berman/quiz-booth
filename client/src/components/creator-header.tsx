import { useLocation } from 'wouter'
import { BarChart3, LogOut, User, Home, LogIn, ChevronDown } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { MenuLink } from './menu-link'
import { Button } from '@/components/ui/button'
import {
	SimpleDropdown,
	SimpleDropdownItem,
	SimpleDropdownSeparator,
} from './simple-dropdown'

export function CreatorHeader() {
	const [location, setLocation] = useLocation()
	const { user, isAuthenticated, signOut } = useAuth()
	const isHomePage = location === '/'
	const isGamePage = location.startsWith('/game/')

	// Hide header on game pages, show for authenticated users or non-home pages
	//const shouldShowHeader = !isGamePage && (isAuthenticated || !isHomePage)
	const shouldShowHeader = !isGamePage
	if (!shouldShowHeader) return null

	const handleSignOut = async () => {
		try {
			await signOut()
			setLocation('/')
		} catch (error) {
			console.error('Sign out error:', error)
		}
	}

	return (
		<div className='bg-card px-4 py-2'>
			<div className='max-w-7xl mx-auto flex items-center justify-between'>
				<div className='flex items-center gap-4'>
					{/* Show Home button when not on home page */}
					{!isHomePage && (
						<MenuLink href='/' data-testid='button-home'>
							<Home className='mr-2 h-4 w-4' />
							Home
						</MenuLink>
					)}

					{/* Dashboard for authenticated users */}
					{isAuthenticated && (
						<MenuLink href='/dashboard' data-testid='button-dashboard'>
							<BarChart3 className='mr-2 h-4 w-4' />
							Dashboard
						</MenuLink>
					)}
				</div>

				{/* Authentication section */}
				<div className='flex items-center gap-2'>
					{isAuthenticated ? (
						// Authenticated user dropdown
						<SimpleDropdown
							trigger={(isOpen) => (
								<Button
									variant='link'
									size='sm'
									className='flex items-center gap-1'
									data-testid='user-menu'
								>
									<User className='mr-1 h-4 w-4' />
									{user?.email?.split('@')[0] || 'User'}
									<ChevronDown
										className={`h-4 w-4 transition-transform ${
											isOpen ? 'rotate-180' : ''
										}`}
									/>
								</Button>
							)}
							align='end'
						>
							<SimpleDropdownItem
								onClick={() => setLocation('/dashboard')}
								className='flex items-center'
							>
								<BarChart3 className='mr-2 h-4 w-4' />
								Dashboard
							</SimpleDropdownItem>
							<SimpleDropdownSeparator />
							<SimpleDropdownItem onClick={handleSignOut}>
								<LogOut className='mr-2 h-4 w-4' />
								Sign Out
							</SimpleDropdownItem>
						</SimpleDropdown>
					) : (
						// Sign in button for non-authenticated users
						<MenuLink
							href='/auth/sign-in'
							variant='ghost'
							data-testid='button-sign-in'
						>
							<LogIn className='mr-2 h-4 w-4' />
							Sign In
						</MenuLink>
					)}
				</div>
			</div>
		</div>
	)
}
