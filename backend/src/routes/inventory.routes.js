/**
 * Inventory Routes
 * Defines routes for inventory management
 * Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6
 */

const express = require('express');
const router = express.Router();

const inventoryController = require('../controllers/inventory.controller');
const { authenticate } = require('../middleware/auth');
const { requireAdmin, requireStaff } = require('../middleware/roleGuard');
const { validate, paramSchemas, Joi } = require('../middleware/validator');

/**
 * @route   GET /api/inventory
 * @desc    Get all inventory items
 * @access  Staff/Admin
 */
router.get(
  '/',
  authenticate,
  requireStaff,
  validate(Joi.object({
    lowStock: Joi.string().valid('true', 'false'),
    outOfStock: Joi.string().valid('true', 'false'),
    search: Joi.string().trim().max(100),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().valid('quantity', 'createdAt', 'updatedAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc')
  }), 'query'),
  inventoryController.getInventory
);

/**
 * @route   GET /api/inventory/low-stock
 * @desc    Get low stock items
 * @access  Staff/Admin
 */
router.get(
  '/low-stock',
  authenticate,
  requireStaff,
  inventoryController.checkLowStock
);

/**
 * @route   GET /api/inventory/report
 * @desc    Get inventory report
 * @access  Admin
 */
router.get(
  '/report',
  authenticate,
  requireAdmin,
  validate(Joi.object({
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso()
  }), 'query'),
  inventoryController.getInventoryReport
);

/**
 * @route   GET /api/inventory/logs
 * @desc    Get all inventory logs
 * @access  Admin
 */
router.get(
  '/logs',
  authenticate,
  requireAdmin,
  validate(Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  }), 'query'),
  inventoryController.getInventoryLogs
);

/**
 * @route   POST /api/inventory
 * @desc    Add inventory for a menu item
 * @access  Admin
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(Joi.object({
    menuItemId: Joi.string().required(),
    quantity: Joi.number().integer().min(0).default(0),
    minThreshold: Joi.number().integer().min(0).default(10),
    unit: Joi.string().trim().max(50)
  })),
  inventoryController.addInventory
);

/**
 * @route   GET /api/inventory/item/:menuItemId
 * @desc    Get inventory by menu item ID
 * @access  Staff/Admin
 */
router.get(
  '/item/:menuItemId',
  authenticate,
  requireStaff,
  validate(Joi.object({
    menuItemId: Joi.string().required()
  }), 'params'),
  inventoryController.getInventoryByMenuItem
);

/**
 * @route   PATCH /api/inventory/:menuItemId/stock
 * @desc    Update stock (restock or adjust)
 * @access  Staff/Admin
 */
router.patch(
  '/:menuItemId/stock',
  authenticate,
  requireStaff,
  validate(Joi.object({
    menuItemId: Joi.string().required()
  }), 'params'),
  validate(Joi.object({
    quantityChange: Joi.number().integer().required(),
    reason: Joi.string().trim().max(500),
    referenceType: Joi.string().valid('manual', 'restock', 'adjustment')
  })),
  inventoryController.updateStock
);

/**
 * @route   GET /api/inventory/:menuItemId/logs
 * @desc    Get inventory logs for a menu item
 * @access  Admin
 */
router.get(
  '/:menuItemId/logs',
  authenticate,
  requireAdmin,
  validate(Joi.object({
    menuItemId: Joi.string().required()
  }), 'params'),
  validate(Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  }), 'query'),
  inventoryController.getInventoryLogs
);

/**
 * @route   PATCH /api/inventory/:menuItemId/settings
 * @desc    Update inventory settings
 * @access  Admin
 */
router.patch(
  '/:menuItemId/settings',
  authenticate,
  requireAdmin,
  validate(Joi.object({
    menuItemId: Joi.string().required()
  }), 'params'),
  validate(Joi.object({
    minThreshold: Joi.number().integer().min(0),
    unit: Joi.string().trim().max(50),
    autoUpdateStatus: Joi.boolean()
  })),
  inventoryController.updateInventorySettings
);

module.exports = router;
