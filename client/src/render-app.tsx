/**
 * Shared app rendering logic used by both client and server
 * This separates the app structure from the entry point concerns
 */
import { Suspense, lazy } from 'react'
import { Switch, Route, Router as SSRRouter } from '@/lib/ssr-wouter'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import { queryClient } from './lib/queryClient'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { CreatorHeader } from '@/components/menu-header'
import { Footer } from '@/components/footer'
import { AuthProvider } from '@/contexts/auth-context'
import { LoadingSpinner } from '@/components/loading-spinner'
import ErrorBoundary from '@/components/error-boundary'
import { shouldShowHeader, shouldShowFooter } from '@/config/page-visibility'
import { logoCache } from '@/lib/logo-cache'
import { firebaseAnalytics } from '@/lib/firebase-analytics'
import { useEffect } from 'react'
import type { Location } from 'wouter'

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
const QuizGames = lazy(() => import('@/pages/quiz-games'))
const About = lazy(() => import('@/pages/about'))
const FAQ = lazy(() => import('@/pages/faq'))
const Pricing = lazy(() => import('@/pages/pricing'))
const Contact = lazy(() => import('@/pages/contact'))
const GameCustomization = lazy(() => import('@/pages/game-customization'))
const AnalyticsTest = lazy(() => import('@/pages/analytics-test'))
const NotFound = lazy(() => import('@/pages/not-found'))

function AppRouter() {
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
        <Route path='/quiz-games' component={QuizGames} />
        <Route path='/about' component={About} />
        <Route path='/faq' component={FAQ} />
        <Route path='/pricing' component={Pricing} />
        <Route path='/contact' component={Contact} />
        <Route path='/game-customization/:id' component={GameCustomization} />
        <Route path='/analytics-test' component={AnalyticsTest} />
        <Route path='/auth/sign-in' component={SignIn} />
        <Route path='/auth/complete' component={CompleteSignIn} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  )
}

interface AppContentProps {
  location: Location
}

/**
 * App content component - separated for SSR compatibility
 * Uses hooks that are safe to call during SSR
 */
function AppContent({ location }: AppContentProps) {
  // Use configuration to determine which components to show
  const showHeader = shouldShowHeader(location)
  const showFooter = shouldShowFooter(location)

  // Check if analytics debug should be shown (via query parameter)
  const showAnalyticsDebug =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('analytics_debug')

  // Initialize logo cache on app startup (SSR-safe)
  useEffect(() => {
    logoCache.loadFromStorage()
  }, [])

  // Track page views when location changes (SSR-safe)
  useEffect(() => {
    // Only track in production
    if (
      typeof window !== 'undefined' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      // Track page view when location changes
      const pageTitle = document.title || location
      firebaseAnalytics.trackPageView(pageTitle)
    }
  }, [location])

  return (
    <div className='h-screen bg-background flex flex-col'>
      {/* CreatorHeader is intentionally hidden on game pages and customization pages to maintain immersive experience */}
      {showHeader && <CreatorHeader />}
      <ErrorBoundary>
        <AppRouter />
      </ErrorBoundary>
      {showFooter && <Footer />}
      <Toaster />
      {/* Analytics debug panel - shown when ?analytics_debug is in URL */}
      {showAnalyticsDebug && (
        <div className='fixed bottom-4 right-4 z-50 max-w-sm'>
          {/* <AnalyticsDebug /> */}
        </div>
      )}
    </div>
  )
}

interface AppProps {
  location?: Location
  ssrMode?: boolean
}

/**
 * Main App component for SSR-compatible rendering
 * @param location - Pre-provided location for SSR (optional)
 * @param ssrMode - Whether we're in SSR mode (prevents client-side effects)
 */
export function App({ location, ssrMode = false }: AppProps) {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <SSRRouter location={location}>
              <AppContent location={location || ['/', '']} />
            </SSRRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  )
}

// Export individual parts for flexibility
export { AppRouter as Router, AppContent }
