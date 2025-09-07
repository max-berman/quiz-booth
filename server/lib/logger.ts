// Server-side logging utility with environment-based filtering
export const logger = {
  log: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[SERVER LOG]', ...args);
    }
  },

  info: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.info('[SERVER INFO]', ...args);
    }
  },

  warn: (...args: any[]) => {
    console.warn('[SERVER WARN]', ...args);
  },

  error: (...args: any[]) => {
    console.error('[SERVER ERROR]', ...args);
  },

  debug: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[SERVER DEBUG]', ...args);
    }
  },

  // Structured logging for API calls
  api: {
    request: (method: string, path: string, data?: any) => {
      if (process.env.NODE_ENV !== 'production') {
        console.groupCollapsed(`[API] ${method} ${path}`);
        if (data) console.log('Request Data:', data);
        console.groupEnd();
      }
    },

    response: (method: string, path: string, status: number, data?: any) => {
      if (process.env.NODE_ENV !== 'production') {
        console.groupCollapsed(`[API] ${method} ${path} → ${status}`);
        if (data) console.log('Response Data:', data);
        console.groupEnd();
      }
    },

    error: (method: string, path: string, error: any) => {
      console.groupCollapsed(`[API ERROR] ${method} ${path}`);
      console.error('Error:', error);
      console.groupEnd();
    }
  }
};
