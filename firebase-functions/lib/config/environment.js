"use strict";
// Server-side environment configuration for Firebase Functions
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverEnvironment = exports.getServerEnvironmentConfig = void 0;
const environment_1 = require("../../../shared/environment");
/**
 * Get server-specific environment configuration
 */
const getServerEnvironmentConfig = () => {
    const baseConfig = (0, environment_1.getEnvironmentConfig)();
    const environment = (0, environment_1.getEnvironment)();
    return Object.assign(Object.assign({}, baseConfig), { firebase: Object.assign(Object.assign({}, baseConfig.firebase), { admin: {
                serviceAccount: process.env.GOOGLE_APPLICATION_CREDENTIALS,
                databaseURL: `https://${baseConfig.firebase.projectId}.firebaseio.com`,
            } }), api: {
            deepseek: {
                apiKey: process.env.DEEPSEEK_API_KEY || '',
                baseUrl: 'https://api.deepseek.com',
            },
            sparkpost: {
                apiKey: process.env.SPARKPOST_API_KEY,
            },
        }, limits: {
            maxQuestionsPerGeneration: environment === 'development' ? 50 : 20,
            rateLimitPerMinute: environment === 'development' ? 100 : 30,
        } });
};
exports.getServerEnvironmentConfig = getServerEnvironmentConfig;
/**
 * Server-specific environment utilities
 */
exports.serverEnvironment = {
    isDevelopment: environment_1.isDevelopment,
    isProduction: environment_1.isProduction,
    getEnvironment: environment_1.getEnvironment,
    getConfig: exports.getServerEnvironmentConfig,
    // Server-specific environment checks
    isEmulatorRunning: () => {
        return process.env.FUNCTIONS_EMULATOR === 'true' ||
            process.env.FIREBASE_EMULATOR === 'true';
    },
    // Validate required environment variables for production
    validateEnvironment: () => {
        const config = (0, exports.getServerEnvironmentConfig)();
        if ((0, environment_1.isProduction)()) {
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
    getFunctionTimeout: () => {
        return (0, environment_1.isDevelopment)() ? 60000 : 30000; // 60s for dev, 30s for prod
    },
    // Get appropriate memory limit for functions based on environment
    getFunctionMemory: () => {
        return (0, environment_1.isDevelopment)() ? '128MB' : '256MB';
    },
};
exports.default = exports.serverEnvironment;
//# sourceMappingURL=environment.js.map