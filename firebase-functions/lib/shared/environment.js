"use strict";
// Shared environment configuration for Quiz Booth application
Object.defineProperty(exports, "__esModule", { value: true });
exports.features = exports.log = exports.getEnvironmentConfig = exports.getEnvironment = exports.isProduction = exports.isDevelopment = void 0;
/**
 * Environment detection utilities
 */
const isDevelopment = () => {
    // Check for Node.js environment (server-side) first
    if (typeof process !== 'undefined' && process.env) {
        return process.env.NODE_ENV === 'development' ||
            process.env.FUNCTIONS_EMULATOR === 'true' ||
            process.env.FIREBASE_EMULATOR === 'true';
    }
    // Check for Vite development mode (client-side)
    // Use a simple check that won't break server-side builds
    if (typeof window !== 'undefined') {
        // Client-side environment - check for localhost or development indicators
        const hostname = window.location.hostname;
        return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '';
    }
    // Default to production for safety
    return false;
};
exports.isDevelopment = isDevelopment;
const isProduction = () => !(0, exports.isDevelopment)();
exports.isProduction = isProduction;
const getEnvironment = () => (0, exports.isDevelopment)() ? 'development' : 'production';
exports.getEnvironment = getEnvironment;
const getEnvironmentConfig = () => {
    const environment = (0, exports.getEnvironment)();
    return {
        environment,
        firebase: {
            emulator: {
                auth: 'http://localhost:9099',
                functions: 'localhost:5001',
                firestore: 'localhost:8081',
                storage: 'localhost:9199',
                ui: 'http://localhost:4000'
            },
            projectId: environment === 'development'
                ? 'trivia-games-7a81b' // Development project ID
                : process.env.FIREBASE_PROJECT_ID || 'quiz-booth-production' // Production project ID
        },
        features: {
            enableDebugLogging: environment === 'development',
            enableAnalytics: environment === 'production',
            enablePerformanceMonitoring: environment === 'production'
        }
    };
};
exports.getEnvironmentConfig = getEnvironmentConfig;
/**
 * Utility functions for environment-specific behavior
 */
exports.log = {
    debug: (...args) => {
        if ((0, exports.getEnvironmentConfig)().features.enableDebugLogging) {
            console.debug('[DEBUG]', ...args);
        }
    },
    info: (...args) => {
        console.info('[INFO]', ...args);
    },
    warn: (...args) => {
        console.warn('[WARN]', ...args);
    },
    error: (...args) => {
        console.error('[ERROR]', ...args);
    }
};
/**
 * Environment-specific feature flags
 */
exports.features = {
    isDebugLoggingEnabled: () => (0, exports.getEnvironmentConfig)().features.enableDebugLogging,
    isAnalyticsEnabled: () => (0, exports.getEnvironmentConfig)().features.enableAnalytics,
    isPerformanceMonitoringEnabled: () => (0, exports.getEnvironmentConfig)().features.enablePerformanceMonitoring
};
exports.default = {
    isDevelopment: exports.isDevelopment,
    isProduction: exports.isProduction,
    getEnvironment: exports.getEnvironment,
    getEnvironmentConfig: exports.getEnvironmentConfig,
    log: exports.log,
    features: exports.features
};
//# sourceMappingURL=environment.js.map