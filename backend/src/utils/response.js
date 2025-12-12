/**
 * Standardized API Response Helpers
 * Provides consistent response format across all API endpoints
 * Requirements: 11.1, 11.2, 11.3, 11.4
 */

const { ERROR_CODES } = require('./constants');

/**
 * Success Response Helper
 * @param {Object} res - Express response object
 * @param {Object} options - Response options
 * @param {number} options.statusCode - HTTP status code (default: 200)
 * @param {string} options.message - Success message
 * @param {any} options.data - Response data
 * @param {Object} options.meta - Additional metadata (pagination, etc.)
 */
const sendSuccess = (res, options = {}) => {
  const {
    statusCode = 200,
    message = 'Success',
    data = null,
    meta = null
  } = options;

  const response = {
    success: true,
    message,
    data
  };

  // Add meta information if provided (pagination, etc.)
  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Error Response Helper
 * @param {Object} res - Express response object
 * @param {Object} options - Error options
 * @param {number} options.statusCode - HTTP status code (default: 500)
 * @param {string} options.message - Error message
 * @param {string} options.code - Error code from ERROR_CODES
 * @param {Array|Object} options.errors - Validation errors or additional error details
 * @param {string} options.stack - Error stack trace (only in development)
 */
const sendError = (res, options = {}) => {
  const {
    statusCode = 500,
    message = 'Internal Server Error',
    code = ERROR_CODES.INTERNAL_ERROR,
    errors = null,
    stack = null
  } = options;

  const response = {
    success: false,
    message,
    code
  };

  // Add validation errors if provided
  if (errors) {
    response.errors = errors;
  }

  // Add stack trace in development mode
  if (process.env.NODE_ENV === 'development' && stack) {
    response.stack = stack;
  }

  return res.status(statusCode).json(response);
};

/**
 * Pagination helper - creates meta object for paginated responses
 * @param {Object} options - Pagination options
 * @param {number} options.page - Current page number
 * @param {number} options.limit - Items per page
 * @param {number} options.total - Total number of items
 * @returns {Object} Pagination meta object
 */
const createPaginationMeta = ({ page, limit, total }) => {
  const totalPages = Math.ceil(total / limit);

  return {
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
};

/**
 * Common success responses
 */
const successResponses = {
  // 200 OK
  ok: (res, data, message = 'Success') =>
    sendSuccess(res, { statusCode: 200, message, data }),

  // 201 Created
  created: (res, data, message = 'Resource created successfully') =>
    sendSuccess(res, { statusCode: 201, message, data }),

  // 200 with pagination
  paginated: (res, data, paginationOptions, message = 'Success') =>
    sendSuccess(res, {
      statusCode: 200,
      message,
      data,
      meta: createPaginationMeta(paginationOptions)
    }),

  // 204 No Content
  noContent: (res) => res.status(204).send()
};

/**
 * Common error responses
 */
const errorResponses = {
  // 400 Bad Request
  badRequest: (res, message = 'Bad Request', errors = null) =>
    sendError(res, {
      statusCode: 400,
      message,
      code: ERROR_CODES.INVALID_INPUT,
      errors
    }),

  // 400 Validation Error
  validationError: (res, errors, message = 'Validation failed') =>
    sendError(res, {
      statusCode: 400,
      message,
      code: ERROR_CODES.VALIDATION_ERROR,
      errors
    }),

  // 401 Unauthorized
  unauthorized: (res, message = 'Unauthorized', code = ERROR_CODES.UNAUTHORIZED) =>
    sendError(res, { statusCode: 401, message, code }),

  // 403 Forbidden
  forbidden: (res, message = 'Forbidden') =>
    sendError(res, {
      statusCode: 403,
      message,
      code: ERROR_CODES.FORBIDDEN
    }),

  // 404 Not Found
  notFound: (res, message = 'Resource not found') =>
    sendError(res, {
      statusCode: 404,
      message,
      code: ERROR_CODES.NOT_FOUND
    }),

  // 409 Conflict
  conflict: (res, message = 'Resource already exists') =>
    sendError(res, {
      statusCode: 409,
      message,
      code: ERROR_CODES.CONFLICT
    }),

  // 429 Too Many Requests
  tooManyRequests: (res, message = 'Too many requests') =>
    sendError(res, {
      statusCode: 429,
      message,
      code: ERROR_CODES.RATE_LIMIT_EXCEEDED
    }),

  // 500 Internal Server Error
  internalError: (res, message = 'Internal Server Error', stack = null) =>
    sendError(res, {
      statusCode: 500,
      message,
      code: ERROR_CODES.INTERNAL_ERROR,
      stack
    })
};

module.exports = {
  sendSuccess,
  sendError,
  createPaginationMeta,
  ...successResponses,
  ...errorResponses
};
