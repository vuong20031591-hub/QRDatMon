/**
 * Promotion Routes
 * Defines routes for promotion/voucher management
 * Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8, 15.9
 */

const express = require('express');
const router = express.Router();

const promotionController = require('../controllers/promotion.controller');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleGuard');
const { validate, paramSchemas, Joi } = require('../middleware/validator');

/**
 * @route   GET /api/promotions
 * @desc    Get active promotions (public)
 * @access  Public
 */
router.get(
  '/',
  optionalAuth,
  validate(Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    includeExpired: Joi.string().valid('true', 'false')
  }), 'query'),
  promotionController.getActivePromotions
);

/**
 * @route   GET /api/promotions/all
 * @desc    Get all promotions with filters (admin)
 * @access  Admin
 */
router.get(
  '/all',
  authenticate,
  requireAdmin,
  validate(Joi.object({
    isActive: Joi.string().valid('true', 'false'),
    discountType: Joi.string().valid('percent', 'fixed'),
    search: Joi.string().trim().max(100),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().valid('createdAt', 'startDate', 'endDate', 'usedCount', 'code'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  }), 'query'),
  promotionController.getPromotions
);

/**
 * @route   POST /api/promotions/cleanup
 * @desc    Check and deactivate expired promotions
 * @access  Admin
 */
router.post(
  '/cleanup',
  authenticate,
  requireAdmin,
  promotionController.checkAndDeactivateExpired
);

/**
 * @route   POST /api/promotions/generate-code
 * @desc    Generate unique voucher code
 * @access  Admin
 */
router.post(
  '/generate-code',
  authenticate,
  requireAdmin,
  validate(Joi.object({
    prefix: Joi.string().trim().uppercase().max(5).default('QRD'),
    length: Joi.number().integer().min(6).max(16).default(8)
  })),
  promotionController.generateVoucherCode
);

/**
 * @route   GET /api/promotions/validate/:code
 * @desc    Validate voucher code
 * @access  Private
 */
router.get(
  '/validate/:code',
  authenticate,
  validate(Joi.object({
    code: Joi.string().trim().uppercase().required()
  }), 'params'),
  validate(Joi.object({
    orderAmount: Joi.number().integer().min(0)
  }), 'query'),
  promotionController.validateVoucherCode
);

/**
 * @route   POST /api/promotions
 * @desc    Create a new promotion
 * @access  Admin
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(Joi.object({
    code: Joi.string().trim().uppercase().min(3).max(20).required(),
    name: Joi.string().trim().min(1).max(200).required(),
    description: Joi.string().trim().max(1000),
    discountType: Joi.string().valid('percent', 'fixed').required(),
    discountValue: Joi.number().min(0).required(),
    minOrderAmount: Joi.number().integer().min(0).default(0),
    maxDiscount: Joi.number().integer().min(0).allow(null),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
    usageLimit: Joi.number().integer().min(1).allow(null),
    usagePerUser: Joi.number().integer().min(1).default(1)
  })),
  promotionController.createPromotion
);

/**
 * @route   GET /api/promotions/:id
 * @desc    Get promotion by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticate,
  validate(paramSchemas.idParam, 'params'),
  promotionController.getPromotionById
);

/**
 * @route   PUT /api/promotions/:id
 * @desc    Update promotion
 * @access  Admin
 */
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validate(paramSchemas.idParam, 'params'),
  validate(Joi.object({
    code: Joi.string().trim().uppercase().min(3).max(20),
    name: Joi.string().trim().min(1).max(200),
    description: Joi.string().trim().max(1000).allow(''),
    discountType: Joi.string().valid('percent', 'fixed'),
    discountValue: Joi.number().min(0),
    minOrderAmount: Joi.number().integer().min(0),
    maxDiscount: Joi.number().integer().min(0).allow(null),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    usageLimit: Joi.number().integer().min(1).allow(null),
    usagePerUser: Joi.number().integer().min(1),
    isActive: Joi.boolean()
  })),
  promotionController.updatePromotion
);

/**
 * @route   PATCH /api/promotions/:id/deactivate
 * @desc    Deactivate promotion
 * @access  Admin
 */
router.patch(
  '/:id/deactivate',
  authenticate,
  requireAdmin,
  validate(paramSchemas.idParam, 'params'),
  promotionController.deactivatePromotion
);

/**
 * @route   PATCH /api/promotions/:id/reactivate
 * @desc    Reactivate promotion
 * @access  Admin
 */
router.patch(
  '/:id/reactivate',
  authenticate,
  requireAdmin,
  validate(paramSchemas.idParam, 'params'),
  promotionController.reactivatePromotion
);

/**
 * @route   GET /api/promotions/:id/usage
 * @desc    Get promotion usage report
 * @access  Admin
 */
router.get(
  '/:id/usage',
  authenticate,
  requireAdmin,
  validate(paramSchemas.idParam, 'params'),
  validate(Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso()
  }), 'query'),
  promotionController.getPromotionUsageReport
);

module.exports = router;
