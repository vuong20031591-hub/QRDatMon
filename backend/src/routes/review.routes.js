/**
 * Review Routes
 * Defines routes for review management
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */

const express = require('express');
const router = express.Router();

const reviewController = require('../controllers/review.controller');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleGuard');
const { validate, paramSchemas, Joi } = require('../middleware/validator');

/**
 * @route   GET /api/reviews
 * @desc    Get all reviews with filters
 * @access  Public
 */
router.get(
  '/',
  optionalAuth,
  validate(Joi.object({
    minRating: Joi.number().min(1).max(5),
    maxRating: Joi.number().min(1).max(5),
    menuItemId: Joi.string(),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().valid('createdAt', 'averageRating'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  }), 'query'),
  reviewController.getReviews
);

/**
 * @route   GET /api/reviews/stats
 * @desc    Get review statistics
 * @access  Public
 */
router.get(
  '/stats',
  optionalAuth,
  validate(Joi.object({
    menuItemId: Joi.string(),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso()
  }), 'query'),
  reviewController.getReviewStats
);

/**
 * @route   GET /api/reviews/my-reviews
 * @desc    Get current user's reviews
 * @access  Private
 */
router.get(
  '/my-reviews',
  authenticate,
  validate(Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  }), 'query'),
  reviewController.getMyReviews
);

/**
 * @route   GET /api/reviews/item/:menuItemId
 * @desc    Get reviews for a menu item
 * @access  Public
 */
router.get(
  '/item/:menuItemId',
  optionalAuth,
  validate(Joi.object({
    menuItemId: Joi.string().required()
  }), 'params'),
  validate(Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  }), 'query'),
  reviewController.getItemReviews
);

/**
 * @route   POST /api/reviews
 * @desc    Create a new review
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  validate(Joi.object({
    orderId: Joi.string(),
    billId: Joi.string(),
    foodRating: Joi.number().integer().min(1).max(5).required(),
    serviceRating: Joi.number().integer().min(1).max(5).required(),
    ambianceRating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().trim().max(2000),
    isAnonymous: Joi.boolean().default(false),
    itemReviews: Joi.array().items(
      Joi.object({
        menuItem: Joi.string().required(),
        rating: Joi.number().integer().min(1).max(5).required(),
        comment: Joi.string().trim().max(500)
      })
    )
  })),
  reviewController.createReview
);

/**
 * @route   GET /api/reviews/:id
 * @desc    Get review by ID
 * @access  Public
 */
router.get(
  '/:id',
  optionalAuth,
  validate(paramSchemas.idParam, 'params'),
  reviewController.getReviewById
);

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete a review
 * @access  Admin
 */
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  validate(paramSchemas.idParam, 'params'),
  reviewController.deleteReview
);

module.exports = router;
