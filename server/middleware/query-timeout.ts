// Database operation timeout utility
export const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number = 5000
): Promise<T> => {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Database operation timeout')), timeoutMs)
  );
  return Promise.race([promise, timeout]);
};

// Timeout middleware for database operations
export const databaseTimeout = (timeoutMs: number = 5000) => {
  return (req: any, res: any, next: any) => {
    // Store original send method
    const originalSend = res.send;

    // Override send to handle timeouts
    res.send = function (body: any) {
      clearTimeout(req._timeoutId);
      originalSend.call(this, body);
    };

    // Set timeout for the request
    req._timeoutId = setTimeout(() => {
      if (!res.headersSent) {
        res.status(504).json({
          message: 'Request timeout',
          error: 'Database operation took too long to complete'
        });
      }
    }, timeoutMs);

    next();
  };
};
