/**
 * Setting Routes
 * Requirements: 13.1, 13.2, 13.3, 13.4
 */

const express = require('express');
const router = express.Router();
const settingController = require('../controllers/setting.controller');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleGuard');
const { validate, Joi } = require('../middleware/validator');

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

/**
 * @route   GET /api/settings
 * @desc    Get all settings
 * @access  Admin
 */
router.get('/', settingController.getAllSettings);

/**
 * @route   GET /api/settings/restaurant
 * @desc    Get restaurant info
 * @access  Admin
 */
router.get('/restaurant', settingController.getRestaurantInfo);

/**
 * @route   PUT /api/settings/restaurant
 * @desc    Update restaurant info
 * @access  Admin
 */
router.put(
  '/restaurant',
  validate(Joi.object({
    name: Joi.string().trim().max(200),
    address: Joi.string().trim().max(500),
    phone: Joi.string().trim().max(20),
    email: Joi.string().email().max(100),
    logo: Joi.string().uri().max(500).allow(''),
    operatingHours: Joi.object().pattern(
      Joi.string(),
      Joi.object({
        open: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        close: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        isOpen: Joi.boolean()
      })
    )
  })),
  settingController.updateRestaurantInfo
);

/**
 * @route   GET /api/settings/tax
 * @desc    Get tax settings
 * @access  Admin
 */
router.get('/tax', settingController.getTaxSettings);

/**
 * @route   PUT /api/settings/tax
 * @desc    Update tax settings
 * @access  Admin
 */
router.put(
  '/tax',
  validate(Joi.object({
    vatPercent: Joi.number().min(0).max(100),
    serviceChargePercent: Joi.number().min(0).max(100)
  })),
  settingController.updateTaxSettings
);

/**
 * @route   GET /api/settings/notifications
 * @desc    Get notification settings
 * @access  Admin
 */
router.get('/notifications', settingController.getNotificationSettings);

/**
 * @route   PUT /api/settings/notifications
 * @desc    Update notification settings
 * @access  Admin
 */
router.put(
  '/notifications',
  validate(Joi.object({
    newOrder: Joi.boolean(),
    lowStock: Joi.boolean(),
    newReview: Joi.boolean(),
    payment: Joi.boolean()
  })),
  settingController.updateNotificationSettings
);

module.exports = router;
