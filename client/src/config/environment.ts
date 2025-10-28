// Client-side environment configuration for Quiz Booth application

import { getEnvironmentConfig, isDevelopment, isProduction, getEnvironment, type EnvironmentConfig, type Environment } from '../../../shared/environment';

/**
 * Client-specific environment configuration
 */
export interface ClientEnvironmentConfig extends EnvironmentConfig {
  firebase: {
    emulator: EnvironmentConfig['firebase']['emulator'];
    projectId: string;
    config: {
      apiKey: string;
      authDomain: string;
      projectId: string;
      storageBucket: string;
      messagingSenderId: string;
      appId: string;
      measurementId?: string;
    };
  };
  urls: {
    apiBase: string;
    website: string;
  };
  admin: {
    userIds: string[];
  };
}

/**
 * Get client-specific environment configuration
 */
export const getClientEnvironmentConfig = (): ClientEnvironmentConfig => {
  const baseConfig = getEnvironmentConfig();
  const environment = getEnvironment();

  // Firebase configuration based on environment
  const firebaseConfig = environment === 'development'
    ? {
      // Development configuration (emulator)
      apiKey: 'demo-1-api-key',
      authDomain: 'localhost',
      projectId: baseConfig.firebase.projectId,
      storageBucket: 'trivia-games-7a81b.appspot.com',
      messagingSenderId: '123456789',
      appId: '1:123456789:web:abcdef123456',
    }
    : {
      // Production configuration (from environment variables)
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    };

  return {
    ...baseConfig,
    firebase: {
      ...baseConfig.firebase,
      config: firebaseConfig,
    },
    urls: {
      apiBase: environment === 'development'
        ? 'http://localhost:5001/trivia-games-7a81b/us-central1'
        : `https://us-central1-${baseConfig.firebase.projectId}.cloudfunctions.net`,
      website: environment === 'development'
        ? 'http://localhost:5173'
        : 'https://quizbooth.app', // Replace with your actual production domain
    },
    admin: {
      userIds: import.meta.env.VITE_ADMIN_USER_IDS?.split(',').map((id: string) => id.trim()) || [],
    },
  };
};

/**
 * Client-specific environment detection
 */
export const isClientDevelopment = (): boolean => {
  // Check if running on localhost or with Vite dev server
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const port = window.location.port;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '';

    // Check for Vite's development mode indicator
    const isViteDev = import.meta.env?.DEV === true ||
      import.meta.env?.MODE === 'development' ||
      port === '5173' || // Vite default port
      port === '5174' || // Vite alternate port
      port === '3000';   // Common dev port

    // Check for Firebase Hosting emulator
    const isFirebaseEmulator = port === '5000'; // Firebase Hosting emulator port

    return isLocalhost && (isViteDev || isFirebaseEmulator);
  }

  // Default to production for unknown environments
  return false;
};

export const isClientProduction = (): boolean => !isClientDevelopment();

export const getClientEnvironment = (): Environment =>
  isClientDevelopment() ? 'development' : 'production';

/**
 * Client-specific environment utilities
 */
export const clientEnvironment = {
  isDevelopment: isClientDevelopment,
  isProduction: isClientProduction,
  getEnvironment: getClientEnvironment,
  getConfig: getClientEnvironmentConfig,

  // Client-specific environment checks
  isLocalhost: (): boolean => {
    if (typeof window !== 'undefined') {
      return window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname === '';
    }
    return false;
  },

  // Validate Firebase configuration for production
  validateFirebaseConfig: (): boolean => {
    const config = getClientEnvironmentConfig();

    if (isClientProduction()) {
      const requiredVars = [
        config.firebase.config.apiKey,
        config.firebase.config.authDomain,
        config.firebase.config.projectId,
        config.firebase.config.appId,
        config.firebase.config.measurementId,
      ];

      const missingVars = requiredVars.filter(v => !v);
      if (missingVars.length > 0) {
        console.error('Missing required Firebase environment variables in production:', missingVars);
        return false;
      }
    }

    return true;
  },
};

export default clientEnvironment;
