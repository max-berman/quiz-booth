import rateLimit, { Options, ipKeyGenerator } from 'express-rate-limit';

// General API rate limiting
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limits for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Game creation rate limiting
export const gameCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each user to 10 game creations per hour
  keyGenerator: (req: any) => {
    // Use user ID for authenticated requests, IP for anonymous
    return req.user?.uid || ipKeyGenerator(req);
  },
  message: 'Too many game creations, please try again later.',
});

// AI generation rate limiting (more restrictive due to cost)
export const aiGenerationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each user to 10 AI generations per hour
  keyGenerator: (req: any) => {
    // Use user ID for authenticated requests, IP for anonymous
    return req.user?.uid || ipKeyGenerator(req);
  },
  message: 'Too many AI generation requests, please try again later.',
});

// Enhanced rate limiting with monitoring
export const monitoredRateLimit = (options: Options) => {
  const limiter = rateLimit(options);

  return (req: any, res: any, next: any) => {
    limiter(req, res, (err: any) => {
      if (err) {
        // Log rate limit hits
        console.warn('Rate limit exceeded:', {
          ip: req.ip,
          path: req.path,
          method: req.method,
          timestamp: new Date().toISOString()
        });
      }
      next(err);
    });
  };
};
