/**
 * Custom Error Classes
 * Provides standardized error handling across the application
 * Requirements: 11.1, 11.2, 11.3, 11.4
 */

const { ERROR_CODES } = require('./constants');

/**
 * Base Application Error
 * All custom errors should extend this class
 */
class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = ERROR_CODES.INTERNAL_ERROR, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true; // Operational errors are expected errors
    this.timestamp = new Date().toISOString();

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.errorCode,
        message: this.message,
        ...(this.details && { details: this.details }),
        timestamp: this.timestamp
      }
    };
  }
}

/**
 * Validation Error (400)
 * Used when request data fails validation
 */
class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = null) {
    super(message, 400, ERROR_CODES.VALIDATION_ERROR, details);
  }
}

/**
 * Authentication Error (401)
 * Used when authentication fails or token is invalid
 */
class AuthenticationError extends AppError {
  constructor(message = 'Authentication required', errorCode = ERROR_CODES.UNAUTHORIZED) {
    super(message, 401, errorCode);
  }
}

/**
 * Invalid Token Error (401)
 * Used when JWT or Firebase token is invalid
 */
class InvalidTokenError extends AuthenticationError {
  constructor(message = 'Invalid or expired token') {
    super(message, ERROR_CODES.INVALID_TOKEN);
  }
}

/**
 * Token Expired Error (401)
 * Used when token has expired
 */
class TokenExpiredError extends AuthenticationError {
  constructor(message = 'Token has expired') {
    super(message, ERROR_CODES.TOKEN_EXPIRED);
  }
}

/**
 * Forbidden Error (403)
 * Used when user lacks permission for an action
 */
class ForbiddenError extends AppError {
  constructor(message = 'Access denied', details = null) {
    super(message, 403, ERROR_CODES.FORBIDDEN, details);
  }
}

/**
 * Not Found Error (404)
 * Used when requested resource doesn't exist
 */
class NotFoundError extends AppError {
  constructor(message = 'Resource not found', resource = null) {
    const details = resource ? { resource } : null;
    super(message, 404, ERROR_CODES.NOT_FOUND, details);
  }
}

/**
 * Conflict Error (409)
 * Used when there's a conflict with existing data
 */
class ConflictError extends AppError {
  constructor(message = 'Resource already exists', details = null) {
    super(message, 409, ERROR_CODES.CONFLICT, details);
  }
}

/**
 * Rate Limit Error (429)
 * Used when rate limit is exceeded
 */
class RateLimitError extends AppError {
  constructor(message = 'Too many requests, please try again later', retryAfter = null) {
    const details = retryAfter ? { retryAfter } : null;
    super(message, 429, ERROR_CODES.RATE_LIMIT_EXCEEDED, details);
  }
}

/**
 * Business Logic Errors
 */

class ItemUnavailableError extends AppError {
  constructor(message = 'Item is not available', items = null) {
    const details = items ? { unavailableItems: items } : null;
    super(message, 400, ERROR_CODES.ITEM_UNAVAILABLE, details);
  }
}

class InsufficientStockError extends AppError {
  constructor(message = 'Insufficient stock', details = null) {
    super(message, 400, ERROR_CODES.INSUFFICIENT_STOCK, details);
  }
}

class InvalidVoucherError extends AppError {
  constructor(message = 'Invalid voucher code', errorCode = ERROR_CODES.INVALID_VOUCHER, details = null) {
    super(message, 400, errorCode, details);
  }
}

class VoucherExpiredError extends InvalidVoucherError {
  constructor(message = 'Voucher has expired') {
    super(message, ERROR_CODES.VOUCHER_EXPIRED);
  }
}

class VoucherAlreadyUsedError extends InvalidVoucherError {
  constructor(message = 'Voucher has already been used') {
    super(message, ERROR_CODES.VOUCHER_ALREADY_USED);
  }
}

class MinimumNotMetError extends InvalidVoucherError {
  constructor(message = 'Minimum order amount not met', minimumAmount = null) {
    const details = minimumAmount ? { minimumAmount } : null;
    super(message, ERROR_CODES.MINIMUM_NOT_MET, details);
  }
}

class TableOccupiedError extends AppError {
  constructor(message = 'Table is already occupied') {
    super(message, 400, ERROR_CODES.TABLE_OCCUPIED);
  }
}

class BillAlreadyPaidError extends AppError {
  constructor(message = 'Bill has already been paid') {
    super(message, 400, ERROR_CODES.BILL_ALREADY_PAID);
  }
}

class OrderCannotCancelError extends AppError {
  constructor(message = 'Order cannot be cancelled', reason = null) {
    const details = reason ? { reason } : null;
    super(message, 400, ERROR_CODES.ORDER_CANNOT_CANCEL, details);
  }
}

/**
 * Database Error (500)
 * Used for database operation failures
 */
class DatabaseError extends AppError {
  constructor(message = 'Database operation failed', details = null) {
    super(message, 500, ERROR_CODES.DATABASE_ERROR, details);
    this.isOperational = false; // Database errors might not be operational
  }
}

/**
 * External Service Error (502/503)
 * Used when external service calls fail
 */
class ExternalServiceError extends AppError {
  constructor(message = 'External service unavailable', service = null) {
    const details = service ? { service } : null;
    super(message, 503, ERROR_CODES.EXTERNAL_SERVICE_ERROR, details);
  }
}

/**
 * Check if error is operational (expected) or programming error
 */
const isOperationalError = (error) => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};

/**
 * Create error from status code
 */
const createErrorFromStatus = (statusCode, message) => {
  switch (statusCode) {
    case 400:
      return new ValidationError(message);
    case 401:
      return new AuthenticationError(message);
    case 403:
      return new ForbiddenError(message);
    case 404:
      return new NotFoundError(message);
    case 409:
      return new ConflictError(message);
    case 429:
      return new RateLimitError(message);
    default:
      return new AppError(message, statusCode);
  }
};

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  InvalidTokenError,
  TokenExpiredError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ItemUnavailableError,
  InsufficientStockError,
  InvalidVoucherError,
  VoucherExpiredError,
  VoucherAlreadyUsedError,
  MinimumNotMetError,
  TableOccupiedError,
  BillAlreadyPaidError,
  OrderCannotCancelError,
  DatabaseError,
  ExternalServiceError,
  isOperationalError,
  createErrorFromStatus
};
