/**
 * Authentication Routes
 * Defines routes for authentication endpoints
 * Requirements: 1.1, 1.4, 1.5
 */

const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const { authenticate, verifyRefreshToken, restrictGuest } = require('../middleware/auth');
const { authLimiter, loginLimiter } = require('../middleware/rateLimiter');
const { validate, authSchemas } = require('../middleware/validator');

/**
 * @route   POST /api/auth/google
 * @desc    Login with Firebase Google ID token
 * @access  Public
 */
router.post(
  '/google',
  loginLimiter,
  validate(authSchemas.googleLogin),
  authController.googleLogin
);

/**
 * @route   POST /api/auth/guest
 * @desc    Create guest session
 * @access  Public
 */
router.post(
  '/guest',
  authLimiter,
  validate(authSchemas.guestLogin),
  authController.guestLogin
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh JWT tokens using refresh token
 * @access  Public (requires valid refresh token in body)
 */
router.post(
  '/refresh',
  authLimiter,
  validate(authSchemas.refreshToken),
  verifyRefreshToken,
  authController.refreshToken
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout and invalidate session
 * @access  Private
 */
router.post(
  '/logout',
  authenticate,
  authController.logout
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user info
 * @access  Private
 */
router.get(
  '/me',
  authenticate,
  authController.getMe
);

/**
 * @route   POST /api/auth/link-google
 * @desc    Link guest account to Google account
 * @access  Private (Guest users only)
 */
router.post(
  '/link-google',
  authenticate,
  validate(authSchemas.googleLogin),
  authController.linkGoogle
);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile (name, etc.)
 * @access  Private (non-guest only)
 */
router.put(
  '/profile',
  authenticate,
  restrictGuest,
  authController.updateProfile
);

module.exports = router;
