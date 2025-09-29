"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withRateLimit = exports.rateLimitConfigs = exports.rateLimiter = exports.FirebaseRateLimiter = void 0;
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
const db = admin.firestore();
class FirebaseRateLimiter {
    constructor() {
        this.collectionName = 'rateLimits';
    }
    /**
     * Check if a request is allowed based on rate limiting rules
     */
    async checkRateLimit(config, context, data) {
        var _a, _b, _c;
        const key = config.keyGenerator ? config.keyGenerator(context, data) : this.defaultKeyGenerator(context);
        const now = Date.now();
        try {
            const rateLimitRef = db.collection(this.collectionName).doc(key);
            const rateLimitDoc = await rateLimitRef.get();
            if (!rateLimitDoc.exists) {
                // First request - create new rate limit record
                await rateLimitRef.set({
                    count: 1,
                    firstRequest: firestore_1.Timestamp.fromDate(new Date(now)),
                    lastRequest: firestore_1.Timestamp.fromDate(new Date(now)),
                    resetTime: firestore_1.Timestamp.fromDate(new Date(now + config.windowMs)),
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
            const resetTime = ((_c = (_b = (_a = rateLimitData.resetTime) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a)) === null || _c === void 0 ? void 0 : _c.getTime()) || now + config.windowMs;
            // Check if window has expired
            if (now > resetTime) {
                // Reset the counter
                await rateLimitRef.set({
                    count: 1,
                    firstRequest: firestore_1.Timestamp.fromDate(new Date(now)),
                    lastRequest: firestore_1.Timestamp.fromDate(new Date(now)),
                    resetTime: firestore_1.Timestamp.fromDate(new Date(now + config.windowMs)),
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
                count: firestore_1.FieldValue.increment(1),
                lastRequest: firestore_1.Timestamp.fromDate(new Date(now)),
            });
            return {
                allowed: true,
                remaining: config.max - currentCount - 1,
                resetTime: new Date(resetTime),
            };
        }
        catch (error) {
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
    defaultKeyGenerator(context) {
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
    async cleanupExpired() {
        const now = Date.now();
        const expiredThreshold = new Date(now - (24 * 60 * 60 * 1000)); // 24 hours ago
        try {
            const expiredDocs = await db
                .collection(this.collectionName)
                .where('resetTime', '<', firestore_1.Timestamp.fromDate(expiredThreshold))
                .get();
            const batch = db.batch();
            expiredDocs.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            return expiredDocs.size;
        }
        catch (error) {
            console.error('Rate limit cleanup error:', error);
            return 0;
        }
    }
}
exports.FirebaseRateLimiter = FirebaseRateLimiter;
// Create a singleton instance
exports.rateLimiter = new FirebaseRateLimiter();
// Predefined rate limit configurations
exports.rateLimitConfigs = {
    // General API rate limiting
    api: {
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: 'Too many requests, please try again later.',
    },
    // Authentication rate limiting
    auth: {
        windowMs: 15 * 60 * 1000,
        max: 5,
        message: 'Too many authentication attempts, please try again later.',
    },
    // Game creation rate limiting
    gameCreation: {
        windowMs: 60 * 60 * 1000,
        max: 10,
        keyGenerator: (context) => context.auth ? `user:${context.auth.uid}:game_creation` : 'anonymous:game_creation',
        message: 'Too many game creations, please try again later.',
    },
    // AI generation rate limiting (more restrictive due to cost)
    aiGeneration: {
        windowMs: 60 * 60 * 1000,
        max: 10,
        keyGenerator: (context) => context.auth ? `user:${context.auth.uid}:ai_generation` : 'anonymous:ai_generation',
        message: 'Too many AI generation requests, please try again later.',
    },
    // Question generation rate limiting
    questionGeneration: {
        windowMs: 60 * 60 * 1000,
        max: 20,
        keyGenerator: (context) => context.auth ? `user:${context.auth.uid}:question_generation` : 'anonymous:question_generation',
        message: 'Too many question generation requests, please try again later.',
    },
};
/**
 * Rate limiting middleware for Firebase Functions
 */
function withRateLimit(config) {
    return async (data, context) => {
        const result = await exports.rateLimiter.checkRateLimit(config, context, data);
        if (!result.allowed) {
            throw new Error(config.message || 'Rate limit exceeded');
        }
        return result;
    };
}
exports.withRateLimit = withRateLimit;
//# sourceMappingURL=rate-limit.js.map