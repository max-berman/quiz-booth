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
