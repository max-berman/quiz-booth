// Environment-aware logging utility to reduce console noise in production
export const logger = {
  log: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.log('[LOG]', ...args);
    }
  },

  info: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.info('[INFO]', ...args);
    }
  },

  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args);
  },

  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
  },

  debug: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.debug('[DEBUG]', ...args);
    }
  },

  // Structured logging for API calls
  api: {
    request: (url: string, method: string, data?: any) => {
      if (import.meta.env.DEV) {
        console.groupCollapsed(`[API] ${method} ${url}`);
        if (data) console.log('Request Data:', data);
        console.groupEnd();
      }
    },

    response: (url: string, method: string, response: any, data?: any) => {
      if (import.meta.env.DEV) {
        console.groupCollapsed(`[API] ${method} ${url} → ${response.status}`);
        if (data) console.log('Response Data:', data);
        console.groupEnd();
      }
    },

    error: (url: string, method: string, error: any) => {
      console.groupCollapsed(`[API ERROR] ${method} ${url}`);
      console.error('Error:', error);
      console.groupEnd();
    }
  }
};
