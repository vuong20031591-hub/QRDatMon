/**
 * Cart Routes
 * Defines routes for cart management
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

const express = require('express');
const router = express.Router();

const cartController = require('../controllers/cart.controller');
const { authenticate } = require('../middleware/auth');
const { validate, cartSchemas, paramSchemas, Joi } = require('../middleware/validator');

// All cart routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/cart
 * @desc    Get user's cart (uses active table session)
 * @access  Private
 */
router.get(
  '/',
  cartController.getCart
);

/**
 * @route   GET /api/cart/totals
 * @desc    Get cart totals only
 * @access  Private
 */
router.get(
  '/totals',
  cartController.getCartTotals
);

/**
 * @route   GET /api/cart/table/:tableId
 * @desc    Get cart for specific table
 * @access  Private
 */
router.get(
  '/table/:tableId',
  validate(Joi.object({
    tableId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
  }), 'params'),
  cartController.getCartForTable
);

/**
 * @route   POST /api/cart/items
 * @desc    Add item to cart (uses active table session)
 * @access  Private
 */
router.post(
  '/items',
  validate(cartSchemas.addToCart),
  cartController.addToCart
);

/**
 * @route   POST /api/cart/table/:tableId/items
 * @desc    Add item to cart for specific table
 * @access  Private
 */
router.post(
  '/table/:tableId/items',
  validate(Joi.object({
    tableId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
  }), 'params'),
  validate(cartSchemas.addToCart),
  cartController.addToCartForTable
);

/**
 * @route   PUT /api/cart/items/:itemId
 * @desc    Update cart item (uses active table session)
 * @access  Private
 */
router.put(
  '/items/:itemId',
  validate(Joi.object({
    itemId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
  }), 'params'),
  validate(cartSchemas.updateCartItem),
  cartController.updateCartItem
);

/**
 * @route   PUT /api/cart/table/:tableId/items/:itemId
 * @desc    Update cart item for specific table
 * @access  Private
 */
router.put(
  '/table/:tableId/items/:itemId',
  validate(Joi.object({
    tableId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    itemId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
  }), 'params'),
  validate(cartSchemas.updateCartItem),
  cartController.updateCartItemForTable
);

/**
 * @route   DELETE /api/cart/items/:itemId
 * @desc    Remove item from cart (uses active table session)
 * @access  Private
 */
router.delete(
  '/items/:itemId',
  validate(Joi.object({
    itemId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
  }), 'params'),
  cartController.removeCartItem
);

/**
 * @route   DELETE /api/cart/table/:tableId/items/:itemId
 * @desc    Remove item from cart for specific table
 * @access  Private
 */
router.delete(
  '/table/:tableId/items/:itemId',
  validate(Joi.object({
    tableId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    itemId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
  }), 'params'),
  cartController.removeCartItemForTable
);

/**
 * @route   DELETE /api/cart
 * @desc    Clear all items from cart (uses active table session)
 * @access  Private
 */
router.delete(
  '/',
  cartController.clearCart
);

/**
 * @route   DELETE /api/cart/table/:tableId
 * @desc    Clear cart for specific table
 * @access  Private
 */
router.delete(
  '/table/:tableId',
  validate(Joi.object({
    tableId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
  }), 'params'),
  cartController.clearCartForTable
);

module.exports = router;
