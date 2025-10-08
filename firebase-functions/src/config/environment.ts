// Server-side environment configuration for Firebase Functions

import { getEnvironmentConfig, isDevelopment, isProduction, getEnvironment, type EnvironmentConfig } from '../../../shared/environment';

/**
 * Server-specific environment configuration
 */
export interface ServerEnvironmentConfig extends EnvironmentConfig {
  firebase: {
    emulator: EnvironmentConfig['firebase']['emulator'];
    projectId: string;
    admin: {
      serviceAccount?: string;
      databaseURL?: string;
    };
  };
  api: {
    deepseek: {
      apiKey: string;
      baseUrl: string;
    };
    sparkpost: {
      apiKey?: string;
    };
  };
  limits: {
    maxQuestionsPerGeneration: number;
    rateLimitPerMinute: number;
  };
}

/**
 * Get server-specific environment configuration
 */
export const getServerEnvironmentConfig = (): ServerEnvironmentConfig => {
  const baseConfig = getEnvironmentConfig();
  const environment = getEnvironment();

  return {
    ...baseConfig,
    firebase: {
      ...baseConfig.firebase,
      admin: {
        serviceAccount: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        databaseURL: `https://${baseConfig.firebase.projectId}.firebaseio.com`,
      },
    },
    api: {
      deepseek: {
        apiKey: process.env.DEEPSEEK_API_KEY || '',
        baseUrl: 'https://api.deepseek.com',
      },
      sparkpost: {
        apiKey: process.env.SPARKPOST_API_KEY,
      },
    },
    limits: {
      maxQuestionsPerGeneration: environment === 'development' ? 50 : 20,
      rateLimitPerMinute: environment === 'development' ? 100 : 30,
    },
  };
};

/**
 * Server-specific environment utilities
 */
export const serverEnvironment = {
  isDevelopment,
  isProduction,
  getEnvironment,
  getConfig: getServerEnvironmentConfig,

  // Server-specific environment checks
  isEmulatorRunning: (): boolean => {
    return process.env.FUNCTIONS_EMULATOR === 'true' ||
      process.env.FIREBASE_EMULATOR === 'true';
  },

  // Validate required environment variables for production
  validateEnvironment: (): boolean => {
    const config = getServerEnvironmentConfig();

    if (isProduction()) {
      const requiredVars = [
        config.api.deepseek.apiKey,
        config.firebase.projectId,
      ];

      const missingVars = requiredVars.filter(v => !v);
      if (missingVars.length > 0) {
        console.error('Missing required environment variables in production:', missingVars);
        return false;
      }
    }

    return true;
  },

  // Get appropriate timeout for functions based on environment
  getFunctionTimeout: (): number => {
    return isDevelopment() ? 60000 : 30000; // 60s for dev, 30s for prod
  },

  // Get appropriate memory limit for functions based on environment
  getFunctionMemory: (): '128MB' | '256MB' | '512MB' => {
    return isDevelopment() ? '128MB' : '256MB';
  },
};

export default serverEnvironment;
