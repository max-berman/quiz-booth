import React from 'react'
import { useLocation, Link } from 'wouter'
import {
	BarChart3,
	LogOut,
	User,
	Home,
	LogIn,
	ChevronDown,
	Menu,
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { MenuLink } from './menu-link'
import { Button } from '@/components/ui/button'
import {
	SimpleDropdown,
	SimpleDropdownItem,
	SimpleDropdownSeparator,
} from './simple-dropdown'
import { SimpleSidebar } from './simple-sidebar'

export function CreatorHeader() {
	const [location, setLocation] = useLocation()
	const { user, isAuthenticated, signOut } = useAuth()
	const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)
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
		<>
			<div className='bg-card border-b border-primary px-4 py-2'>
				<div className='max-w-7xl mx-auto flex items-center justify-between'>
					<div className='flex items-center gap-4'>
						{/* Show Home button when not on home page */}
						<Link
							href='/'
							data-testid='link-home'
							className='flex  items-center gap-2 text-xl text-foreground hover:text-secondary-foreground'
						>
							<img
								src='/src/assets/images/owl.svg'
								alt='QuizBooth.games'
								className='h-8 w-auto'
							/>
							<span className='hover:scale-[1.02] transition-all'>
								QuizBooth
							</span>
						</Link>
					</div>

					{/* Authentication section - only visible on screens above 1024px */}
					<div className='hidden lg:flex items-center gap-2'>
						{/* {!isHomePage && (
							<MenuLink href='/' data-testid='button-home'>
								<Home className='mr-2 h-4 w-4' />
								Home
							</MenuLink>
						)} */}

						{/* Dashboard for authenticated users */}
						{isAuthenticated && (
							<>
								<MenuLink href='/dashboard' data-testid='button-dashboard'>
									<BarChart3 className='mr-2 h-4 w-4' />
									Dashboard
								</MenuLink>
							</>
						)}
						{isAuthenticated ? (
							// Authenticated user dropdown
							<SimpleDropdown
								trigger={(isOpen) => (
									<Button
										variant='link'
										size='sm'
										className='flex items-center'
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

					{/* Sidebar menu button - only visible on screens below 1024px */}
					<div className='lg:hidden'>
						<Button
							variant='ghost'
							size='icon'
							className='ml-2 '
							onClick={() => setIsSidebarOpen(true)}
						>
							<Menu className='!h-6 !w-6' />
							<span className='sr-only'>Open menu</span>
						</Button>
					</div>
				</div>
			</div>

			{/* Sidebar */}
			<SimpleSidebar
				isOpen={isSidebarOpen}
				onClose={() => setIsSidebarOpen(false)}
				side='right'
			>
				<div className='space-y-4'>
					<h3 className='text-lg font-semibold'>Menu</h3>
					<div className='space-y-2'>
						<Button
							variant='ghost'
							className='w-full justify-start'
							onClick={() => setLocation('/')}
						>
							<Home className='mr-2 h-4 w-4' />
							Home
						</Button>
						{isAuthenticated && (
							<Button
								variant='ghost'
								className='w-full justify-start'
								onClick={() => setLocation('/dashboard')}
							>
								<BarChart3 className='mr-2 h-4 w-4' />
								Dashboard
							</Button>
						)}
						{isAuthenticated ? (
							<Button
								variant='ghost'
								className='w-full justify-start'
								onClick={handleSignOut}
							>
								<LogOut className='mr-2 h-4 w-4' />
								Sign Out
							</Button>
						) : (
							<Button
								variant='ghost'
								className='w-full justify-start'
								onClick={() => setLocation('/auth/sign-in')}
							>
								<LogIn className='mr-2 h-4 w-4' />
								Sign In
							</Button>
						)}
					</div>
				</div>
			</SimpleSidebar>
		</>
	)
}
