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
    // Skip timeout for AI generation endpoints which can take longer
    if (req.path.includes('/generate-')) {
      return next();
    }

    let responseSent = false;

    // Store original send method
    const originalSend = res.send;

    // Override send to handle timeouts
    res.send = function (body: any) {
      if (!responseSent) {
        responseSent = true;
        clearTimeout(req._timeoutId);
        originalSend.call(this, body);
      }
    };

    // Set timeout for the request
    req._timeoutId = setTimeout(() => {
      if (!responseSent && !res.headersSent) {
        responseSent = true;
        res.status(504).json({
          message: 'Request timeout',
          error: 'Database operation took too long to complete'
        });
      }
    }, timeoutMs);

    next();
  };
};
