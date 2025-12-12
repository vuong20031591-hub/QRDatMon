/**
 * Cart Controller
 * Handles cart-related HTTP requests
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

const cartService = require('../services/cart.service');
const { asyncHandler } = require('../middleware/errorHandler');
const { ok, created, noContent } = require('../utils/response');

/**
 * Get user's cart
 * GET /api/cart
 * Uses active table session to determine which cart to retrieve
 */
const getCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const cart = await cartService.getCartBySession(userId);

  return ok(res, { cart }, 'Cart retrieved successfully');
});

/**
 * Get cart for specific table
 * GET /api/cart/table/:tableId
 */
const getCartForTable = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { tableId } = req.params;

  const cart = await cartService.getCart(userId, tableId);

  return ok(res, { cart }, 'Cart retrieved successfully');
});

/**
 * Add item to cart
 * POST /api/cart/items
 * Uses active table session
 */
const addToCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { menuItem, combo, quantity, note, toppings } = req.body;

  const cart = await cartService.addToCartBySession(userId, {
    menuItem,
    combo,
    quantity,
    note,
    toppings
  });

  return created(res, { cart }, 'Item added to cart successfully');
});

/**
 * Add item to cart for specific table
 * POST /api/cart/table/:tableId/items
 */
const addToCartForTable = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { tableId } = req.params;
  const { menuItem, combo, quantity, note, toppings } = req.body;

  const cart = await cartService.addToCart(userId, tableId, {
    menuItem,
    combo,
    quantity,
    note,
    toppings
  });

  return created(res, { cart }, 'Item added to cart successfully');
});

/**
 * Update cart item
 * PUT /api/cart/items/:itemId
 * Uses active table session
 */
const updateCartItem = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { itemId } = req.params;
  const { quantity, note, toppings } = req.body;

  const cart = await cartService.updateCartItemBySession(userId, itemId, {
    quantity,
    note,
    toppings
  });

  return ok(res, { cart }, 'Cart item updated successfully');
});

/**
 * Update cart item for specific table
 * PUT /api/cart/table/:tableId/items/:itemId
 */
const updateCartItemForTable = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { tableId, itemId } = req.params;
  const { quantity, note, toppings } = req.body;

  const cart = await cartService.updateCartItem(userId, tableId, itemId, {
    quantity,
    note,
    toppings
  });

  return ok(res, { cart }, 'Cart item updated successfully');
});

/**
 * Remove item from cart
 * DELETE /api/cart/items/:itemId
 * Uses active table session
 */
const removeCartItem = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { itemId } = req.params;

  const cart = await cartService.removeCartItemBySession(userId, itemId);

  return ok(res, { cart }, 'Cart item removed successfully');
});

/**
 * Remove item from cart for specific table
 * DELETE /api/cart/table/:tableId/items/:itemId
 */
const removeCartItemForTable = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { tableId, itemId } = req.params;

  const cart = await cartService.removeCartItem(userId, tableId, itemId);

  return ok(res, { cart }, 'Cart item removed successfully');
});

/**
 * Clear all items from cart
 * DELETE /api/cart
 * Uses active table session
 */
const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const cart = await cartService.clearCartBySession(userId);

  return ok(res, { cart }, 'Cart cleared successfully');
});

/**
 * Clear cart for specific table
 * DELETE /api/cart/table/:tableId
 */
const clearCartForTable = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { tableId } = req.params;

  const cart = await cartService.clearCart(userId, tableId);

  return ok(res, { cart }, 'Cart cleared successfully');
});

/**
 * Get cart totals only
 * GET /api/cart/totals
 * Useful for quick price checks without full cart details
 */
const getCartTotals = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const cart = await cartService.getCartBySession(userId);

  return ok(res, { totals: cart.totals }, 'Cart totals retrieved successfully');
});

module.exports = {
  getCart,
  getCartForTable,
  addToCart,
  addToCartForTable,
  updateCartItem,
  updateCartItemForTable,
  removeCartItem,
  removeCartItemForTable,
  clearCart,
  clearCartForTable,
  getCartTotals
};
