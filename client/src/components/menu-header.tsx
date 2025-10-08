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
								<Home className=' h-4 w-4' />
								Home
							</MenuLink>
						)} */}

						{/* Quiz Games - visible to all users */}
						<MenuLink href='/quiz-games' data-testid='button-quiz-games'>
							<Gamepad2 className=' h-4 w-4' />
							Quiz Games
						</MenuLink>

						{/* About page */}
						<MenuLink href='/about' data-testid='button-about'>
							<Info className=' h-4 w-4' />
							About
						</MenuLink>

						{/* FAQ page */}
						<MenuLink href='/faq' data-testid='button-faq'>
							<HelpCircle className=' h-4 w-4' />
							FAQ
						</MenuLink>

						{/* Pricing page */}
						<MenuLink href='/pricing' data-testid='button-pricing'>
							<DollarSign className=' h-4 w-4' />
							Pricing
						</MenuLink>

						{/* Contact page */}
						<MenuLink href='/contact' data-testid='button-contact'>
							<Mail className=' h-4 w-4' />
							Contact
						</MenuLink>

						{/* Dashboard for authenticated users */}
						{isAuthenticated && (
							<>
								<MenuLink href='/dashboard' data-testid='button-dashboard'>
									<BarChart3 className=' h-4 w-4' />
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
									<LogOut className=' h-4 w-4' />
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
								<LogIn className=' h-4 w-4' />
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
						<Button
							variant='ghost'
							className='w-full justify-start'
							onClick={() => {
								setLocation('/')
								setIsSidebarOpen(false)
							}}
						>
							<Home className=' h-4 w-4' />
							Home
						</Button>
						<Button
							variant='ghost'
							className='w-full justify-start'
							onClick={() => {
								setLocation('/quiz-games')
								setIsSidebarOpen(false)
							}}
						>
							<Gamepad2 className=' h-4 w-4' />
							Quiz Games
						</Button>
						<Button
							variant='ghost'
							className='w-full justify-start'
							onClick={() => {
								setLocation('/about')
								setIsSidebarOpen(false)
							}}
						>
							<Info className=' h-4 w-4' />
							About
						</Button>
						<Button
							variant='ghost'
							className='w-full justify-start'
							onClick={() => {
								setLocation('/faq')
								setIsSidebarOpen(false)
							}}
						>
							<HelpCircle className=' h-4 w-4' />
							FAQ
						</Button>
						<Button
							variant='ghost'
							className='w-full justify-start'
							onClick={() => {
								setLocation('/pricing')
								setIsSidebarOpen(false)
							}}
						>
							<DollarSign className=' h-4 w-4' />
							Pricing
						</Button>
						<Button
							variant='ghost'
							className='w-full justify-start'
							onClick={() => {
								setLocation('/contact')
								setIsSidebarOpen(false)
							}}
						>
							<Mail className=' h-4 w-4' />
							Contact
						</Button>
						{isAuthenticated && (
							<Button
								variant='ghost'
								className='w-full justify-start'
								onClick={() => {
									setLocation('/dashboard')
									setIsSidebarOpen(false)
								}}
							>
								<BarChart3 className=' h-4 w-4' />
								Dashboard
							</Button>
						)}
						{isAuthenticated ? (
							<Button
								variant='outline'
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
								variant='outline'
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
