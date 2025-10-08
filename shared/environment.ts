// Shared environment configuration for Quiz Booth application

export type Environment = 'development' | 'production';

/**
 * Environment detection utilities
 */
export const isDevelopment = (): boolean => {
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

export const isProduction = (): boolean => !isDevelopment();

export const getEnvironment = (): Environment =>
  isDevelopment() ? 'development' : 'production';

/**
 * Environment-specific configuration
 */
export interface EnvironmentConfig {
  environment: Environment;
  firebase: {
    emulator: {
      auth: string;
      functions: string;
      firestore: string;
      storage: string;
      ui: string;
    };
    projectId: string;
  };
  features: {
    enableDebugLogging: boolean;
    enableAnalytics: boolean;
    enablePerformanceMonitoring: boolean;
  };
}

export const getEnvironmentConfig = (): EnvironmentConfig => {
  const environment = getEnvironment();

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

/**
 * Utility functions for environment-specific behavior
 */
export const log = {
  debug: (...args: any[]): void => {
    if (getEnvironmentConfig().features.enableDebugLogging) {
      console.debug('[DEBUG]', ...args);
    }
  },

  info: (...args: any[]): void => {
    console.info('[INFO]', ...args);
  },

  warn: (...args: any[]): void => {
    console.warn('[WARN]', ...args);
  },

  error: (...args: any[]): void => {
    console.error('[ERROR]', ...args);
  }
};

/**
 * Environment-specific feature flags
 */
export const features = {
  isDebugLoggingEnabled: (): boolean => getEnvironmentConfig().features.enableDebugLogging,
  isAnalyticsEnabled: (): boolean => getEnvironmentConfig().features.enableAnalytics,
  isPerformanceMonitoringEnabled: (): boolean => getEnvironmentConfig().features.enablePerformanceMonitoring
};

export default {
  isDevelopment,
  isProduction,
  getEnvironment,
  getEnvironmentConfig,
  log,
  features
};
