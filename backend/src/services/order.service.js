/**
 * Order Service
 * Handles order creation, status management, and order history
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7
 */

const { Order, Bill, MenuItem, Combo, TableSession, Cart } = require('../models');
const cartService = require('./cart.service');
const {
  NotFoundError,
  ValidationError,
  ForbiddenError,
  ConflictError
} = require('../utils/errors');
const {
  ORDER_STATUS,
  ORDER_ITEM_STATUS,
  BILL_STATUS,
  MENU_ITEM_STATUS,
  TABLE_STATUS,
  PAGINATION
} = require('../utils/constants');
const {
  emitOrderCreated,
  emitOrderStatusUpdated,
  emitOrderItemStatusUpdated,
  emitOrderReady,
  emitOrderCancelled
} = require('../socket/emitters');

/**
 * Create order from cart
 * @param {string} userId - User ID
 * @param {Object} options - Order options
 * @returns {Promise<Object>} Created order
 */
const createOrder = async (userId, options = {}) => {
  const { note } = options;

  // Get user's active table session
  const session = await TableSession.findOne({
    user: userId,
    isActive: true
  }).populate('table').populate('bill');

  if (!session) {
    throw new ValidationError('No active table session found. Please scan a QR code to join a table.');
  }

  if (!session.bill) {
    throw new ValidationError('No active bill found for this table session.');
  }

  // Check bill is still open
  const bill = await Bill.findById(session.bill._id || session.bill);
  if (!bill || bill.status !== BILL_STATUS.OPEN) {
    throw new ForbiddenError('Cannot create order - bill is no longer open');
  }

  // Get cart with items
  const cart = await cartService.getCartForOrder(userId, session.table._id.toString());

  if (!cart || cart.items.length === 0) {
    throw new ValidationError('Cart is empty. Please add items before placing an order.');
  }

  // Validate all items are available
  const unavailableItems = [];
  const orderItems = [];

  for (const cartItem of cart.items) {
    if (cartItem.menuItem) {
      const menuItem = await MenuItem.findById(cartItem.menuItem._id || cartItem.menuItem);

      if (!menuItem || menuItem.status !== MENU_ITEM_STATUS.AVAILABLE) {
        unavailableItems.push({
          id: cartItem.menuItem._id || cartItem.menuItem,
          name: menuItem?.name || 'Unknown item',
          reason: menuItem ? `Status: ${menuItem.status}` : 'Item no longer exists'
        });
        continue;
      }

      // Create order item from cart item
      orderItems.push({
        menuItem: menuItem._id,
        itemName: menuItem.name,
        quantity: cartItem.quantity,
        unitPrice: cartItem.unitPrice,
        subtotal: cartItem.unitPrice * cartItem.quantity,
        note: cartItem.note || '',
        status: ORDER_ITEM_STATUS.PENDING,
        toppings: (cartItem.toppings || []).map(t => ({
          toppingGroupId: t.toppingGroupId,
          toppingId: t.toppingId,
          name: t.name,
          quantity: t.quantity,
          price: t.price
        }))
      });
    } else if (cartItem.combo) {
      const combo = await Combo.findById(cartItem.combo._id || cartItem.combo);

      if (!combo || !combo.isActive) {
        unavailableItems.push({
          id: cartItem.combo._id || cartItem.combo,
          name: combo?.name || 'Unknown combo',
          reason: combo ? 'Combo is no longer active' : 'Combo no longer exists'
        });
        continue;
      }

      orderItems.push({
        combo: combo._id,
        itemName: combo.name,
        quantity: cartItem.quantity,
        unitPrice: cartItem.unitPrice,
        subtotal: cartItem.unitPrice * cartItem.quantity,
        note: cartItem.note || '',
        status: ORDER_ITEM_STATUS.PENDING,
        toppings: []
      });
    }
  }

  // If any items are unavailable, return error with list
  if (unavailableItems.length > 0) {
    throw new ValidationError('Some items are unavailable', unavailableItems.map(item => ({
      field: 'items',
      message: `"${item.name}" is unavailable: ${item.reason}`,
      itemId: item.id
    })));
  }

  // Calculate total amount
  const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

  // Generate order number
  const orderNumber = generateOrderNumber();

  // Create the order
  const order = await Order.create({
    bill: bill._id,
    user: userId,
    orderNumber,
    status: ORDER_STATUS.PENDING,
    totalAmount,
    note: note || '',
    items: orderItems
  });

  //  FIX RACE CONDITION: Use atomic $inc for bill subtotal update
  const updatedBill = await Bill.findByIdAndUpdate(
    bill._id,
    {
      $inc: { subtotal: totalAmount }
    },
    { new: true }
  );

  // Recalculate service charge, VAT, and total
  updatedBill.serviceChargeAmount = Math.round(updatedBill.subtotal * (updatedBill.serviceChargePercent / 100));
  updatedBill.vatAmount = Math.round((updatedBill.subtotal + updatedBill.serviceChargeAmount) * (updatedBill.vatPercent / 100));
  updatedBill.totalAmount = updatedBill.subtotal - updatedBill.discountAmount + updatedBill.serviceChargeAmount + updatedBill.vatAmount;
  await updatedBill.save();

  // Clear the cart after successful order creation
  await cartService.deleteCart(userId, session.table._id.toString());

  // Update table status to occupied if this is the first order
  const Table = require('../models/table.model');
  const table = await Table.findById(session.table._id);
  if (table && table.status !== TABLE_STATUS.OCCUPIED) {
    table.status = TABLE_STATUS.OCCUPIED;
    await table.save();
    
    // Emit table status change event
    const { emitTableStatusChanged } = require('../socket/emitters');
    emitTableStatusChanged(table);
  }

  // Emit real-time event to kitchen
  const formattedOrder = formatOrder(order);
  formattedOrder.table = session.table._id.toString();
  emitOrderCreated(formattedOrder);

  return formattedOrder;
};

/**
 * Get orders with filters
 * @param {Object} filters - Filter options
 * @param {Object} pagination - Pagination options
 * @returns {Promise<Object>} Paginated orders
 */
const getOrders = async (filters = {}, pagination = {}) => {
  const {
    bill,
    user,
    status,
    startDate,
    endDate,
    tableId
  } = filters;

  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = pagination;

  // Build query
  const query = {};

  if (bill) {
    query.bill = bill;
  }

  if (user) {
    query.user = user;
  }

  if (status) {
    query.status = status;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  // If tableId is provided, find bills for that table first
  if (tableId) {
    const bills = await Bill.find({ table: tableId }).select('_id');
    query.bill = { $in: bills.map(b => b._id) };
  }

  // Build sort
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query with pagination
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('user', 'name email')
      .populate({
        path: 'bill',
        select: 'billNumber table',
        populate: {
          path: 'table',
          select: 'tableNumber'
        }
      })
      .populate('confirmedBy', 'name employeeCode')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(query)
  ]);

  return {
    orders: orders.map(formatOrder),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    }
  };
};

/**
 * Get order by ID
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Order details
 */
const getOrderById = async (orderId) => {
  const order = await Order.findById(orderId)
    .populate('user', 'name email')
    .populate({
      path: 'bill',
      select: 'billNumber table totalAmount status',
      populate: {
        path: 'table',
        select: 'tableNumber'
      }
    })
    .populate('confirmedBy', 'name employeeCode')
    .populate('cancelledBy', 'name employeeCode')
    .populate({
      path: 'items.menuItem',
      select: 'name imageUrl price'
    })
    .populate({
      path: 'items.combo',
      select: 'name imageUrl price'
    })
    .lean();

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  return formatOrder(order);
};

/**
 * Get orders by bill ID
 * @param {string} billId - Bill ID
 * @returns {Promise<Array>} Orders for the bill
 */
const getOrdersByBill = async (billId) => {
  const orders = await Order.find({ bill: billId })
    .populate('user', 'name')
    .sort({ createdAt: 1 })
    .lean();

  return orders.map(formatOrder);
};

/**
 * Confirm order (staff action)
 * @param {string} orderId - Order ID
 * @param {Object} staff - Staff member confirming
 * @returns {Promise<Object>} Updated order
 */
const confirmOrder = async (orderId, staff) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  if (order.status !== ORDER_STATUS.PENDING) {
    throw new ConflictError(`Cannot confirm order with status "${order.status}"`);
  }

  order.status = ORDER_STATUS.CONFIRMED;
  order.confirmedBy = staff._id;
  order.confirmedAt = new Date();

  // Update all pending items to confirmed (preparing)
  order.items.forEach(item => {
    if (item.status === ORDER_ITEM_STATUS.PENDING) {
      item.status = ORDER_ITEM_STATUS.PREPARING;
      item.startedAt = new Date();
    }
  });

  await order.save();

  // Emit real-time event
  emitOrderStatusUpdated(order);

  return getOrderById(orderId);
};

/**
 * Update order item status
 * @param {string} orderId - Order ID
 * @param {string} itemId - Order item ID
 * @param {string} status - New status
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Updated order
 */
const updateOrderItemStatus = async (orderId, itemId, status, options = {}) => {
  const { staff, reason } = options;

  const order = await Order.findById(orderId);

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  const itemIndex = order.items.findIndex(item => item._id.toString() === itemId);

  if (itemIndex === -1) {
    throw new NotFoundError('Order item not found');
  }

  const item = order.items[itemIndex];

  // Validate status transition
  validateItemStatusTransition(item.status, status);

  // Update item status
  item.status = status;

  switch (status) {
    case ORDER_ITEM_STATUS.PREPARING:
      item.startedAt = new Date();
      item.preparedBy = staff?._id;
      break;
    case ORDER_ITEM_STATUS.READY:
      item.completedAt = new Date();
      break;
    case ORDER_ITEM_STATUS.SERVED:
      item.servedAt = new Date();
      item.servedBy = staff?._id;
      break;
    case ORDER_ITEM_STATUS.CANCELLED:
      item.cancelledAt = new Date();
      item.cancelReason = reason || 'Cancelled by staff';
      item.cancelledBy = staff?._id;
      break;
  }

  // Check if all items are ready -> update order status
  const allItemsReady = order.items.every(
    i => i.status === ORDER_ITEM_STATUS.READY ||
         i.status === ORDER_ITEM_STATUS.SERVED ||
         i.status === ORDER_ITEM_STATUS.CANCELLED
  );

  if (allItemsReady && order.status !== ORDER_STATUS.READY) {
    const hasNonCancelledItems = order.items.some(
      i => i.status !== ORDER_ITEM_STATUS.CANCELLED
    );

    if (hasNonCancelledItems) {
      order.status = ORDER_STATUS.READY;
      order.completedAt = new Date();
    }
  }

  // Check if all items are served
  const allItemsServed = order.items.every(
    i => i.status === ORDER_ITEM_STATUS.SERVED || i.status === ORDER_ITEM_STATUS.CANCELLED
  );

  if (allItemsServed && order.status !== ORDER_STATUS.SERVED) {
    const hasNonCancelledItems = order.items.some(
      i => i.status !== ORDER_ITEM_STATUS.CANCELLED
    );

    if (hasNonCancelledItems) {
      order.status = ORDER_STATUS.SERVED;
    }
  }

  await order.save();

  // Emit real-time event based on status
  emitOrderItemStatusUpdated({
    orderId,
    itemId,
    status,
    itemName: item.itemName,
    tableId: order.bill?.table?.toString()
  });

  // If order is ready, emit order ready event
  if (order.status === ORDER_STATUS.READY) {
    emitOrderReady(order);
  }

  return getOrderById(orderId);
};

/**
 * Cancel order
 * @param {string} orderId - Order ID
 * @param {string} reason - Cancellation reason
 * @param {Object} staff - Staff member cancelling
 * @returns {Promise<Object>} Cancelled order
 */
const cancelOrder = async (orderId, reason, staff) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  // Can only cancel pending or confirmed orders
  if (![ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED].includes(order.status)) {
    throw new ConflictError(`Cannot cancel order with status "${order.status}". Order may already be preparing.`);
  }

  // Check if any items are already being prepared or served
  const hasPreparingItems = order.items.some(
    item => [ORDER_ITEM_STATUS.PREPARING, ORDER_ITEM_STATUS.READY, ORDER_ITEM_STATUS.SERVED].includes(item.status)
  );

  if (hasPreparingItems) {
    throw new ConflictError('Cannot cancel order - some items are already being prepared or served');
  }

  order.status = ORDER_STATUS.CANCELLED;
  order.cancelReason = reason;
  order.cancelledBy = staff?._id;
  order.cancelledAt = new Date();

  // Cancel all items
  order.items.forEach(item => {
    if (item.status !== ORDER_ITEM_STATUS.CANCELLED) {
      item.status = ORDER_ITEM_STATUS.CANCELLED;
      item.cancelReason = reason;
      item.cancelledBy = staff?._id;
      item.cancelledAt = new Date();
    }
  });

  await order.save();

  // Update bill totals
  const bill = await Bill.findById(order.bill);
  if (bill) {
    bill.subtotal = Math.max(0, (bill.subtotal || 0) - order.totalAmount);
    bill.serviceChargeAmount = Math.round(bill.subtotal * (bill.serviceChargePercent / 100));
    bill.vatAmount = Math.round((bill.subtotal + bill.serviceChargeAmount) * (bill.vatPercent / 100));
    bill.totalAmount = bill.subtotal - bill.discountAmount + bill.serviceChargeAmount + bill.vatAmount;
    await bill.save();
  }

  // Emit real-time event
  emitOrderCancelled({
    orderId,
    reason,
    cancelledBy: staff?._id,
    tableId: bill?.table?.toString()
  });

  return getOrderById(orderId);
};

/**
 * Cancel single order item
 * @param {string} orderId - Order ID
 * @param {string} itemId - Order item ID
 * @param {string} reason - Cancellation reason
 * @param {Object} staff - Staff member cancelling
 * @returns {Promise<Object>} Updated order
 */
const cancelOrderItem = async (orderId, itemId, reason, staff) => {
  return updateOrderItemStatus(orderId, itemId, ORDER_ITEM_STATUS.CANCELLED, { staff, reason });
};

/**
 * Get order history for user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Paginated order history
 */
const getOrderHistory = async (userId, options = {}) => {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    status
  } = options;

  const query = { user: userId };

  if (status) {
    query.status = status;
  }

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('bill', 'billNumber table totalAmount')
      .populate({
        path: 'items.menuItem',
        select: 'name imageUrl'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(query)
  ]);

  return {
    orders: orders.map(formatOrder),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    }
  };
};

/**
 * Get orders by active session
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Orders for current session
 */
const getOrdersBySession = async (userId) => {
  const session = await TableSession.findOne({
    user: userId,
    isActive: true
  });

  if (!session || !session.bill) {
    return [];
  }

  return getOrdersByBill(session.bill.toString());
};

/**
 * Get kitchen orders (for kitchen display)
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Active kitchen orders
 */
const getKitchenOrders = async (options = {}) => {
  const { limit = 50 } = options;

  const orders = await Order.find({
    status: { $in: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.PREPARING] }
  })
    .populate('bill', 'billNumber table')
    .populate({
      path: 'bill',
      populate: {
        path: 'table',
        select: 'tableNumber'
      }
    })
    .sort({ createdAt: 1, 'items.priority': -1 })
    .limit(limit)
    .lean();

  return orders.map(formatOrder);
};

/**
 * Update order status (general)
 * @param {string} orderId - Order ID
 * @param {string} status - New status
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Updated order
 */
const updateOrderStatus = async (orderId, status, options = {}) => {
  const { staff, reason } = options;

  const order = await Order.findById(orderId);

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  // Validate status transition
  validateOrderStatusTransition(order.status, status);

  order.status = status;

  switch (status) {
    case ORDER_STATUS.CONFIRMED:
      order.confirmedBy = staff?._id;
      order.confirmedAt = new Date();
      break;
    case ORDER_STATUS.PREPARING:
      // Mark all confirmed items as preparing
      order.items.forEach(item => {
        if (item.status === ORDER_ITEM_STATUS.PENDING) {
          item.status = ORDER_ITEM_STATUS.PREPARING;
          item.startedAt = new Date();
        }
      });
      break;
    case ORDER_STATUS.READY:
      order.completedAt = new Date();
      break;
    case ORDER_STATUS.SERVED:
      order.items.forEach(item => {
        if (item.status === ORDER_ITEM_STATUS.READY) {
          item.status = ORDER_ITEM_STATUS.SERVED;
          item.servedAt = new Date();
          item.servedBy = staff?._id;
        }
      });
      break;
    case ORDER_STATUS.CANCELLED:
      order.cancelReason = reason;
      order.cancelledBy = staff?._id;
      order.cancelledAt = new Date();
      break;
  }

  await order.save();

  return getOrderById(orderId);
};

// ============================================
// Helper Functions
// ============================================

/**
 * Generate unique order number
 */
const generateOrderNumber = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = date.toTimeString().slice(0, 8).replace(/:/g, '');
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `ORD-${dateStr}-${timeStr.slice(0, 4)}-${random}`;
};

/**
 * Validate order status transition
 */
const validateOrderStatusTransition = (currentStatus, newStatus) => {
  const validTransitions = {
    [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.PREPARING]: [ORDER_STATUS.READY, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.READY]: [ORDER_STATUS.SERVED],
    [ORDER_STATUS.SERVED]: [],
    [ORDER_STATUS.CANCELLED]: []
  };

  if (!validTransitions[currentStatus]?.includes(newStatus)) {
    throw new ValidationError(
      `Invalid status transition from "${currentStatus}" to "${newStatus}"`
    );
  }
};

/**
 * Validate order item status transition
 */
const validateItemStatusTransition = (currentStatus, newStatus) => {
  const validTransitions = {
    [ORDER_ITEM_STATUS.PENDING]: [ORDER_ITEM_STATUS.PREPARING, ORDER_ITEM_STATUS.CANCELLED],
    [ORDER_ITEM_STATUS.PREPARING]: [ORDER_ITEM_STATUS.READY, ORDER_ITEM_STATUS.CANCELLED],
    [ORDER_ITEM_STATUS.READY]: [ORDER_ITEM_STATUS.SERVED],
    [ORDER_ITEM_STATUS.SERVED]: [],
    [ORDER_ITEM_STATUS.CANCELLED]: []
  };

  if (!validTransitions[currentStatus]?.includes(newStatus)) {
    throw new ValidationError(
      `Invalid item status transition from "${currentStatus}" to "${newStatus}"`
    );
  }
};

/**
 * Format order for API response
 */
const formatOrder = (order) => {
  return {
    id: order._id,
    orderNumber: order.orderNumber,
    status: order.status,
    totalAmount: order.totalAmount,
    note: order.note || '',
    user: order.user ? {
      id: order.user._id || order.user,
      name: order.user.name || null,
      email: order.user.email || null
    } : null,
    bill: order.bill ? {
      id: order.bill._id || order.bill,
      billNumber: order.bill.billNumber || null,
      tableNumber: order.bill.table?.tableNumber || null
    } : null,
    confirmedBy: order.confirmedBy ? {
      id: order.confirmedBy._id || order.confirmedBy,
      name: order.confirmedBy.name || null
    } : null,
    cancelledBy: order.cancelledBy ? {
      id: order.cancelledBy._id || order.cancelledBy,
      name: order.cancelledBy.name || null
    } : null,
    cancelReason: order.cancelReason || null,
    items: (order.items || []).map(item => ({
      id: item._id,
      menuItem: item.menuItem ? {
        id: item.menuItem._id || item.menuItem,
        name: item.menuItem.name || item.itemName,
        imageUrl: item.menuItem.imageUrl || null
      } : null,
      combo: item.combo ? {
        id: item.combo._id || item.combo,
        name: item.combo.name || item.itemName,
        imageUrl: item.combo.imageUrl || null
      } : null,
      itemName: item.itemName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
      note: item.note || '',
      status: item.status,
      toppings: (item.toppings || []).map(t => ({
        toppingGroupId: t.toppingGroupId,
        toppingId: t.toppingId,
        name: t.name,
        quantity: t.quantity,
        price: t.price
      })),
      priority: item.priority || 0,
      startedAt: item.startedAt || null,
      completedAt: item.completedAt || null,
      servedAt: item.servedAt || null,
      cancelledAt: item.cancelledAt || null,
      cancelReason: item.cancelReason || null
    })),
    confirmedAt: order.confirmedAt || null,
    completedAt: order.completedAt || null,
    cancelledAt: order.cancelledAt || null,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt
  };
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  getOrdersByBill,
  confirmOrder,
  updateOrderItemStatus,
  cancelOrder,
  cancelOrderItem,
  getOrderHistory,
  getOrdersBySession,
  getKitchenOrders,
  updateOrderStatus,
  formatOrder
};
