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
	CircleUserRound,
	Gamepad2,
	Info,
	HelpCircle,
	DollarSign,
	Mail,
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

// Menu items configuration
const MENU_ITEMS = [
	{
		href: '/quiz-games',
		label: 'Quiz Games',
		icon: Gamepad2,
		testId: 'button-quiz-games',
		requiresAuth: false,
	},
	{
		href: '/about',
		label: 'About',
		icon: Info,
		testId: 'button-about',
		requiresAuth: false,
	},
	{
		href: '/faq',
		label: 'FAQ',
		icon: HelpCircle,
		testId: 'button-faq',
		requiresAuth: false,
	},
	{
		href: '/pricing',
		label: 'Pricing',
		icon: DollarSign,
		testId: 'button-pricing',
		requiresAuth: false,
	},
	{
		href: '/contact',
		label: 'Contact',
		icon: Mail,
		testId: 'button-contact',
		requiresAuth: false,
	},
	{
		href: '/dashboard',
		label: 'Dashboard',
		icon: BarChart3,
		testId: 'button-dashboard',
		requiresAuth: true,
	},
]

export function CreatorHeader() {
	const [location, setLocation] = useLocation()
	const { user, isAuthenticated, signOut } = useAuth()
	const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)
	const isHomePage = location === '/'
	const isGamePage = location.startsWith('/game/')
	const isLeaderboardPage = location.startsWith('/leaderboard/')

	// Hide header on game pages and leaderboard pages, show for authenticated users or non-home pages
	//const shouldShowHeader = !isGamePage && (isAuthenticated || !isHomePage)
	const shouldShowHeader = !isGamePage && !isLeaderboardPage
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
							className='flex items-center gap-2 text-xl text-foreground hover:text-secondary-foreground'
						>
							<img
								src='/assets/logo_.svg'
								alt='QuizBooth.games logo'
								className='h-8 w-auto'
							/>
							<span className='hover:scale-[1.02] transition-all font-medium'>
								QuizBooth
							</span>
							<span className='text-xs self-end font-medium'>beta</span>
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

						{/* Render menu items from configuration */}
						{MENU_ITEMS.map((item) => {
							// Skip items that require authentication if user is not authenticated
							if (item.requiresAuth && !isAuthenticated) return null

							const IconComponent = item.icon
							return (
								<MenuLink
									key={item.href}
									href={item.href}
									data-testid={item.testId}
								>
									<IconComponent className='h-4 w-4' />
									{item.label}
								</MenuLink>
							)
						})}
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
										<CircleUserRound className=' h-4 w-4' />
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
									<LogOut className='h-4 w-4' />
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
								<LogIn className='h-4 w-4' />
								Sign In
							</MenuLink>
						)}
					</div>

					{/* Sidebar menu button - only visible on screens below 1024px */}
					<div className='lg:hidden'>
						<Button
							variant='ghost'
							size='icon'
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
				title={user?.email?.split('@')[0] || 'User'}
			>
				<div className='space-y-4'>
					<div className='space-y-4'>
						{/* Home button */}
						<Button
							variant='ghost'
							className='w-full justify-start'
							onClick={() => {
								setLocation('/')
								setIsSidebarOpen(false)
							}}
						>
							<Home className='h-4 w-4' />
							Home
						</Button>

						{/* Render menu items from configuration */}
						{MENU_ITEMS.map((item) => {
							// Skip items that require authentication if user is not authenticated
							if (item.requiresAuth && !isAuthenticated) return null

							const IconComponent = item.icon
							return (
								<Button
									key={item.href}
									variant='ghost'
									className='w-full justify-start'
									onClick={() => {
										setLocation(item.href)
										setIsSidebarOpen(false)
									}}
								>
									<IconComponent className=' h-4 w-4' />
									{item.label}
								</Button>
							)
						})}
						{isAuthenticated ? (
							<Button
								variant='ghost'
								className='w-full justify-start'
								onClick={() => {
									handleSignOut()
									setIsSidebarOpen(false)
								}}
							>
								<LogOut className=' h-4 w-4' />
								Sign Out
							</Button>
						) : (
							<Button
								variant='ghost'
								className='w-full justify-start'
								onClick={() => {
									setLocation('/auth/sign-in')
									setIsSidebarOpen(false)
								}}
							>
								<LogIn className=' h-4 w-4' />
								Sign In
							</Button>
						)}
					</div>
				</div>
			</SimpleSidebar>
		</>
	)
}
