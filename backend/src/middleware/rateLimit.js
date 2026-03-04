const rateLimit = require('express-rate-limit');

// Rate limiter middleware for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health check endpoint
    return req.path === '/health';
  },
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: 'Too many requests from this IP address, please try again later.',
      retryAfter: req.rateLimit.resetTime,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = apiLimiter;
