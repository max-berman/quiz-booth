import * as admin from 'firebase-admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

const db = admin.firestore();

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum number of requests allowed in the window
  keyGenerator?: (context: any, data: any) => string; // Function to generate rate limit key
  message?: string; // Custom error message
}

export class FirebaseRateLimiter {
  private collectionName = 'rateLimits';

  /**
   * Check if a request is allowed based on rate limiting rules
   */
  async checkRateLimit(
    config: RateLimitConfig,
    context: any,
    data: any
  ): Promise<{ allowed: boolean; remaining: number; resetTime: Date }> {
    const key = config.keyGenerator ? config.keyGenerator(context, data) : this.defaultKeyGenerator(context);
    const now = Date.now();

    try {
      const rateLimitRef = db.collection(this.collectionName).doc(key);
      const rateLimitDoc = await rateLimitRef.get();

      if (!rateLimitDoc.exists) {
        // First request - create new rate limit record
        await rateLimitRef.set({
          count: 1,
          firstRequest: Timestamp.fromDate(new Date(now)),
          lastRequest: Timestamp.fromDate(new Date(now)),
          resetTime: Timestamp.fromDate(new Date(now + config.windowMs)),
        });

        return {
          allowed: true,
          remaining: config.max - 1,
          resetTime: new Date(now + config.windowMs),
        };
      }

      const rateLimitData = rateLimitDoc.data();
      if (!rateLimitData) {
        throw new Error('Rate limit data not found');
      }

      const resetTime = rateLimitData.resetTime?.toDate?.()?.getTime() || now + config.windowMs;

      // Check if window has expired
      if (now > resetTime) {
        // Reset the counter
        await rateLimitRef.set({
          count: 1,
          firstRequest: Timestamp.fromDate(new Date(now)),
          lastRequest: Timestamp.fromDate(new Date(now)),
          resetTime: Timestamp.fromDate(new Date(now + config.windowMs)),
        });

        return {
          allowed: true,
          remaining: config.max - 1,
          resetTime: new Date(now + config.windowMs),
        };
      }

      const currentCount = rateLimitData.count || 0;

      if (currentCount >= config.max) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: new Date(resetTime),
        };
      }

      // Increment the counter
      await rateLimitRef.update({
        count: FieldValue.increment(1),
        lastRequest: Timestamp.fromDate(new Date(now)),
      });

      return {
        allowed: true,
        remaining: config.max - currentCount - 1,
        resetTime: new Date(resetTime),
      };
    } catch (error) {
      console.error('Rate limit check error:', error);
      // If rate limiting fails, allow the request to prevent blocking legitimate users
      return {
        allowed: true,
        remaining: config.max - 1,
        resetTime: new Date(now + config.windowMs),
      };
    }
  }

  /**
   * Default key generator using user ID for authenticated requests and IP for anonymous
   */
  private defaultKeyGenerator(context: any): string {
    if (context.auth) {
      return `user:${context.auth.uid}`;
    }
    // For anonymous requests, we can't reliably get IP in Firebase Functions
    // So we use a generic key for anonymous requests
    return 'anonymous';
  }

  /**
   * Clean up expired rate limit records
   */
  async cleanupExpired(): Promise<number> {
    const now = Date.now();
    const expiredThreshold = new Date(now - (24 * 60 * 60 * 1000)); // 24 hours ago

    try {
      const expiredDocs = await db
        .collection(this.collectionName)
        .where('resetTime', '<', Timestamp.fromDate(expiredThreshold))
        .get();

      const batch = db.batch();
      expiredDocs.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      return expiredDocs.size;
    } catch (error) {
      console.error('Rate limit cleanup error:', error);
      return 0;
    }
  }
}

// Create a singleton instance
export const rateLimiter = new FirebaseRateLimiter();

// Predefined rate limit configurations
export const rateLimitConfigs = {
  // General API rate limiting
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
    message: 'Too many requests, please try again later.',
  },

  // Authentication rate limiting
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 authentication attempts per 15 minutes
    message: 'Too many authentication attempts, please try again later.',
  },

  // Game creation rate limiting
  gameCreation: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 game creations per hour
    keyGenerator: (context: any) => context.auth ? `user:${context.auth.uid}:game_creation` : 'anonymous:game_creation',
    message: 'Too many game creations, please try again later.',
  },

  // AI generation rate limiting (more restrictive due to cost)
  aiGeneration: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 AI generations per hour
    keyGenerator: (context: any) => context.auth ? `user:${context.auth.uid}:ai_generation` : 'anonymous:ai_generation',
    message: 'Too many AI generation requests, please try again later.',
  },

  // Question generation rate limiting
  questionGeneration: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 question generations per hour
    keyGenerator: (context: any) => context.auth ? `user:${context.auth.uid}:question_generation` : 'anonymous:question_generation',
    message: 'Too many question generation requests, please try again later.',
  },
};

/**
 * Rate limiting middleware for Firebase Functions
 */
export function withRateLimit(config: RateLimitConfig) {
  return async (data: any, context: any) => {
    const result = await rateLimiter.checkRateLimit(config, context, data);

    if (!result.allowed) {
      throw new Error(config.message || 'Rate limit exceeded');
    }

    return result;
  };
}
