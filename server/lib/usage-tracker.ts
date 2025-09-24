import { getDatabase, isDatabaseAvailable, withDatabase } from './database';
import {
  usageEvents,
  usageCounters,
  userPlans,
  featureLimits,
  type InsertUsageEvent,
  type InsertUsageCounter,
  PUBLIC_BETA_LIMITS
} from '@shared/usage-schema';
import { eq, gte, sql } from 'drizzle-orm';
import { logger } from './logger';

export class UsageTracker {
  /**
   * Record a usage event and update counters
   * During beta phase, this tracks usage but doesn't enforce hard limits
   */
  async recordEvent(userId: string, eventType: InsertUsageEvent['eventType'], metadata?: any, resourceId?: string): Promise<void> {
    try {
      // Check if database is available
      if (!isDatabaseAvailable()) {
        logger.warn('Database unavailable, skipping usage tracking for event:', eventType);
        return;
      }

      const db = getDatabase();
      if (!db) {
        logger.warn('Database not initialized, skipping usage tracking');
        return;
      }

      // 1. Insert immutable event record
      const eventData: InsertUsageEvent = {
        userId,
        eventType,
        resourceId,
        metadata: metadata || {},
        costUnits: "0.0000", // TODO: Payment Integration - Calculate cost units later
      };

      await db.insert(usageEvents).values(eventData);

      // 2. Update real-time counter (atomic operation)
      const counterField = this.getCounterField(eventType);
      await db.insert(usageCounters)
        .values({
          userId,
          [counterField]: 1,
          lastResetDate: new Date(),
          updatedAt: new Date()
        })
        .onConflictDoUpdate({
          target: usageCounters.userId,
          set: {
            // Use a type-safe approach for dynamic field updates
            ...(counterField === 'currentPeriodGamesCreated' && { currentPeriodGamesCreated: sql`${usageCounters.currentPeriodGamesCreated} + 1` }),
            ...(counterField === 'currentPeriodQuestionsGenerated' && { currentPeriodQuestionsGenerated: sql`${usageCounters.currentPeriodQuestionsGenerated} + 1` }),
            ...(counterField === 'currentPeriodAiQuestions' && { currentPeriodAiQuestions: sql`${usageCounters.currentPeriodAiQuestions} + 1` }),
            ...(counterField === 'currentPeriodPlayerSubmissions' && { currentPeriodPlayerSubmissions: sql`${usageCounters.currentPeriodPlayerSubmissions} + 1` }),
            ...(counterField === 'currentPeriodAnalyticsViews' && { currentPeriodAnalyticsViews: sql`${usageCounters.currentPeriodAnalyticsViews} + 1` }),
            ...(counterField === 'currentPeriodExports' && { currentPeriodExports: sql`${usageCounters.currentPeriodExports} + 1` }),
            ...(counterField === 'currentPeriodCustomThemes' && { currentPeriodCustomThemes: sql`${usageCounters.currentPeriodCustomThemes} + 1` }),
            updatedAt: new Date()
          }
        });

      // 3. Check if user has reached beta limits (for informational purposes only)
      await this.checkBetaLimit(userId, eventType);

      logger.log(`Usage event recorded: ${eventType} for user ${userId}`);
    } catch (error) {
      logger.error('Error recording usage event:', error);
      // Don't throw errors during beta to avoid disrupting user experience
    }
  }

  /**
   * Get current usage for a specific feature
   */
  async getCurrentUsage(userId: string, featureType: string): Promise<number> {
    return await withDatabase(async (db) => {
      try {
        const counter = await db.select()
          .from(usageCounters)
          .where(eq(usageCounters.userId, userId))
          .limit(1);

        if (counter.length === 0) {
          return 0;
        }

        const counterField = this.getCounterField(featureType as any);
        const counterRecord = counter[0];

        // Safely access the counter field with null checks
        const value = counterRecord[counterField as keyof typeof counterRecord];
        return value !== null && value !== undefined ? Number(value) : 0;
      } catch (error) {
        logger.error('Error getting current usage:', error);
        return 0;
      }
    }, 0); // Fallback to 0 if database unavailable
  }

  /**
   * Check if user can perform an action (soft limits during beta)
   * Returns object with allowed status and optional warning message
   */
  async checkBetaLimit(userId: string, featureType: string): Promise<{
    allowed: boolean;
    message?: string;
    currentUsage: number;
    limit: number;
  }> {
    try {
      const currentUsage = await this.getCurrentUsage(userId, featureType);
      const limit = this.getBetaLimit(featureType);

      // During beta, always allow but provide warnings
      if (currentUsage >= limit) {
        return {
          allowed: true,
          message: `You've reached the beta limit for ${this.getFeatureDisplayName(featureType)}. Future versions may restrict this feature.`,
          currentUsage,
          limit
        };
      }

      if (currentUsage >= limit * 0.8) {
        return {
          allowed: true,
          message: `You're approaching the beta limit for ${this.getFeatureDisplayName(featureType)} (${currentUsage}/${limit}).`,
          currentUsage,
          limit
        };
      }

      return {
        allowed: true,
        currentUsage,
        limit
      };
    } catch (error) {
      logger.error('Error checking beta limit:', error);
      // Default to allowing during beta if there's an error
      return {
        allowed: true,
        currentUsage: 0,
        limit: this.getBetaLimit(featureType)
      };
    }
  }

  /**
   * Get user's usage summary for dashboard display
   */
  async getUserUsageSummary(userId: string) {
    return await withDatabase(async (db) => {
      try {
        const counter = await db.select()
          .from(usageCounters)
          .where(eq(usageCounters.userId, userId))
          .limit(1);

        if (counter.length === 0) {
          return this.getEmptyUsageSummary();
        }

        const usage = counter[0];

        return {
          gamesCreated: {
            current: usage.currentPeriodGamesCreated || 0,
            limit: PUBLIC_BETA_LIMITS.FREE.games_created,
            percentage: Math.min(100, ((usage.currentPeriodGamesCreated || 0) / PUBLIC_BETA_LIMITS.FREE.games_created) * 100)
          },
          questionsGenerated: {
            current: usage.currentPeriodQuestionsGenerated || 0,
            limit: PUBLIC_BETA_LIMITS.FREE.questions_per_game,
            percentage: Math.min(100, ((usage.currentPeriodQuestionsGenerated || 0) / PUBLIC_BETA_LIMITS.FREE.questions_per_game) * 100)
          },
          analyticsViews: {
            current: usage.currentPeriodAnalyticsViews || 0,
            limit: PUBLIC_BETA_LIMITS.FREE.analytics_views,
            percentage: Math.min(100, ((usage.currentPeriodAnalyticsViews || 0) / PUBLIC_BETA_LIMITS.FREE.analytics_views) * 100)
          },
          exports: {
            current: usage.currentPeriodExports || 0,
            limit: PUBLIC_BETA_LIMITS.FREE.exports,
            percentage: Math.min(100, ((usage.currentPeriodExports || 0) / PUBLIC_BETA_LIMITS.FREE.exports) * 100)
          }
        };
      } catch (error) {
        logger.error('Error getting user usage summary:', error);
        return this.getEmptyUsageSummary();
      }
    }, this.getEmptyUsageSummary());
  }

  /**
   * Initialize user plan (called when user signs up)
   */
  async initializeUserPlan(userId: string): Promise<void> {
    if (!isDatabaseAvailable()) {
      logger.warn('Database unavailable, skipping user plan initialization');
      return;
    }

    const db = getDatabase();
    if (!db) {
      logger.warn('Database not initialized, skipping user plan initialization');
      return;
    }

    try {
      await db.insert(userPlans).values({
        userId,
        planType: 'free',
        status: 'beta'
      }).onConflictDoNothing({
        target: userPlans.userId
      });

      // Initialize usage counters if they don't exist
      await db.insert(usageCounters).values({
        userId,
        lastResetDate: new Date()
      }).onConflictDoNothing({
        target: usageCounters.userId
      });

      logger.log(`User plan initialized for: ${userId}`);
    } catch (error) {
      logger.error('Error initializing user plan:', error);
    }
  }

  /**
   * Monthly reset job (to be called by a cron job)
   */
  async resetMonthlyUsage(): Promise<void> {
    if (!isDatabaseAvailable()) {
      logger.warn('Database unavailable, skipping monthly usage reset');
      return;
    }

    const db = getDatabase();
    if (!db) {
      logger.warn('Database not initialized, skipping monthly usage reset');
      return;
    }

    try {
      const firstOfMonth = new Date();
      firstOfMonth.setDate(1);
      firstOfMonth.setHours(0, 0, 0, 0);

      await db.update(usageCounters)
        .set({
          currentPeriodGamesCreated: 0,
          currentPeriodQuestionsGenerated: 0,
          currentPeriodAiQuestions: 0,
          currentPeriodPlayerSubmissions: 0,
          currentPeriodAnalyticsViews: 0,
          currentPeriodExports: 0,
          currentPeriodCustomThemes: 0,
          lastResetDate: firstOfMonth,
          updatedAt: new Date()
        })
        .where(gte(usageCounters.lastResetDate, firstOfMonth));

      logger.log('Monthly usage counters reset');
    } catch (error) {
      logger.error('Error resetting monthly usage:', error);
    }
  }

  // Private helper methods

  private getCounterField(eventType: string): string {
    const fieldMap: Record<string, string> = {
      'game_created': 'currentPeriodGamesCreated',
      'question_generated': 'currentPeriodQuestionsGenerated',
      'ai_question_generated': 'currentPeriodAiQuestions',
      'player_submission': 'currentPeriodPlayerSubmissions',
      'analytics_viewed': 'currentPeriodAnalyticsViews',
      'export_used': 'currentPeriodExports',
      'custom_theme_applied': 'currentPeriodCustomThemes'
    };

    return fieldMap[eventType] || 'currentPeriodGamesCreated';
  }

  private getBetaLimit(featureType: string): number {
    const limitMap: Record<string, number> = {
      'game_created': PUBLIC_BETA_LIMITS.FREE.games_created,
      'question_generated': PUBLIC_BETA_LIMITS.FREE.questions_per_game,
      'analytics_viewed': PUBLIC_BETA_LIMITS.FREE.analytics_views,
      'export_used': PUBLIC_BETA_LIMITS.FREE.exports,
      // Default limits for other features
      'ai_question_generated': 100,
      'player_submission': 1000,
      'custom_theme_applied': 5
    };

    return limitMap[featureType] || 10;
  }

  private getFeatureDisplayName(featureType: string): string {
    const displayNames: Record<string, string> = {
      'game_created': 'game creation',
      'question_generated': 'question generation',
      'ai_question_generated': 'AI question generation',
      'player_submission': 'player submissions',
      'analytics_viewed': 'analytics views',
      'export_used': 'exports',
      'custom_theme_applied': 'custom themes'
    };

    return displayNames[featureType] || featureType;
  }

  private getEmptyUsageSummary() {
    return {
      gamesCreated: { current: 0, limit: PUBLIC_BETA_LIMITS.FREE.games_created, percentage: 0 },
      questionsGenerated: { current: 0, limit: PUBLIC_BETA_LIMITS.FREE.questions_per_game, percentage: 0 },
      analyticsViews: { current: 0, limit: PUBLIC_BETA_LIMITS.FREE.analytics_views, percentage: 0 },
      exports: { current: 0, limit: PUBLIC_BETA_LIMITS.FREE.exports, percentage: 0 }
    };
  }
}

// Singleton instance
export const usageTracker = new UsageTracker();

// TODO: Payment Integration - Add billing-related methods later
// - calculateOverageCost()
// - triggerOverageBilling()
// - handleSubscriptionChanges()
// - getBillingPortalUrl()
