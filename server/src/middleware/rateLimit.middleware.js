const rateLimit = require('express-rate-limit');

/**
 * Creates a rate limiter middleware with explicit HTTP 429 response status and Retry-After header.
 */
const createLimiter = ({ windowMs, max, message }) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true, // Send RateLimit-* headers
    legacyHeaders: false,
    statusCode: 429,
    handler: (req, res) => {
      const resetTime = req.rateLimit ? req.rateLimit.resetTime : new Date(Date.now() + windowMs);
      const retryAfterSeconds = Math.ceil((resetTime.getTime() - Date.now()) / 1000);
      res.setHeader('Retry-After', Math.max(1, retryAfterSeconds));
      res.status(429).json({
        success: false,
        message: message || 'Too many requests, please try again later.'
      });
    }
  });
};

// Rate limiter for authentication endpoints (login, register, admin-login)
const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV !== 'production' ? 1000 : 20, // 1000 in dev, 20 in prod
  message: 'Too many authentication attempts from this IP, please try again after 15 minutes'
});

// Rate limiter for password reset endpoints (forgot-password, reset-password)
const passwordResetLimiter = createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per hour per IP
  message: 'Too many password reset requests from this IP, please try again after an hour'
});

// Rate limiter for payment webhooks
const webhookLimiter = createLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute per IP
  message: 'Too many webhook requests from this IP'
});

module.exports = {
  authLimiter,
  passwordResetLimiter,
  webhookLimiter
};
