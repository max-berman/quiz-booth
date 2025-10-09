/**
 * API Configuration Constants
 * Centralized configuration for all external API endpoints
 */

export const DEEPSEEK_API_CONFIG = {
  BASE_URL: 'https://api.deepseek.com',
  CHAT_COMPLETIONS_ENDPOINT: '/v1/chat/completions',
  MODELS_ENDPOINT: '/v1/models',
  DEFAULT_MODEL: 'deepseek-chat',
  DEFAULT_MAX_TOKENS: 2048,
  DEFAULT_TEMPERATURE: 0.7,
} as const;

export const API_TIMEOUTS = {
  DEFAULT: 30000, // 30 seconds
  LONG: 60000,    // 60 seconds
  SHORT: 10000,   // 10 seconds
} as const;

export const API_HEADERS = {
  CONTENT_TYPE: 'application/json',
  ACCEPT: 'application/json',
} as const;

/**
 * CORS Configuration
 * Centralized CORS settings for all API endpoints
 */
export const CORS_CONFIG = {
  // Production domains
  PRODUCTION_ORIGINS: [
    'https://quizbooth.games',
    'https://www.quizbooth.games'
  ],

  // Development domains
  DEVELOPMENT_ORIGINS: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:3000',
    'http://localhost:5000'
  ],

  // Allowed HTTP methods
  ALLOWED_METHODS: ['GET', 'OPTIONS'],

  // Allowed HTTP headers
  ALLOWED_HEADERS: ['Content-Type', 'Authorization'],

  // Allow credentials
  ALLOW_CREDENTIALS: true
} as const;
