/**
 * Order Controller
 * Handles order-related HTTP requests
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7
 */

const orderService = require('../services/order.service');
const { asyncHandler } = require('../middleware/errorHandler');
const { ok, created, paginated } = require('../utils/response');

/**
 * Create order from cart
 * POST /api/orders
 */
const createOrder = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { note } = req.body;

  const order = await orderService.createOrder(userId, { note });

  return created(res, { order }, 'Order created successfully');
});

/**
 * Get orders with filters
 * GET /api/orders
 * Admin/Staff only
 */
const getOrders = asyncHandler(async (req, res) => {
  const {
    bill,
    user,
    status,
    startDate,
    endDate,
    tableId,
    page,
    limit,
    sortBy,
    sortOrder
  } = req.query;

  const filters = {
    bill,
    user,
    status,
    startDate,
    endDate,
    tableId
  };

  const pagination = {
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 20,
    sortBy,
    sortOrder
  };

  const result = await orderService.getOrders(filters, pagination);

  return paginated(
    res,
    result.orders,
    result.pagination,
    'Orders retrieved successfully'
  );
});

/**
 * Get order by ID
 * GET /api/orders/:id
 */
const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await orderService.getOrderById(id);

  return ok(res, { order }, 'Order retrieved successfully');
});

/**
 * Get orders for current session
 * GET /api/orders/my-session
 */
const getOrdersBySession = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const orders = await orderService.getOrdersBySession(userId);

  return ok(res, { orders }, 'Session orders retrieved successfully');
});

/**
 * Get orders by bill ID
 * GET /api/orders/bill/:billId
 */
const getOrdersByBill = asyncHandler(async (req, res) => {
  const { billId } = req.params;

  const orders = await orderService.getOrdersByBill(billId);

  return ok(res, { orders }, 'Bill orders retrieved successfully');
});

/**
 * Get user's order history
 * GET /api/orders/history
 */
const getOrderHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { status, page, limit } = req.query;

  const options = {
    status,
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 20
  };

  const result = await orderService.getOrderHistory(userId, options);

  return paginated(
    res,
    result.orders,
    result.pagination,
    'Order history retrieved successfully'
  );
});

/**
 * Get kitchen orders (for kitchen display)
 * GET /api/orders/kitchen
 * Kitchen staff only
 */
const getKitchenOrders = asyncHandler(async (req, res) => {
  const { limit } = req.query;

  const orders = await orderService.getKitchenOrders({
    limit: parseInt(limit, 10) || 50
  });

  return ok(res, { orders }, 'Kitchen orders retrieved successfully');
});

/**
 * Confirm order
 * PATCH /api/orders/:id/confirm
 * Staff only
 */
const confirmOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const staff = req.staff;

  const order = await orderService.confirmOrder(id, staff);

  return ok(res, { order }, 'Order confirmed successfully');
});

/**
 * Update order status
 * PATCH /api/orders/:id/status
 * Staff only
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body;
  const staff = req.staff;

  const order = await orderService.updateOrderStatus(id, status, { staff, reason });

  return ok(res, { order }, 'Order status updated successfully');
});

/**
 * Cancel order
 * PATCH /api/orders/:id/cancel
 * Staff only
 */
const cancelOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const staff = req.staff;

  const order = await orderService.cancelOrder(id, reason, staff);

  return ok(res, { order }, 'Order cancelled successfully');
});

/**
 * Update order item status
 * PATCH /api/orders/:id/items/:itemId/status
 * Kitchen/Staff only
 */
const updateOrderItemStatus = asyncHandler(async (req, res) => {
  const { id, itemId } = req.params;
  const { status, reason } = req.body;
  const staff = req.staff;

  const order = await orderService.updateOrderItemStatus(id, itemId, status, { staff, reason });

  return ok(res, { order }, 'Order item status updated successfully');
});

/**
 * Cancel order item
 * PATCH /api/orders/:id/items/:itemId/cancel
 * Staff only
 */
const cancelOrderItem = asyncHandler(async (req, res) => {
  const { id, itemId } = req.params;
  const { reason } = req.body;
  const staff = req.staff;

  const order = await orderService.cancelOrderItem(id, itemId, reason, staff);

  return ok(res, { order }, 'Order item cancelled successfully');
});

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  getOrdersBySession,
  getOrdersByBill,
  getOrderHistory,
  getKitchenOrders,
  confirmOrder,
  updateOrderStatus,
  cancelOrder,
  updateOrderItemStatus,
  cancelOrderItem
};
