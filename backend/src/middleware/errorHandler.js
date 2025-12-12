/**
 * Global Error Handler Middleware
 * Handles all errors and returns standardized responses
 * Requirements: 11.1, 11.2, 11.3, 11.4
 */

const { sendError } = require('../utils/response');
const { AppError, isOperationalError } = require('../utils/errors');
const { ERROR_CODES } = require('../utils/constants');

/**
 * Log error details for debugging
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 */
const logError = (err, req) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user?.id || 'anonymous',
    error: {
      name: err.name,
      message: err.message,
      code: err.errorCode || 'UNKNOWN',
      stack: err.stack
    }
  };

  // In production, you might want to send this to a logging service
  if (process.env.NODE_ENV === 'production') {
    // Only log non-operational errors in production
    if (!isOperationalError(err)) {
      console.error('[CRITICAL ERROR]', JSON.stringify(errorLog, null, 2));
    } else {
      console.warn('[OPERATIONAL ERROR]', errorLog.error.message);
    }
  } else {
    // Log all errors in development
    console.error('[ERROR]', JSON.stringify(errorLog, null, 2));
  }
};

/**
 * Handle Mongoose validation errors
 * @param {Error} err - Mongoose validation error
 * @returns {Object} Formatted error object
 */
const handleMongooseValidationError = (err) => {
  const errors = Object.values(err.errors).map(e => ({
    field: e.path,
    message: e.message,
    value: e.value
  }));

  return {
    statusCode: 400,
    message: 'Validation failed',
    code: ERROR_CODES.VALIDATION_ERROR,
    errors
  };
};

/**
 * Handle Mongoose duplicate key error
 * @param {Error} err - Mongoose duplicate key error
 * @returns {Object} Formatted error object
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];

  return {
    statusCode: 409,
    message: `Duplicate value for field '${field}'`,
    code: ERROR_CODES.ALREADY_EXISTS,
    errors: [{ field, message: `'${value}' already exists`, value }]
  };
};

/**
 * Handle Mongoose cast error (invalid ObjectId, etc.)
 * @param {Error} err - Mongoose cast error
 * @returns {Object} Formatted error object
 */
const handleCastError = (err) => {
  return {
    statusCode: 400,
    message: `Invalid ${err.path}: ${err.value}`,
    code: ERROR_CODES.INVALID_FORMAT,
    errors: [{ field: err.path, message: `Invalid value '${err.value}'` }]
  };
};

/**
 * Handle JWT errors
 * @param {Error} err - JWT error
 * @returns {Object} Formatted error object
 */
const handleJWTError = (err) => {
  if (err.name === 'TokenExpiredError') {
    return {
      statusCode: 401,
      message: 'Token has expired',
      code: ERROR_CODES.TOKEN_EXPIRED
    };
  }

  return {
    statusCode: 401,
    message: 'Invalid token',
    code: ERROR_CODES.INVALID_TOKEN
  };
};

/**
 * Handle JSON parsing errors
 * @param {Error} err - SyntaxError from JSON parsing
 * @returns {Object} Formatted error object
 */
const handleSyntaxError = (err) => {
  return {
    statusCode: 400,
    message: 'Invalid JSON in request body',
    code: ERROR_CODES.INVALID_INPUT,
    errors: [{ message: err.message }]
  };
};

/**
 * Main error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logError(err, req);

  // If headers already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  // Default error values
  let errorResponse = {
    statusCode: err.statusCode || 500,
    message: err.message || 'Internal Server Error',
    code: err.errorCode || ERROR_CODES.INTERNAL_ERROR,
    errors: err.details || null,
    stack: err.stack
  };

  // Handle known error types
  if (err instanceof AppError) {
    // Our custom application errors
    errorResponse = {
      statusCode: err.statusCode,
      message: err.message,
      code: err.errorCode,
      errors: err.details,
      stack: err.stack
    };
  } else if (err.name === 'ValidationError' && err.errors) {
    // Mongoose validation error
    errorResponse = handleMongooseValidationError(err);
  } else if (err.code === 11000) {
    // MongoDB duplicate key error
    errorResponse = handleDuplicateKeyError(err);
  } else if (err.name === 'CastError') {
    // Mongoose cast error (invalid ObjectId)
    errorResponse = handleCastError(err);
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    // JWT errors
    errorResponse = handleJWTError(err);
  } else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    // JSON parsing error
    errorResponse = handleSyntaxError(err);
  } else if (!isOperationalError(err)) {
    // Unknown errors - don't leak details in production
    if (process.env.NODE_ENV === 'production') {
      errorResponse = {
        statusCode: 500,
        message: 'An unexpected error occurred',
        code: ERROR_CODES.INTERNAL_ERROR,
        errors: null,
        stack: null
      };
    }
  }

  // Send error response
  return sendError(res, errorResponse);
};

/**
 * Not Found handler middleware
 * Used for routes that don't exist
 */
const notFoundHandler = (req, res, next) => {
  return sendError(res, {
    statusCode: 404,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    code: ERROR_CODES.NOT_FOUND
  });
};

/**
 * Async handler wrapper
 * Wraps async route handlers to catch errors
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};
