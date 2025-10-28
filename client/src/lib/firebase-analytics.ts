// Firebase Analytics Service
// Centralized analytics service using Firebase Analytics

import { logEvent, Analytics } from 'firebase/analytics';
import { analytics as firebaseAnalyticsInstance } from './firebase';

interface AnalyticsEvent {
  name: string;
  params?: Record<string, any>;
}

class FirebaseAnalyticsService {
  private analytics: Analytics | null = null;
  private debugMode = import.meta.env.DEV || false;

  constructor() {
    // Enable debug mode if analytics_debug query parameter is present
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('analytics_debug')) {
        this.debugMode = true;
      }
    }

    if (this.debugMode) {
      console.log('FirebaseAnalyticsService initialized');
    }
  }

  // Set the analytics instance
  setAnalytics(analyticsInstance: Analytics): void {
    this.analytics = analyticsInstance;
    if (this.debugMode) {
      console.log('Firebase Analytics instance set:', !!this.analytics);
    }
  }

  // Check if analytics is available
  isAvailable(): boolean {
    return this.analytics !== null;
  }

  // Track custom events
  trackEvent(event: AnalyticsEvent): void {
    if (!this.analytics) {
      if (this.debugMode) {
        console.warn('Firebase Analytics not available for event:', event.name);
      }
      return;
    }

    try {
      if (this.debugMode) {
        console.log('Firebase Analytics: Sending event:', event.name, event.params);
      }
      logEvent(this.analytics, event.name, event.params);
    } catch (error) {
      console.error('Firebase Analytics: Failed to send event:', event.name, error);
    }
  }

  // Track page views
  trackPageView(page: string): void {
    this.trackEvent({
      name: 'page_view',
      params: {
        page_title: page,
        page_location: window.location.href,
      },
    });
  }

  // Track game creation events
  trackGameCreated(gameData: {
    gameId: string;
    companyName: string;
    industry: string;
    questionCount: number;
    difficulty: string;
    categories: string[];
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
    });
  }

  // Track game play events
  trackGameStart(gameData: {
    gameId: string;
    difficulty: string;
    categories: string[];
    questionCount: number;
  }): void {
    this.trackEvent({
      name: 'game_start',
      params: {
        game_id: gameData.gameId,
        difficulty: gameData.difficulty,
        categories: gameData.categories?.join(',') || '',
        question_count: gameData.questionCount,
      },
    });
  }

  // Track question answered events
  trackQuestionAnswered(gameData: {
    gameId: string;
    questionIndex: number;
    isCorrect: boolean;
    timeSpent: number;
    currentStreak: number;
    totalScore: number;
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
    });
  }

  // Track game completion events
  trackGameCompleted(gameData: {
    gameId: string;
    finalScore: number;
    correctAnswers: number;
    totalQuestions: number;
    totalTime: number;
    maxStreak: number;
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
    });
  }

  // Track game abandonment events
  trackGameAbandoned(gameData: {
    gameId: string;
    currentQuestion: number;
    totalQuestions: number;
    currentScore: number;
    reason?: string;
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
    });
  }

  // Track sharing events
  trackGameShared(gameData: {
    gameId: string;
    shareMethod: 'qr_code' | 'embed' | 'link' | 'social';
    platform?: string;
  }): void {
    this.trackEvent({
      name: 'game_shared',
      params: {
        game_id: gameData.gameId,
        share_method: gameData.shareMethod,
        platform: gameData.platform,
      },
    });
  }

  // Track authentication events
  trackUserSignIn(method: 'google' | 'email'): void {
    this.trackEvent({
      name: 'user_sign_in',
      params: {
        method,
      },
    });
  }

  // Track error events
  trackError(errorData: {
    type: 'ai_generation' | 'timer_resume' | 'network' | 'authentication' | 'other';
    message: string;
    context?: string;
  }): void {
    this.trackEvent({
      name: 'error_occurred',
      params: {
        error_type: errorData.type,
        error_message: errorData.message,
        context: errorData.context,
      },
    });
  }

  // Track timer events
  trackTimerExpired(gameData: {
    gameId: string;
    questionIndex: number;
  }): void {
    this.trackEvent({
      name: 'timer_expired',
      params: {
        game_id: gameData.gameId,
        question_index: gameData.questionIndex,
      },
    });
  }
}

// Create singleton instance
export const firebaseAnalytics = new FirebaseAnalyticsService();

export default firebaseAnalytics;
