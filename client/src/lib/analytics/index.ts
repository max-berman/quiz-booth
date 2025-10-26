// Google Analytics 4 Service
// Centralized analytics service for tracking user interactions and game events

interface AnalyticsEvent {
  name: string
  params?: Record<string, any>
}

class AnalyticsService {
  private measurementId: string
  private isInitialized = false
  private isGtagAvailable = false
  private eventQueue: AnalyticsEvent[] = []
  private debugMode = import.meta.env.DEV || false

  constructor() {
    // Use environment variable or fallback for measurement ID
    this.measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX'

    if (this.debugMode) {
      console.log('AnalyticsService initialized with measurement ID:', this.measurementId)
    }
  }

  // Initialize Google Analytics
  initialize(): void {
    if (typeof window === 'undefined') {
      if (this.debugMode) console.log('Analytics: Window not available (SSR)')
      return
    }

    if (this.isInitialized) {
      if (this.debugMode) console.log('Analytics: Already initialized')
      return
    }

    // Check if gtag is already available
    if (this.isGtagFunctionAvailable()) {
      this.isInitialized = true
      this.isGtagAvailable = true
      if (this.debugMode) console.log('Analytics: gtag already available')
      this.processEventQueue()
      return
    }

    if (this.debugMode) console.log('Analytics: Starting initialization')

    // Initialize dataLayer and gtag function BEFORE loading the script
    window.dataLayer = window.dataLayer || []
    window.gtag = function gtag(...args: any[]) {
      window.dataLayer.push(args)
    }
    window.gtag('js', new Date())
    window.gtag('config', this.measurementId)

    // Load Google Analytics script
    const script = document.createElement('script')
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`
    script.async = true

    // Use onload to detect when the script is ready
    script.onload = () => {
      this.isInitialized = true
      this.isGtagAvailable = this.isGtagFunctionAvailable()

      if (this.debugMode) {
        console.log('Analytics: Script loaded successfully', {
          isInitialized: this.isInitialized,
          isGtagAvailable: this.isGtagAvailable,
          gtagType: typeof window.gtag
        })
      }

      if (this.isGtagAvailable) {
        this.processEventQueue()
      } else {
        console.error('Analytics: gtag function not available after script load')
      }
    }

    script.onerror = (error) => {
      console.error('Analytics: Failed to load Google Analytics script:', error)
      if (this.debugMode) console.log('Analytics: Script load failed')
    }

    document.head.appendChild(script)
  }

  // Check if gtag function is actually available and working
  private isGtagFunctionAvailable(): boolean {
    return typeof window.gtag === 'function'
  }

  // Process queued events
  private processEventQueue(): void {
    if (this.debugMode) console.log(`Analytics: Processing ${this.eventQueue.length} queued events`)

    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()
      if (event) {
        this.sendEvent(event)
      }
    }
  }

  // Queue event if not initialized, otherwise send immediately
  private queueOrSendEvent(event: AnalyticsEvent): void {
    if (this.isInitialized && this.isGtagAvailable) {
      this.sendEvent(event)
    } else {
      if (this.debugMode) console.log('Analytics: Queuing event (not ready):', event.name)
      this.eventQueue.push(event)

      // If we have queued events but aren't initialized, try to initialize
      if (!this.isInitialized) {
        this.initialize()
      }
    }
  }

  // Send event to Google Analytics
  private sendEvent(event: AnalyticsEvent): void {
    if (!this.isGtagAvailable) {
      if (this.debugMode) console.warn('Analytics: gtag not available for event:', event.name)
      return
    }

    try {
      if (this.debugMode) console.log('Analytics: Sending event:', event.name, event.params)
      window.gtag('event', event.name, event.params)
    } catch (error) {
      console.error('Analytics: Failed to send event:', event.name, error)
    }
  }

  // Track custom events
  trackEvent(event: AnalyticsEvent): void {
    this.queueOrSendEvent(event)
  }

  // Track page views
  trackPageView(page: string): void {
    this.trackEvent({
      name: 'page_view',
      params: {
        page_title: page,
        page_location: window.location.href,
      },
    })
  }

  // Track game creation events
  trackGameCreated(gameData: {
    gameId: string
    companyName: string
    industry: string
    questionCount: number
    difficulty: string
    categories: string[]
  }): void {
    this.trackEvent({
      name: 'game_created',
      params: {
        game_id: gameData.gameId,
        company_name: gameData.companyName,
        industry: gameData.industry,
        question_count: gameData.questionCount,
        difficulty: gameData.difficulty,
        categories: gameData.categories.join(','),
      },
    })
  }

  // Track game play events
  trackGameStart(gameData: {
    gameId: string
    difficulty: string
    categories: string[]
    questionCount: number
  }): void {
    this.trackEvent({
      name: 'game_start',
      params: {
        game_id: gameData.gameId,
        difficulty: gameData.difficulty,
        categories: gameData.categories?.join(',') || '',
        question_count: gameData.questionCount,
      },
    })
  }

  // Track question answered events
  trackQuestionAnswered(gameData: {
    gameId: string
    questionIndex: number
    isCorrect: boolean
    timeSpent: number
    currentStreak: number
    totalScore: number
  }): void {
    this.trackEvent({
      name: 'question_answered',
      params: {
        game_id: gameData.gameId,
        question_index: gameData.questionIndex,
        is_correct: gameData.isCorrect,
        time_spent: gameData.timeSpent,
        current_streak: gameData.currentStreak,
        total_score: gameData.totalScore,
      },
    })
  }

  // Track game completion events
  trackGameCompleted(gameData: {
    gameId: string
    finalScore: number
    correctAnswers: number
    totalQuestions: number
    totalTime: number
    maxStreak: number
  }): void {
    this.trackEvent({
      name: 'game_completed',
      params: {
        game_id: gameData.gameId,
        final_score: gameData.finalScore,
        correct_answers: gameData.correctAnswers,
        total_questions: gameData.totalQuestions,
        total_time: gameData.totalTime,
        max_streak: gameData.maxStreak,
        completion_rate: Math.round((gameData.correctAnswers / gameData.totalQuestions) * 100),
      },
    })
  }

  // Track game abandonment events
  trackGameAbandoned(gameData: {
    gameId: string
    currentQuestion: number
    totalQuestions: number
    currentScore: number
    reason?: string
  }): void {
    this.trackEvent({
      name: 'game_abandoned',
      params: {
        game_id: gameData.gameId,
        current_question: gameData.currentQuestion,
        total_questions: gameData.totalQuestions,
        current_score: gameData.currentScore,
        reason: gameData.reason || 'unknown',
      },
    })
  }

  // Track sharing events
  trackGameShared(gameData: {
    gameId: string
    shareMethod: 'qr_code' | 'embed' | 'link' | 'social'
    platform?: string
  }): void {
    this.trackEvent({
      name: 'game_shared',
      params: {
        game_id: gameData.gameId,
        share_method: gameData.shareMethod,
        platform: gameData.platform,
      },
    })
  }

  // Track authentication events
  trackUserSignIn(method: 'google' | 'email'): void {
    this.trackEvent({
      name: 'user_sign_in',
      params: {
        method,
      },
    })
  }

  // Track error events
  trackError(errorData: {
    type: 'ai_generation' | 'timer_resume' | 'network' | 'authentication' | 'other'
    message: string
    context?: string
  }): void {
    this.trackEvent({
      name: 'error_occurred',
      params: {
        error_type: errorData.type,
        error_message: errorData.message,
        context: errorData.context,
      },
    })
  }

  // Track timer events
  trackTimerExpired(gameData: {
    gameId: string
    questionIndex: number
  }): void {
    this.trackEvent({
      name: 'timer_expired',
      params: {
        game_id: gameData.gameId,
        question_index: gameData.questionIndex,
      },
    })
  }
}

// Create singleton instance
export const analytics = new AnalyticsService()

// Type declarations for window object
declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}

export default analytics
