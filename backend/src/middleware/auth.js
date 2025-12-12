/**
 * Authentication Middleware
 * Handles Firebase token verification and JWT session token management
 * Requirements: 1.1, 1.2, 1.3
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const config = require('../config');
const { AuthenticationError, InvalidTokenError, TokenExpiredError } = require('../utils/errors');
const { ERROR_CODES } = require('../utils/constants');

/**
 * Extract token from Authorization header
 * Supports both "Bearer <token>" and raw token format
 * @param {Object} req - Express request object
 * @returns {string|null} Token or null if not found
 */
const extractToken = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  // Check for Bearer token format
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // Return raw token if no Bearer prefix
  return authHeader;
};

/**
 * Verify JWT session token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {InvalidTokenError|TokenExpiredError} If token is invalid or expired
 */
const verifyJWT = (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret, {
      issuer: config.jwt.issuer,
      audience: config.jwt.audience
    });
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new TokenExpiredError('Session token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new InvalidTokenError('Invalid session token');
    }
    throw new AuthenticationError('Token verification failed');
  }
};

/**
 * Generate JWT access token
 * @param {Object} user - User object
 * @param {Object} options - Additional options
 * @returns {string} JWT access token
 */
const generateAccessToken = (user, options = {}) => {
  const payload = {
    id: user._id || user.id,
    email: user.email,
    name: user.name,
    isGuest: user.isGuest || false,
    ...(options.staffRole && { staffRole: options.staffRole })
  };

  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: user.isGuest ? config.session.guestTokenExpiry : config.jwt.accessTokenExpiry,
    issuer: config.jwt.issuer,
    audience: config.jwt.audience
  });
};

/**
 * Generate JWT refresh token
 * @param {Object} user - User object
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (user) => {
  const payload = {
    id: user._id || user.id,
    type: 'refresh'
  };

  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.refreshTokenExpiry,
    issuer: config.jwt.issuer,
    audience: config.jwt.audience
  });
};

/**
 * Authentication middleware
 * Verifies JWT session token and attaches user to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      throw new AuthenticationError('Authentication required. Please provide a valid token.');
    }

    // Verify the JWT token
    const decoded = verifyJWT(token);

    // Check if it's a refresh token (not allowed for regular auth)
    if (decoded.type === 'refresh') {
      throw new InvalidTokenError('Cannot use refresh token for authentication');
    }

    // Find the user in database
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new AuthenticationError('User not found or has been deleted');
    }

    if (!user.isActive) {
      throw new AuthenticationError('User account has been deactivated');
    }

    // Attach user and decoded token to request
    req.user = user;
    req.token = decoded;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware
 * Similar to authenticate but doesn't fail if no token is provided
 * Useful for endpoints that work differently for authenticated vs anonymous users
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      // No token provided, continue without user
      req.user = null;
      req.token = null;
      return next();
    }

    // Verify the JWT token
    const decoded = verifyJWT(token);

    // Check if it's a refresh token
    if (decoded.type === 'refresh') {
      req.user = null;
      req.token = null;
      return next();
    }

    // Find the user in database
    const user = await User.findById(decoded.id);

    if (user && user.isActive) {
      req.user = user;
      req.token = decoded;
    } else {
      req.user = null;
      req.token = null;
    }

    next();
  } catch (error) {
    // On any error, continue without authentication
    req.user = null;
    req.token = null;
    next();
  }
};

/**
 * Verify refresh token middleware
 * Used specifically for token refresh endpoint
 */
const verifyRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AuthenticationError('Refresh token is required');
    }

    // Verify the refresh token
    const decoded = verifyJWT(refreshToken);

    // Ensure it's a refresh token
    if (decoded.type !== 'refresh') {
      throw new InvalidTokenError('Invalid refresh token');
    }

    // Find the user
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    if (!user.isActive) {
      throw new AuthenticationError('User account has been deactivated');
    }

    // Attach user to request for the controller to use
    req.user = user;
    req.refreshTokenPayload = decoded;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user is a guest
 * Middleware to restrict certain actions for guest users
 */
const restrictGuest = (req, res, next) => {
  if (req.user && req.user.isGuest) {
    return next(new AuthenticationError(
      'This action is not available for guest users. Please sign in.',
      ERROR_CODES.FORBIDDEN
    ));
  }
  next();
};

/**
 * Ensure user is authenticated and is a guest
 * Useful for endpoints that should only work for guests (like linking to real account)
 */
const requireGuest = (req, res, next) => {
  if (!req.user || !req.user.isGuest) {
    return next(new AuthenticationError(
      'This action is only available for guest users.',
      ERROR_CODES.FORBIDDEN
    ));
  }
  next();
};

module.exports = {
  extractToken,
  verifyJWT,
  generateAccessToken,
  generateRefreshToken,
  authenticate,
  optionalAuth,
  verifyRefreshToken,
  restrictGuest,
  requireGuest
};
