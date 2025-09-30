"use strict";
/**
 * API Configuration Constants
 * Centralized configuration for all external API endpoints
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_HEADERS = exports.API_TIMEOUTS = exports.DEEPSEEK_API_CONFIG = void 0;
exports.DEEPSEEK_API_CONFIG = {
    BASE_URL: 'https://api.deepseek.com',
    CHAT_COMPLETIONS_ENDPOINT: '/v1/chat/completions',
    MODELS_ENDPOINT: '/v1/models',
    DEFAULT_MODEL: 'deepseek-chat',
    DEFAULT_MAX_TOKENS: 2048,
    DEFAULT_TEMPERATURE: 0.7,
};
exports.API_TIMEOUTS = {
    DEFAULT: 30000,
    LONG: 60000,
    SHORT: 10000, // 10 seconds
};
exports.API_HEADERS = {
    CONTENT_TYPE: 'application/json',
    ACCEPT: 'application/json',
};
//# sourceMappingURL=api-config.js.map