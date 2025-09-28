import { Switch, Route, useLocation } from 'wouter'
import { Suspense, lazy } from 'react'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import { queryClient } from './lib/queryClient'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { CreatorHeader } from '@/components/menu-header'
import { Footer } from '@/components/footer'
import { AuthProvider } from '@/contexts/auth-context'
import { LoadingSpinner } from '@/components/loading-spinner'

// Lazy load pages for code splitting
const Home = lazy(() => import('@/pages/home'))
const Setup = lazy(() => import('@/pages/setup'))
const GamePage = lazy(() => import('@/pages/game'))
const Results = lazy(() => import('@/pages/results'))
const Leaderboard = lazy(() => import('@/pages/leaderboard'))
const Submissions = lazy(() => import('@/pages/submissions'))
const EditQuestions = lazy(() => import('@/pages/edit-questions'))
const Dashboard = lazy(() => import('@/pages/dashboard'))
const SignIn = lazy(() => import('@/pages/auth/sign-in'))
const CompleteSignIn = lazy(() => import('@/pages/auth/complete'))
const GameCreated = lazy(() => import('@/pages/game-created'))
const NotFound = lazy(() => import('@/pages/not-found'))

function Router() {
	return (
		<Suspense fallback={<LoadingSpinner />}>
			<Switch>
				<Route path='/' component={Home} />
				<Route path='/setup' component={Setup} />
				<Route path='/game/:id' component={GamePage} />
				<Route path='/results/:id' component={Results} />
				<Route path='/leaderboard/:id?' component={Leaderboard} />
				<Route path='/submissions/:id' component={Submissions} />
				<Route path='/edit-questions/:id' component={EditQuestions} />
				<Route path='/dashboard' component={Dashboard} />
				<Route path='/game-created/:id' component={GameCreated} />
				<Route path='/auth/sign-in' component={SignIn} />
				<Route path='/auth/complete' component={CompleteSignIn} />
				<Route component={NotFound} />
			</Switch>
		</Suspense>
	)
}

function App() {
	const [location] = useLocation()

	// Don't show footer on actual game play pages, but show on game creation/management pages
	const isGamePlayPage =
		location.startsWith('/game/') && !location.startsWith('/game-created')
	const showFooter = !isGamePlayPage

	return (
		<HelmetProvider>
			<QueryClientProvider client={queryClient}>
				<TooltipProvider>
					<AuthProvider>
						<div className='h-screen bg-background flex flex-col'>
							{/* CreatorHeader is intentionally hidden on game pages to maintain immersive gameplay experience */}
							<CreatorHeader />
							<Router />
							{showFooter && <Footer />}
						</div>
						<Toaster />
					</AuthProvider>
				</TooltipProvider>
			</QueryClientProvider>
		</HelmetProvider>
	)
}

export default App
