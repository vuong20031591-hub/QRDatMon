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
  const { menuItem, menuItemId, combo, quantity, note, toppings } = req.body;

  // Support both menuItem and menuItemId (mobile compatibility)
  const resolvedMenuItem = menuItem || menuItemId;

  const cart = await cartService.addToCartBySession(userId, {
    menuItem: resolvedMenuItem,
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
  const { menuItem, menuItemId, combo, quantity, note, toppings } = req.body;

  // Support both menuItem and menuItemId (mobile compatibility)
  const resolvedMenuItem = menuItem || menuItemId;

  const cart = await cartService.addToCart(userId, tableId, {
    menuItem: resolvedMenuItem,
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
 * Uses active table session OR tableId query param
 */
const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { tableId } = req.query;

  let cart;
  if (tableId) {
    // If tableId provided in query, resolve it (could be ObjectId or tableNumber)
    const { Table, Cart } = require('../models');
    let resolvedTableId = tableId;
    
    // Check if it's a tableNumber (not ObjectId format)
    if (!tableId.match(/^[0-9a-fA-F]{24}$/)) {
      const table = await Table.findOne({ tableNumber: tableId });
      if (!table) {
        return res.status(404).json({
          status: 'error',
          message: `Table ${tableId} not found`
        });
      }
      resolvedTableId = table._id.toString();
    }
    
    // Try to clear cart, if no session just delete cart directly
    try {
      cart = await cartService.clearCart(userId, resolvedTableId);
    } catch (error) {
      // If user has no session at this table, just delete the cart directly
      if (error.code === 'E2003' || error.message.includes('must join this table')) {
        await Cart.deleteOne({ user: userId, table: resolvedTableId });
        cart = { items: [], totals: { subtotal: 0, total: 0, itemCount: 0 } };
      } else {
        throw error;
      }
    }
  } else {
    // Otherwise use active session
    cart = await cartService.clearCartBySession(userId);
  }

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
