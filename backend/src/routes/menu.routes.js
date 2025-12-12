/**
 * Menu Routes
 * Defines routes for menu management
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 */

const express = require('express');
const router = express.Router();

const menuController = require('../controllers/menu.controller');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleGuard');
const { validate, menuSchemas, paramSchemas, Joi } = require('../middleware/validator');

/**
 * @route   GET /api/menu
 * @desc    Get menu items grouped by category
 * @access  Public
 */
router.get(
  '/',
  optionalAuth,
  menuController.getMenu
);

/**
 * @route   GET /api/menu/items
 * @desc    Get menu items with filtering and pagination
 * @access  Public
 */
router.get(
  '/items',
  optionalAuth,
  validate(menuSchemas.queryMenu, 'query'),
  menuController.getMenuItems
);

/**
 * @route   GET /api/menu/search
 * @desc    Search menu items by name/description
 * @access  Public
 */
router.get(
  '/search',
  optionalAuth,
  validate(Joi.object({
    q: Joi.string().trim().min(1).max(100).required(),
    limit: Joi.number().integer().min(1).max(50).default(20),
    includeUnavailable: Joi.string().valid('true', 'false')
  }), 'query'),
  menuController.searchMenu
);

/**
 * @route   GET /api/menu/popular
 * @desc    Get popular menu items
 * @access  Public
 */
router.get(
  '/popular',
  optionalAuth,
  validate(Joi.object({
    limit: Joi.number().integer().min(1).max(50).default(10)
  }), 'query'),
  menuController.getPopularItems
);

/**
 * @route   GET /api/menu/new
 * @desc    Get new menu items
 * @access  Public
 */
router.get(
  '/new',
  optionalAuth,
  validate(Joi.object({
    limit: Joi.number().integer().min(1).max(50).default(10)
  }), 'query'),
  menuController.getNewItems
);

/**
 * @route   PATCH /api/menu/bulk-status
 * @desc    Bulk update menu items status
 * @access  Admin
 */
router.patch(
  '/bulk-status',
  authenticate,
  requireAdmin,
  validate(Joi.object({
    itemIds: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).min(1).required(),
    status: Joi.string().valid('available', 'out_of_stock', 'suspended').required()
  })),
  menuController.bulkUpdateStatus
);

/**
 * @route   GET /api/menu/:id
 * @desc    Get single menu item by ID
 * @access  Public
 */
router.get(
  '/:id',
  optionalAuth,
  validate(paramSchemas.idParam, 'params'),
  menuController.getMenuItem
);

/**
 * @route   POST /api/menu
 * @desc    Create new menu item
 * @access  Admin
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(menuSchemas.createMenuItem),
  menuController.createMenuItem
);

/**
 * @route   PUT /api/menu/:id
 * @desc    Update menu item
 * @access  Admin
 */
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validate(paramSchemas.idParam, 'params'),
  validate(menuSchemas.updateMenuItem),
  menuController.updateMenuItem
);

/**
 * @route   PATCH /api/menu/:id/status
 * @desc    Update menu item status
 * @access  Admin
 */
router.patch(
  '/:id/status',
  authenticate,
  requireAdmin,
  validate(paramSchemas.idParam, 'params'),
  validate(Joi.object({
    status: Joi.string().valid('available', 'out_of_stock', 'suspended').required()
  })),
  menuController.updateMenuItemStatus
);

/**
 * @route   DELETE /api/menu/:id
 * @desc    Soft delete menu item (set status to suspended)
 * @access  Admin
 */
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  validate(paramSchemas.idParam, 'params'),
  menuController.deleteMenuItem
);

module.exports = router;
