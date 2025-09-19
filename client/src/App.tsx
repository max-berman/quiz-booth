import { Switch, Route, useLocation } from 'wouter'
import { queryClient } from './lib/queryClient'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { CreatorHeader } from '@/components/menu-header'
import { Footer } from '@/components/footer'
import { AuthProvider } from '@/contexts/auth-context'
import Home from '@/pages/home'
import Setup from '@/pages/setup'
import GamePage from '@/pages/game'
import Results from '@/pages/results'
import Leaderboard from '@/pages/leaderboard'
import Submissions from '@/pages/submissions'
import EditQuestions from '@/pages/edit-questions'
import Dashboard from '@/pages/dashboard'
import SignIn from '@/pages/auth/sign-in'
import CompleteSignIn from '@/pages/auth/complete'
import GameCreated from '@/pages/game-created'
import NotFound from '@/pages/not-found'

function Router() {
	return (
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
	)
}

function App() {
	const [location] = useLocation()

	// Don't show footer on actual game play pages, but show on game creation/management pages
	const isGamePlayPage =
		location.startsWith('/game/') && !location.startsWith('/game-created')
	const showFooter = !isGamePlayPage

	return (
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
	)
}

export default App
