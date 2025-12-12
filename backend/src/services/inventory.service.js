/**
 * Inventory Service
 * Handles inventory management, stock tracking, and auto-status updates
 * Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6
 */

const { Inventory, InventoryLog, MenuItem } = require('../models');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { PAGINATION } = require('../utils/constants');

/**
 * Get all inventory items
 * @param {Object} filters - Filter options
 * @param {Object} pagination - Pagination options
 * @returns {Promise<Object>} Paginated inventory
 */
const getInventory = async (filters = {}, pagination = {}) => {
  const { lowStock, outOfStock, search } = filters;
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    sortBy = 'quantity',
    sortOrder = 'asc'
  } = pagination;

  const query = {};

  if (lowStock === true) {
    query.$expr = { $lte: ['$quantity', '$minThreshold'] };
  }

  if (outOfStock === true) {
    query.quantity = { $lte: 0 };
  }

  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const skip = (page - 1) * limit;

  let inventoryQuery = Inventory.find(query)
    .populate('menuItem', 'name imageUrl price status category')
    .populate('lastRestockedBy', 'employeeCode')
    .sort(sort)
    .skip(skip)
    .limit(limit);

  let [inventory, total] = await Promise.all([
    inventoryQuery.lean(),
    Inventory.countDocuments(query)
  ]);

  // Filter by search if provided (search in menuItem name)
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    inventory = inventory.filter(inv => 
      inv.menuItem && searchRegex.test(inv.menuItem.name)
    );
  }

  return {
    inventory: inventory.map(formatInventory),
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
 * Get inventory by menu item ID
 * @param {string} menuItemId - Menu item ID
 * @returns {Promise<Object>} Inventory details
 */
const getInventoryByMenuItem = async (menuItemId) => {
  const inventory = await Inventory.findOne({ menuItem: menuItemId })
    .populate('menuItem', 'name imageUrl price status category')
    .populate('lastRestockedBy', 'employeeCode')
    .lean();

  if (!inventory) {
    throw new NotFoundError('Inventory not found for this menu item');
  }

  return formatInventory(inventory);
};

/**
 * Add inventory for a menu item
 * @param {Object} data - Inventory data
 * @param {string} staffId - Staff performing the action
 * @returns {Promise<Object>} Created inventory
 */
const addInventory = async (data, staffId = null) => {
  const { menuItemId, quantity, minThreshold, unit } = data;

  // Check if menu item exists
  const menuItem = await MenuItem.findById(menuItemId);
  if (!menuItem) {
    throw new NotFoundError('Menu item not found');
  }

  // Check if inventory already exists
  const existingInventory = await Inventory.findOne({ menuItem: menuItemId });
  if (existingInventory) {
    throw new ValidationError('Inventory already exists for this menu item');
  }

  const inventory = await Inventory.create({
    menuItem: menuItemId,
    quantity: quantity || 0,
    minThreshold: minThreshold || 10,
    unit: unit || menuItem.unit || 'phần',
    lastRestockedAt: quantity > 0 ? new Date() : null,
    lastRestockedBy: quantity > 0 ? staffId : null
  });

  // Log the initial stock
  if (quantity > 0) {
    await InventoryLog.create({
      inventory: inventory._id,
      menuItem: menuItemId,
      action: 'add',
      quantityBefore: 0,
      quantityChange: quantity,
      quantityAfter: quantity,
      reason: 'Initial stock',
      reference: { type: 'manual' },
      performedBy: staffId
    });
  }

  // Auto update menu item status
  await autoUpdateItemStatus(menuItemId, quantity);

  return getInventoryByMenuItem(menuItemId);
};

/**
 * Update stock (add or deduct)
 * @param {string} menuItemId - Menu item ID
 * @param {number} quantityChange - Quantity to add (positive) or deduct (negative)
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Updated inventory
 */
const updateStock = async (menuItemId, quantityChange, options = {}) => {
  const { reason, referenceType, referenceId, staffId } = options;

  const inventory = await Inventory.findOne({ menuItem: menuItemId });
  if (!inventory) {
    throw new NotFoundError('Inventory not found for this menu item');
  }

  const quantityBefore = inventory.quantity;
  const quantityAfter = Math.max(0, quantityBefore + quantityChange);

  // Determine action type
  let action = 'adjust';
  if (quantityChange > 0) {
    action = referenceType === 'restock' ? 'restock' : 'add';
    inventory.lastRestockedAt = new Date();
    inventory.lastRestockedBy = staffId;
  } else if (quantityChange < 0) {
    action = 'deduct';
  }

  inventory.quantity = quantityAfter;
  await inventory.save();

  // Log the change
  await InventoryLog.create({
    inventory: inventory._id,
    menuItem: menuItemId,
    action,
    quantityBefore,
    quantityChange,
    quantityAfter,
    reason: reason || `Stock ${action}`,
    reference: referenceType ? { type: referenceType, id: referenceId } : undefined,
    performedBy: staffId
  });

  // Auto update menu item status
  if (inventory.autoUpdateStatus) {
    await autoUpdateItemStatus(menuItemId, quantityAfter);
  }

  return getInventoryByMenuItem(menuItemId);
};

/**
 * Deduct inventory when order is placed
 * @param {Array} orderItems - Array of order items
 * @param {string} orderId - Order ID for reference
 * @returns {Promise<Array>} Updated inventories
 */
const deductInventoryOnOrder = async (orderItems, orderId) => {
  const results = [];

  for (const item of orderItems) {
    const inventory = await Inventory.findOne({ menuItem: item.menuItem });
    
    if (inventory) {
      const quantityBefore = inventory.quantity;
      const quantityAfter = Math.max(0, quantityBefore - item.quantity);

      inventory.quantity = quantityAfter;
      await inventory.save();

      // Log the deduction
      await InventoryLog.create({
        inventory: inventory._id,
        menuItem: item.menuItem,
        action: 'deduct',
        quantityBefore,
        quantityChange: -item.quantity,
        quantityAfter,
        reason: `Order #${orderId}`,
        reference: { type: 'order', id: orderId }
      });

      // Auto update menu item status
      if (inventory.autoUpdateStatus) {
        await autoUpdateItemStatus(item.menuItem, quantityAfter);
      }

      results.push({
        menuItem: item.menuItem,
        deducted: item.quantity,
        remaining: quantityAfter
      });
    }
  }

  return results;
};

/**
 * Check low stock items
 * @returns {Promise<Array>} Low stock items
 */
const checkLowStock = async () => {
  const lowStockItems = await Inventory.find({
    $expr: { $lte: ['$quantity', '$minThreshold'] }
  })
    .populate('menuItem', 'name imageUrl price status')
    .lean();

  return lowStockItems.map(inv => ({
    ...formatInventory(inv),
    alertLevel: inv.quantity <= 0 ? 'critical' : 'warning'
  }));
};

/**
 * Auto update menu item status based on inventory
 * @param {string} menuItemId - Menu item ID
 * @param {number} quantity - Current quantity
 */
const autoUpdateItemStatus = async (menuItemId, quantity) => {
  const menuItem = await MenuItem.findById(menuItemId);
  if (!menuItem) return;

  // Only auto-update if not manually suspended
  if (menuItem.status === 'suspended') return;

  if (quantity <= 0) {
    menuItem.status = 'out_of_stock';
  } else if (menuItem.status === 'out_of_stock') {
    menuItem.status = 'available';
  }

  await menuItem.save();
};

/**
 * Get inventory report
 * @param {Object} options - Report options
 * @returns {Promise<Object>} Inventory report
 */
const getInventoryReport = async (options = {}) => {
  const { startDate, endDate } = options;

  // Get current inventory stats
  const [totalItems, lowStockCount, outOfStockCount, totalValue] = await Promise.all([
    Inventory.countDocuments(),
    Inventory.countDocuments({ $expr: { $lte: ['$quantity', '$minThreshold'] } }),
    Inventory.countDocuments({ quantity: { $lte: 0 } }),
    Inventory.aggregate([
      {
        $lookup: {
          from: 'menuitems',
          localField: 'menuItem',
          foreignField: '_id',
          as: 'item'
        }
      },
      { $unwind: '$item' },
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$quantity', '$item.costPrice'] } }
        }
      }
    ])
  ]);

  // Get inventory movement logs
  const logQuery = {};
  if (startDate || endDate) {
    logQuery.createdAt = {};
    if (startDate) logQuery.createdAt.$gte = new Date(startDate);
    if (endDate) logQuery.createdAt.$lte = new Date(endDate);
  }

  const movementStats = await InventoryLog.aggregate([
    { $match: logQuery },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 },
        totalQuantity: { $sum: { $abs: '$quantityChange' } }
      }
    }
  ]);

  const movements = {};
  movementStats.forEach(stat => {
    movements[stat._id] = {
      count: stat.count,
      totalQuantity: stat.totalQuantity
    };
  });

  return {
    summary: {
      totalItems,
      lowStockCount,
      outOfStockCount,
      healthyStockCount: totalItems - lowStockCount,
      totalInventoryValue: totalValue[0]?.totalValue || 0
    },
    movements,
    generatedAt: new Date()
  };
};

/**
 * Get inventory logs
 * @param {string} menuItemId - Menu item ID (optional)
 * @param {Object} pagination - Pagination options
 * @returns {Promise<Object>} Paginated logs
 */
const getInventoryLogs = async (menuItemId = null, pagination = {}) => {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT
  } = pagination;

  const query = {};
  if (menuItemId) {
    query.menuItem = menuItemId;
  }

  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    InventoryLog.find(query)
      .populate('menuItem', 'name')
      .populate('performedBy', 'employeeCode')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    InventoryLog.countDocuments(query)
  ]);

  return {
    logs: logs.map(log => ({
      id: log._id,
      menuItem: log.menuItem ? {
        id: log.menuItem._id,
        name: log.menuItem.name
      } : null,
      action: log.action,
      quantityBefore: log.quantityBefore,
      quantityChange: log.quantityChange,
      quantityAfter: log.quantityAfter,
      reason: log.reason,
      reference: log.reference,
      performedBy: log.performedBy?.employeeCode || null,
      createdAt: log.createdAt
    })),
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
 * Update inventory settings
 * @param {string} menuItemId - Menu item ID
 * @param {Object} settings - Settings to update
 * @returns {Promise<Object>} Updated inventory
 */
const updateInventorySettings = async (menuItemId, settings) => {
  const { minThreshold, unit, autoUpdateStatus } = settings;

  const inventory = await Inventory.findOne({ menuItem: menuItemId });
  if (!inventory) {
    throw new NotFoundError('Inventory not found for this menu item');
  }

  if (minThreshold !== undefined) inventory.minThreshold = minThreshold;
  if (unit !== undefined) inventory.unit = unit;
  if (autoUpdateStatus !== undefined) inventory.autoUpdateStatus = autoUpdateStatus;

  await inventory.save();

  return getInventoryByMenuItem(menuItemId);
};

// ============================================
// Helper Functions
// ============================================

/**
 * Format inventory for API response
 */
const formatInventory = (inventory) => {
  return {
    id: inventory._id,
    menuItem: inventory.menuItem ? {
      id: inventory.menuItem._id,
      name: inventory.menuItem.name,
      imageUrl: inventory.menuItem.imageUrl,
      price: inventory.menuItem.price,
      status: inventory.menuItem.status
    } : null,
    quantity: inventory.quantity,
    minThreshold: inventory.minThreshold,
    unit: inventory.unit,
    autoUpdateStatus: inventory.autoUpdateStatus,
    isLowStock: inventory.quantity <= inventory.minThreshold,
    isOutOfStock: inventory.quantity <= 0,
    lastRestockedAt: inventory.lastRestockedAt,
    lastRestockedBy: inventory.lastRestockedBy?.employeeCode || null,
    createdAt: inventory.createdAt,
    updatedAt: inventory.updatedAt
  };
};

module.exports = {
  getInventory,
  getInventoryByMenuItem,
  addInventory,
  updateStock,
  deductInventoryOnOrder,
  checkLowStock,
  autoUpdateItemStatus,
  getInventoryReport,
  getInventoryLogs,
  updateInventorySettings,
  formatInventory
};
