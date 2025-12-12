/**
 * Inventory Controller
 * Handles inventory-related HTTP requests
 * Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6
 */

const inventoryService = require('../services/inventory.service');
const { asyncHandler } = require('../middleware/errorHandler');
const { ok, created, paginated } = require('../utils/response');

/**
 * Get all inventory items
 * GET /api/inventory
 * Admin/Staff only
 */
const getInventory = asyncHandler(async (req, res) => {
  const { lowStock, outOfStock, search, page, limit, sortBy, sortOrder } = req.query;

  const filters = {
    lowStock: lowStock === 'true',
    outOfStock: outOfStock === 'true',
    search
  };

  const pagination = {
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 20,
    sortBy,
    sortOrder
  };

  const result = await inventoryService.getInventory(filters, pagination);

  return paginated(
    res,
    result.inventory,
    result.pagination,
    'Inventory retrieved successfully'
  );
});

/**
 * Get inventory by menu item ID
 * GET /api/inventory/item/:menuItemId
 * Admin/Staff only
 */
const getInventoryByMenuItem = asyncHandler(async (req, res) => {
  const { menuItemId } = req.params;

  const inventory = await inventoryService.getInventoryByMenuItem(menuItemId);

  return ok(res, { inventory }, 'Inventory retrieved successfully');
});

/**
 * Add inventory for a menu item
 * POST /api/inventory
 * Admin only
 */
const addInventory = asyncHandler(async (req, res) => {
  const { menuItemId, quantity, minThreshold, unit } = req.body;
  const staffId = req.staff?._id;

  const inventory = await inventoryService.addInventory(
    { menuItemId, quantity, minThreshold, unit },
    staffId
  );

  return created(res, { inventory }, 'Inventory added successfully');
});

/**
 * Update stock (restock or adjust)
 * PATCH /api/inventory/:menuItemId/stock
 * Admin/Staff only
 */
const updateStock = asyncHandler(async (req, res) => {
  const { menuItemId } = req.params;
  const { quantityChange, reason, referenceType } = req.body;
  const staffId = req.staff?._id;

  const inventory = await inventoryService.updateStock(menuItemId, quantityChange, {
    reason,
    referenceType,
    staffId
  });

  return ok(res, { inventory }, 'Stock updated successfully');
});

/**
 * Check low stock items
 * GET /api/inventory/low-stock
 * Admin/Staff only
 */
const checkLowStock = asyncHandler(async (req, res) => {
  const lowStockItems = await inventoryService.checkLowStock();

  return ok(res, { 
    items: lowStockItems,
    count: lowStockItems.length
  }, 'Low stock items retrieved successfully');
});

/**
 * Get inventory report
 * GET /api/inventory/report
 * Admin only
 */
const getInventoryReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const report = await inventoryService.getInventoryReport({ startDate, endDate });

  return ok(res, { report }, 'Inventory report generated successfully');
});

/**
 * Get inventory logs
 * GET /api/inventory/logs
 * GET /api/inventory/:menuItemId/logs
 * Admin only
 */
const getInventoryLogs = asyncHandler(async (req, res) => {
  const { menuItemId } = req.params;
  const { page, limit } = req.query;

  const result = await inventoryService.getInventoryLogs(menuItemId, {
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 20
  });

  return paginated(
    res,
    result.logs,
    result.pagination,
    'Inventory logs retrieved successfully'
  );
});

/**
 * Update inventory settings
 * PATCH /api/inventory/:menuItemId/settings
 * Admin only
 */
const updateInventorySettings = asyncHandler(async (req, res) => {
  const { menuItemId } = req.params;
  const { minThreshold, unit, autoUpdateStatus } = req.body;

  const inventory = await inventoryService.updateInventorySettings(menuItemId, {
    minThreshold,
    unit,
    autoUpdateStatus
  });

  return ok(res, { inventory }, 'Inventory settings updated successfully');
});

module.exports = {
  getInventory,
  getInventoryByMenuItem,
  addInventory,
  updateStock,
  checkLowStock,
  getInventoryReport,
  getInventoryLogs,
  updateInventorySettings
};
