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

export const OPENAI_API_CONFIG = {
  BASE_URL: 'https://api.openai.com',
  CHAT_COMPLETIONS_ENDPOINT: '/v1/chat/completions',
  MODELS_ENDPOINT: '/v1/models',
  DEFAULT_MODEL: 'gpt-4.1-mini',
  DEFAULT_MAX_TOKENS: 2000,
  DEFAULT_TEMPERATURE: 0.7,
  DEFAULT_TOP_P: 1.0,
  DEFAULT_FREQUENCY_PENALTY: 0,
  DEFAULT_PRESENCE_PENALTY: 0,
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

export const LLM_PROVIDER_PRIORITIES = {
  // 1 highest priority
  // 2 second highest priority
  DEEPSEEK: 2,
  OPENAI: 1,
} as const;
