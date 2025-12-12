/**
 * Cart Service
 * Handles cart CRUD operations and total calculations
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

const { Cart, MenuItem, Combo, TableSession, Bill, Setting } = require('../models');
const {
  NotFoundError,
  ValidationError,
  ForbiddenError
} = require('../utils/errors');
const { MENU_ITEM_STATUS, BILL_STATUS } = require('../utils/constants');

/**
 * Default tax rates (fallback if settings not configured)
 */
const DEFAULT_TAX_RATES = {
  SERVICE_CHARGE_PERCENT: 5, // 5%
  VAT_PERCENT: 10 // 10%
};

/**
 * Get tax rates from Settings model with caching
 * @returns {Promise<Object>} Tax rates
 */
let taxRatesCache = null;
let taxRatesCacheTime = 0;
const TAX_RATES_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getTaxRates = async () => {
  const now = Date.now();
  
  // Return cached value if still valid
  if (taxRatesCache && (now - taxRatesCacheTime) < TAX_RATES_CACHE_TTL) {
    return taxRatesCache;
  }

  try {
    const [serviceCharge, vat] = await Promise.all([
      Setting.getValue('SERVICE_CHARGE_PERCENT', DEFAULT_TAX_RATES.SERVICE_CHARGE_PERCENT),
      Setting.getValue('VAT_PERCENT', DEFAULT_TAX_RATES.VAT_PERCENT)
    ]);

    taxRatesCache = {
      SERVICE_CHARGE_PERCENT: Number(serviceCharge),
      VAT_PERCENT: Number(vat)
    };
    taxRatesCacheTime = now;

    return taxRatesCache;
  } catch (error) {
    console.error('Failed to load tax rates from settings:', error.message);
    return DEFAULT_TAX_RATES;
  }
};

/**
 * Clear tax rates cache (call when settings are updated)
 */
const clearTaxRatesCache = () => {
  taxRatesCache = null;
  taxRatesCacheTime = 0;
};

/**
 * Get user's cart for a specific table
 * @param {string} userId - User ID
 * @param {string} tableId - Table ID
 * @returns {Promise<Object>} Cart with items and totals
 */
const getCart = async (userId, tableId) => {
  // Verify user has an active session at this table
  const session = await verifyTableSession(userId, tableId);

  // Find or create cart
  let cart = await Cart.findOne({ user: userId, table: tableId })
    .populate({
      path: 'items.menuItem',
      select: 'name imageUrl price status toppingGroups'
    })
    .populate({
      path: 'items.combo',
      select: 'name imageUrl price status'
    });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      table: tableId,
      items: []
    });
  }

  return formatCart(cart);
};

/**
 * Get cart by user's active session (auto-detect table)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Cart with items and totals
 */
const getCartBySession = async (userId) => {
  const session = await TableSession.findOne({
    user: userId,
    isActive: true
  });

  if (!session) {
    throw new ValidationError('No active table session found. Please scan a QR code to join a table.');
  }

  return getCart(userId, session.table.toString());
};

/**
 * Add item to cart
 * @param {string} userId - User ID
 * @param {string} tableId - Table ID
 * @param {Object} itemData - Item data to add
 * @returns {Promise<Object>} Updated cart
 */
const addToCart = async (userId, tableId, itemData) => {
  const { menuItem, combo, quantity, note, toppings } = itemData;

  // Verify user has an active session at this table
  await verifyTableSession(userId, tableId);

  let itemDetails;
  let unitPrice;

  if (menuItem) {
    // Get menu item details
    const menuItemDoc = await MenuItem.findById(menuItem);
    if (!menuItemDoc) {
      throw new NotFoundError('Menu item not found');
    }

    if (menuItemDoc.status !== MENU_ITEM_STATUS.AVAILABLE) {
      throw new ValidationError(`"${menuItemDoc.name}" is currently unavailable`);
    }

    unitPrice = menuItemDoc.price;
    itemDetails = { menuItem: menuItemDoc._id };

    // Validate and calculate topping prices
    if (toppings && toppings.length > 0) {
      const validatedToppings = validateAndCalculateToppings(menuItemDoc, toppings);
      itemDetails.toppings = validatedToppings.toppings;
      unitPrice += validatedToppings.totalToppingPrice;
    }
  } else if (combo) {
    // Get combo details
    const comboDoc = await Combo.findById(combo);
    if (!comboDoc) {
      throw new NotFoundError('Combo not found');
    }

    if (!comboDoc.isActive) {
      throw new ValidationError(`"${comboDoc.name}" is currently unavailable`);
    }

    unitPrice = comboDoc.price;
    itemDetails = { combo: comboDoc._id };
  } else {
    throw new ValidationError('Either menuItem or combo must be provided');
  }

  // Find or create cart
  let cart = await Cart.findOne({ user: userId, table: tableId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      table: tableId,
      items: []
    });
  }

  // Check if same item (with same toppings and note) already exists in cart
  const existingItemIndex = findExistingCartItem(cart.items, itemDetails, note, toppings);

  if (existingItemIndex !== -1) {
    // Update quantity of existing item
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    // Add new item
    cart.items.push({
      ...itemDetails,
      quantity,
      unitPrice,
      note: note || '',
      toppings: itemDetails.toppings || []
    });
  }

  await cart.save();

  // Reload cart with populated data
  return getCart(userId, tableId);
};

/**
 * Add item to cart using active session
 * @param {string} userId - User ID
 * @param {Object} itemData - Item data to add
 * @returns {Promise<Object>} Updated cart
 */
const addToCartBySession = async (userId, itemData) => {
  const session = await TableSession.findOne({
    user: userId,
    isActive: true
  });

  if (!session) {
    throw new ValidationError('No active table session found. Please scan a QR code to join a table.');
  }

  return addToCart(userId, session.table.toString(), itemData);
};

/**
 * Update cart item
 * @param {string} userId - User ID
 * @param {string} tableId - Table ID
 * @param {string} itemId - Cart item ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Updated cart
 */
const updateCartItem = async (userId, tableId, itemId, updateData) => {
  const { quantity, note, toppings } = updateData;

  // Verify user has an active session at this table
  await verifyTableSession(userId, tableId);

  const cart = await Cart.findOne({ user: userId, table: tableId });

  if (!cart) {
    throw new NotFoundError('Cart not found');
  }

  const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);

  if (itemIndex === -1) {
    throw new NotFoundError('Cart item not found');
  }

  const cartItem = cart.items[itemIndex];

  // Update quantity if provided
  if (quantity !== undefined) {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      cart.items.splice(itemIndex, 1);
    } else {
      cartItem.quantity = quantity;
    }
  }

  // Update note if provided
  if (note !== undefined) {
    cartItem.note = note;
  }

  // Update toppings if provided
  if (toppings !== undefined && cartItem.menuItem) {
    const menuItemDoc = await MenuItem.findById(cartItem.menuItem);
    if (menuItemDoc) {
      const validatedToppings = validateAndCalculateToppings(menuItemDoc, toppings);
      cartItem.toppings = validatedToppings.toppings;
      // Recalculate unit price with new toppings
      cartItem.unitPrice = menuItemDoc.price + validatedToppings.totalToppingPrice;
    }
  }

  await cart.save();

  return getCart(userId, tableId);
};

/**
 * Update cart item using active session
 * @param {string} userId - User ID
 * @param {string} itemId - Cart item ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Updated cart
 */
const updateCartItemBySession = async (userId, itemId, updateData) => {
  const session = await TableSession.findOne({
    user: userId,
    isActive: true
  });

  if (!session) {
    throw new ValidationError('No active table session found. Please scan a QR code to join a table.');
  }

  return updateCartItem(userId, session.table.toString(), itemId, updateData);
};

/**
 * Remove item from cart
 * @param {string} userId - User ID
 * @param {string} tableId - Table ID
 * @param {string} itemId - Cart item ID
 * @returns {Promise<Object>} Updated cart
 */
const removeCartItem = async (userId, tableId, itemId) => {
  // Verify user has an active session at this table
  await verifyTableSession(userId, tableId);

  const cart = await Cart.findOne({ user: userId, table: tableId });

  if (!cart) {
    throw new NotFoundError('Cart not found');
  }

  const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);

  if (itemIndex === -1) {
    throw new NotFoundError('Cart item not found');
  }

  cart.items.splice(itemIndex, 1);
  await cart.save();

  return getCart(userId, tableId);
};

/**
 * Remove item from cart using active session
 * @param {string} userId - User ID
 * @param {string} itemId - Cart item ID
 * @returns {Promise<Object>} Updated cart
 */
const removeCartItemBySession = async (userId, itemId) => {
  const session = await TableSession.findOne({
    user: userId,
    isActive: true
  });

  if (!session) {
    throw new ValidationError('No active table session found. Please scan a QR code to join a table.');
  }

  return removeCartItem(userId, session.table.toString(), itemId);
};

/**
 * Clear all items from cart
 * @param {string} userId - User ID
 * @param {string} tableId - Table ID
 * @returns {Promise<Object>} Empty cart
 */
const clearCart = async (userId, tableId) => {
  // Verify user has an active session at this table
  await verifyTableSession(userId, tableId);

  const cart = await Cart.findOne({ user: userId, table: tableId });

  if (cart) {
    cart.items = [];
    await cart.save();
  }

  return getCart(userId, tableId);
};

/**
 * Clear cart using active session
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Empty cart
 */
const clearCartBySession = async (userId) => {
  const session = await TableSession.findOne({
    user: userId,
    isActive: true
  });

  if (!session) {
    throw new ValidationError('No active table session found. Please scan a QR code to join a table.');
  }

  return clearCart(userId, session.table.toString());
};

/**
 * Calculate cart totals (sync version with provided rates)
 * @param {Array} items - Cart items
 * @param {Object} taxRates - Tax rates object
 * @returns {Object} Calculated totals
 */
const calculateCartTotalSync = (items, taxRates) => {
  // Calculate subtotal (sum of all items * quantity)
  const subtotal = items.reduce((sum, item) => {
    const itemTotal = item.unitPrice * item.quantity;
    return sum + itemTotal;
  }, 0);

  // Calculate service charge
  const serviceChargeAmount = Math.round(subtotal * (taxRates.SERVICE_CHARGE_PERCENT / 100));

  // Calculate VAT (on subtotal + service charge)
  const vatAmount = Math.round((subtotal + serviceChargeAmount) * (taxRates.VAT_PERCENT / 100));

  // Calculate grand total
  const total = subtotal + serviceChargeAmount + vatAmount;

  return {
    subtotal,
    serviceChargePercent: taxRates.SERVICE_CHARGE_PERCENT,
    serviceChargeAmount,
    vatPercent: taxRates.VAT_PERCENT,
    vatAmount,
    total,
    itemCount: items.reduce((count, item) => count + item.quantity, 0)
  };
};

/**
 * Calculate cart totals (async version - fetches rates from settings)
 * @param {Array} items - Cart items
 * @returns {Promise<Object>} Calculated totals
 */
const calculateCartTotal = async (items) => {
  const taxRates = await getTaxRates();
  return calculateCartTotalSync(items, taxRates);
};

/**
 * Delete cart when order is placed
 * @param {string} userId - User ID
 * @param {string} tableId - Table ID
 * @returns {Promise<void>}
 */
const deleteCart = async (userId, tableId) => {
  await Cart.findOneAndDelete({ user: userId, table: tableId });
};

// ============================================
// Helper Functions
// ============================================

/**
 * Verify user has an active session at the table
 * @param {string} userId - User ID
 * @param {string} tableId - Table ID
 * @returns {Promise<Object>} Active session
 */
const verifyTableSession = async (userId, tableId) => {
  const session = await TableSession.findOne({
    user: userId,
    table: tableId,
    isActive: true
  });

  if (!session) {
    throw new ForbiddenError('You must join this table before accessing the cart');
  }

  // Verify bill is still open
  if (session.bill) {
    const bill = await Bill.findById(session.bill);
    if (bill && bill.status !== BILL_STATUS.OPEN) {
      throw new ForbiddenError('Cannot modify cart - bill is no longer open');
    }
  }

  return session;
};

/**
 * Validate toppings and calculate total topping price
 * @param {Object} menuItem - Menu item document
 * @param {Array} toppings - Array of topping selections
 * @returns {Object} Validated toppings and total price
 */
const validateAndCalculateToppings = (menuItem, toppings) => {
  if (!menuItem.toppingGroups || menuItem.toppingGroups.length === 0) {
    return { toppings: [], totalToppingPrice: 0 };
  }

  const validatedToppings = [];
  let totalToppingPrice = 0;

  // Group toppings by toppingGroupId for validation
  const toppingsByGroup = {};
  toppings.forEach(t => {
    if (!toppingsByGroup[t.toppingGroupId]) {
      toppingsByGroup[t.toppingGroupId] = [];
    }
    toppingsByGroup[t.toppingGroupId].push(t);
  });

  // Validate each topping group
  menuItem.toppingGroups.forEach(group => {
    const groupId = group._id.toString();
    const selectedToppings = toppingsByGroup[groupId] || [];

    // Check required groups
    if (group.isRequired && selectedToppings.length === 0) {
      throw new ValidationError(`Topping group "${group.name}" is required`);
    }

    // Check min/max selection
    const totalSelected = selectedToppings.reduce((sum, t) => sum + (t.quantity || 1), 0);

    if (totalSelected < group.minSelect) {
      throw new ValidationError(
        `Topping group "${group.name}" requires at least ${group.minSelect} selection(s)`
      );
    }

    if (totalSelected > group.maxSelect) {
      throw new ValidationError(
        `Topping group "${group.name}" allows maximum ${group.maxSelect} selection(s)`
      );
    }

    // Validate and add each topping
    selectedToppings.forEach(selectedTopping => {
      const topping = group.toppings.find(
        t => t._id.toString() === selectedTopping.toppingId
      );

      if (!topping) {
        throw new ValidationError(`Invalid topping ID: ${selectedTopping.toppingId}`);
      }

      if (!topping.isAvailable) {
        throw new ValidationError(`Topping "${topping.name}" is currently unavailable`);
      }

      const quantity = selectedTopping.quantity || 1;
      const toppingPrice = topping.extraPrice * quantity;
      totalToppingPrice += toppingPrice;

      validatedToppings.push({
        toppingGroupId: group._id,
        toppingId: topping._id,
        name: topping.name,
        quantity,
        price: topping.extraPrice
      });
    });
  });

  return { toppings: validatedToppings, totalToppingPrice };
};

/**
 * Find existing cart item with same properties
 * @param {Array} items - Cart items
 * @param {Object} itemDetails - Item details (menuItem or combo)
 * @param {string} note - Note
 * @param {Array} toppings - Toppings
 * @returns {number} Index of existing item or -1
 */
const findExistingCartItem = (items, itemDetails, note, toppings) => {
  return items.findIndex(item => {
    // Check if same menu item or combo
    if (itemDetails.menuItem) {
      if (!item.menuItem || item.menuItem.toString() !== itemDetails.menuItem.toString()) {
        return false;
      }
    } else if (itemDetails.combo) {
      if (!item.combo || item.combo.toString() !== itemDetails.combo.toString()) {
        return false;
      }
    }

    // Check if same note
    if ((item.note || '') !== (note || '')) {
      return false;
    }

    // Check if same toppings
    const itemToppings = item.toppings || [];
    const newToppings = toppings || [];

    if (itemToppings.length !== newToppings.length) {
      return false;
    }

    // Sort and compare toppings
    const sortToppings = (arr) => arr.slice().sort((a, b) =>
      `${a.toppingGroupId}-${a.toppingId}`.localeCompare(`${b.toppingGroupId}-${b.toppingId}`)
    );

    const sortedItemToppings = sortToppings(itemToppings);
    const sortedNewToppings = sortToppings(newToppings);

    return sortedItemToppings.every((t, i) => {
      const newT = sortedNewToppings[i];
      return t.toppingGroupId?.toString() === newT.toppingGroupId?.toString() &&
             t.toppingId?.toString() === newT.toppingId?.toString() &&
             (t.quantity || 1) === (newT.quantity || 1);
    });
  });
};

/**
 * Format cart for API response
 * @param {Object} cart - Cart document
 * @param {Object} taxRates - Tax rates (optional, will use defaults if not provided)
 * @returns {Object} Formatted cart with totals
 */
const formatCartSync = (cart, taxRates = DEFAULT_TAX_RATES) => {
  const items = cart.items.map(item => ({
    id: item._id,
    menuItem: item.menuItem ? {
      id: item.menuItem._id,
      name: item.menuItem.name,
      imageUrl: item.menuItem.imageUrl,
      price: item.menuItem.price,
      status: item.menuItem.status
    } : null,
    combo: item.combo ? {
      id: item.combo._id,
      name: item.combo.name,
      imageUrl: item.combo.imageUrl,
      price: item.combo.price
    } : null,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    itemTotal: item.unitPrice * item.quantity,
    note: item.note || '',
    toppings: (item.toppings || []).map(t => ({
      toppingGroupId: t.toppingGroupId,
      toppingId: t.toppingId,
      name: t.name,
      quantity: t.quantity,
      price: t.price,
      subtotal: t.price * t.quantity
    })),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  }));

  const totals = calculateCartTotalSync(items, taxRates);

  return {
    id: cart._id,
    userId: cart.user,
    tableId: cart.table,
    items,
    totals,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt
  };
};

/**
 * Format cart for API response (async version)
 * @param {Object} cart - Cart document
 * @returns {Promise<Object>} Formatted cart with totals
 */
const formatCart = async (cart) => {
  const taxRates = await getTaxRates();
  return formatCartSync(cart, taxRates);
};

/**
 * Get cart items for order creation (internal use)
 * @param {string} userId - User ID
 * @param {string} tableId - Table ID
 * @returns {Promise<Object>} Cart with raw items
 */
const getCartForOrder = async (userId, tableId) => {
  const cart = await Cart.findOne({ user: userId, table: tableId })
    .populate({
      path: 'items.menuItem',
      select: 'name imageUrl price status toppingGroups'
    })
    .populate({
      path: 'items.combo',
      select: 'name imageUrl price status items'
    });

  if (!cart || cart.items.length === 0) {
    return null;
  }

  return cart;
};

module.exports = {
  getCart,
  getCartBySession,
  addToCart,
  addToCartBySession,
  updateCartItem,
  updateCartItemBySession,
  removeCartItem,
  removeCartItemBySession,
  clearCart,
  clearCartBySession,
  calculateCartTotal,
  calculateCartTotalSync,
  deleteCart,
  getCartForOrder,
  formatCart,
  formatCartSync,
  getTaxRates,
  clearTaxRatesCache,
  DEFAULT_TAX_RATES
};
