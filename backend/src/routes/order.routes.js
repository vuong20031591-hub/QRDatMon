/**
 * Order Routes
 * Defines routes for order management
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7
 */

const express = require('express');
const router = express.Router();

const orderController = require('../controllers/order.controller');
const { authenticate } = require('../middleware/auth');
const { requireStaff, requireKitchen, attachStaffInfo } = require('../middleware/roleGuard');
const { validate, orderSchemas, paramSchemas, Joi } = require('../middleware/validator');

// All order routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/orders
 * @desc    Create order from cart
 * @access  Private
 */
router.post(
  '/',
  validate(orderSchemas.createOrder),
  orderController.createOrder
);

/**
 * @route   GET /api/orders/my-session
 * @desc    Get orders for current table session
 * @access  Private
 */
router.get(
  '/my-session',
  orderController.getOrdersBySession
);

/**
 * @route   GET /api/orders/history
 * @desc    Get user's order history
 * @access  Private
 */
router.get(
  '/history',
  validate(Joi.object({
    status: Joi.string().valid('pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled'),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  }), 'query'),
  orderController.getOrderHistory
);

/**
 * @route   GET /api/orders/kitchen
 * @desc    Get kitchen orders (for kitchen display)
 * @access  Kitchen Staff
 */
router.get(
  '/kitchen',
  requireKitchen,
  validate(Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(50)
  }), 'query'),
  orderController.getKitchenOrders
);

/**
 * @route   GET /api/orders/bill/:billId
 * @desc    Get orders by bill ID
 * @access  Private
 */
router.get(
  '/bill/:billId',
  validate(Joi.object({
    billId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
  }), 'params'),
  orderController.getOrdersByBill
);

/**
 * @route   GET /api/orders
 * @desc    Get all orders with filters (Staff/Admin only)
 * @access  Staff
 */
router.get(
  '/',
  requireStaff,
  validate(orderSchemas.queryOrders, 'query'),
  orderController.getOrders
);

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by ID
 * @access  Private (Owner or Staff)
 */
router.get(
  '/:id',
  attachStaffInfo,
  validate(paramSchemas.idParam, 'params'),
  orderController.getOrderById
);

/**
 * @route   PATCH /api/orders/:id/confirm
 * @desc    Confirm order
 * @access  Staff
 */
router.patch(
  '/:id/confirm',
  requireStaff,
  validate(paramSchemas.idParam, 'params'),
  orderController.confirmOrder
);

/**
 * @route   PATCH /api/orders/:id/status
 * @desc    Update order status
 * @access  Staff
 */
router.patch(
  '/:id/status',
  requireStaff,
  validate(paramSchemas.idParam, 'params'),
  validate(orderSchemas.updateOrderStatus),
  orderController.updateOrderStatus
);

/**
 * @route   PATCH /api/orders/:id/cancel
 * @desc    Cancel order
 * @access  Staff
 */
router.patch(
  '/:id/cancel',
  requireStaff,
  validate(paramSchemas.idParam, 'params'),
  validate(Joi.object({
    reason: Joi.string().trim().min(1).max(500).required()
  })),
  orderController.cancelOrder
);

/**
 * @route   PATCH /api/orders/:id/items/:itemId/status
 * @desc    Update order item status
 * @access  Kitchen/Staff
 */
router.patch(
  '/:id/items/:itemId/status',
  requireKitchen,
  validate(Joi.object({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    itemId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
  }), 'params'),
  validate(orderSchemas.updateOrderItemStatus),
  orderController.updateOrderItemStatus
);

/**
 * @route   PATCH /api/orders/:id/items/:itemId/cancel
 * @desc    Cancel order item
 * @access  Staff
 */
router.patch(
  '/:id/items/:itemId/cancel',
  requireStaff,
  validate(Joi.object({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    itemId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
  }), 'params'),
  validate(Joi.object({
    reason: Joi.string().trim().min(1).max(500).required()
  })),
  orderController.cancelOrderItem
);

module.exports = router;
