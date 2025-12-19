/**
 * Rate Limiter Middleware
 * Implements rate limiting using express-rate-limit
 * Requirements: 11.5, 24.1, 24.2
 */

const rateLimit = require("express-rate-limit");
const { RATE_LIMITS, ERROR_CODES } = require("../utils/constants");

/**
 * Create rate limit response handler
 * @param {string} message - Custom message for rate limit error
 * @returns {Function} Express handler function
 */
const createRateLimitHandler = (message) => (req, res) => {
  return res.status(429).json({
    success: false,
    message: message || "Too many requests, please try again later",
    code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
    retryAfter: res.getHeader("Retry-After"),
  });
};

/**
 * Skip rate limiting in test environment
 */
const skipInTest = () => process.env.NODE_ENV === "test";

/**
 * General API rate limiter
 * 100 requests per 15 minutes
 */
const generalLimiter = rateLimit({
  windowMs: RATE_LIMITS.GENERAL.windowMs,
  max: RATE_LIMITS.GENERAL.max,
  message: RATE_LIMITS.GENERAL.message,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  handler: createRateLimitHandler(RATE_LIMITS.GENERAL.message),
});

/**
 * Auth endpoints rate limiter
 * 20 requests per 15 minutes
 */
const authLimiter = rateLimit({
  windowMs: RATE_LIMITS.AUTH.windowMs,
  max: RATE_LIMITS.AUTH.max,
  message: RATE_LIMITS.AUTH.message,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  handler: createRateLimitHandler(RATE_LIMITS.AUTH.message),
});

/**
 * Login attempts rate limiter (stricter)
 * 5 attempts per hour
 */
const loginLimiter = rateLimit({
  windowMs: RATE_LIMITS.LOGIN.windowMs,
  max: RATE_LIMITS.LOGIN.max,
  message: RATE_LIMITS.LOGIN.message,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  handler: createRateLimitHandler(RATE_LIMITS.LOGIN.message),
  skipSuccessfulRequests: false,
});

/**
 * Order creation rate limiter
 * 10 orders per minute
 */
const orderLimiter = rateLimit({
  windowMs: RATE_LIMITS.ORDER.windowMs,
  max: RATE_LIMITS.ORDER.max,
  message: RATE_LIMITS.ORDER.message,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  handler: createRateLimitHandler(RATE_LIMITS.ORDER.message),
});

/**
 * File upload rate limiter
 * 50 uploads per hour
 */
const uploadLimiter = rateLimit({
  windowMs: RATE_LIMITS.UPLOAD.windowMs,
  max: RATE_LIMITS.UPLOAD.max,
  message: RATE_LIMITS.UPLOAD.message,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  handler: createRateLimitHandler(RATE_LIMITS.UPLOAD.message),
});

/**
 * OTP rate limiter
 * 10 requests per 15 minutes per IP
 * Requirements: 1.7, 5.3
 */
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window per IP
  message: 'Quá nhiều yêu cầu OTP. Vui lòng thử lại sau 15 phút',
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  handler: createRateLimitHandler('Quá nhiều yêu cầu OTP. Vui lòng thử lại sau 15 phút'),
});

/**
 * Create custom rate limiter with specified options
 * @param {Object} options - Rate limiter options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Max requests per window
 * @param {string} options.message - Error message
 * @returns {Function} Express middleware
 */
const createCustomLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000,
    max = 100,
    message = "Too many requests",
  } = options;

  return rateLimit({
    windowMs,
    max,
    message,
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipInTest,
    handler: createRateLimitHandler(message),
  });
};

/**
 * Rate limiter by endpoint type
 * Usage: app.use('/api/orders', rateLimiterByType('order'))
 */
const rateLimiterByType = (type) => {
  switch (type) {
    case "auth":
      return authLimiter;
    case "login":
      return loginLimiter;
    case "order":
      return orderLimiter;
    case "upload":
      return uploadLimiter;
    default:
      return generalLimiter;
  }
};

module.exports = {
  generalLimiter,
  authLimiter,
  loginLimiter,
  orderLimiter,
  uploadLimiter,
  otpLimiter,
  createCustomLimiter,
  rateLimiterByType,
};
