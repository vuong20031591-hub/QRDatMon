/**
 * Menu Service
 * Handles menu item CRUD operations, search, and filtering
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 */

const { MenuItem, Category } = require('../models');
const { NotFoundError, ValidationError, ConflictError } = require('../utils/errors');
const { MENU_ITEM_STATUS, PAGINATION } = require('../utils/constants');

/**
 * Escape special regex characters to prevent regex injection attacks
 * @param {string} string - User input string
 * @returns {string} Escaped string safe for regex
 */
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Get all menu items grouped by category
 * @param {Object} options - Query options
 * @param {boolean} options.includeUnavailable - Include out_of_stock items
 * @param {boolean} options.activeOnly - Only active categories
 * @returns {Promise<Array>} Menu items grouped by category
 */
const getMenuGroupedByCategory = async (options = {}) => {
  const { includeUnavailable = false, activeOnly = true } = options;

  // Build category filter
  const categoryFilter = activeOnly ? { isActive: true } : {};

  // Get all active categories sorted by order
  const categories = await Category.find(categoryFilter)
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  // Build menu item filter
  const menuFilter = {
    category: { $in: categories.map(c => c._id) }
  };

  if (!includeUnavailable) {
    menuFilter.status = MENU_ITEM_STATUS.AVAILABLE;
  }

  // Get all menu items
  const menuItems = await MenuItem.find(menuFilter)
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  // Group items by category
  const groupedMenu = categories.map(category => ({
    category: {
      id: category._id,
      name: category.name,
      description: category.description,
      imageUrl: category.imageUrl
    },
    items: menuItems
      .filter(item => item.category.toString() === category._id.toString())
      .map(formatMenuItem)
  }));

  // Filter out empty categories
  return groupedMenu.filter(group => group.items.length > 0);
};

/**
 * Get menu items with filtering and pagination
 * @param {Object} filters - Filter criteria
 * @param {Object} pagination - Pagination options
 * @returns {Promise<Object>} Paginated menu items
 */
const getMenuItems = async (filters = {}, pagination = {}) => {
  const {
    category,
    status,
    minPrice,
    maxPrice,
    isPopular,
    isNew,
    search
  } = filters;

  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    sortBy = 'sortOrder',
    sortOrder = 'asc'
  } = pagination;

  // Build query
  const query = {};

  if (category) {
    query.category = category;
  }

  if (status) {
    query.status = status;
  } else {
    // By default, exclude suspended items for non-admin queries
    query.status = { $ne: 'suspended' };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = minPrice;
    if (maxPrice !== undefined) query.price.$lte = maxPrice;
  }

  if (isPopular !== undefined) {
    query.isPopular = isPopular;
  }

  if (isNew !== undefined) {
    query.isNew = isNew;
  }

  // Text search (escape special regex characters to prevent injection)
  if (search) {
    const escapedSearch = escapeRegex(search);
    query.$or = [
      { name: { $regex: escapedSearch, $options: 'i' } },
      { description: { $regex: escapedSearch, $options: 'i' } }
    ];
  }

  // Build sort
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query with pagination
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    MenuItem.find(query)
      .populate('category', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    MenuItem.countDocuments(query)
  ]);

  return {
    items: items.map(formatMenuItem),
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
 * Search menu items by text
 * @param {string} searchQuery - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Matching menu items
 */
const searchMenuItems = async (searchQuery, options = {}) => {
  const { limit = 20, includeUnavailable = false } = options;

  if (!searchQuery || searchQuery.trim().length === 0) {
    return [];
  }

  // Escape special regex characters to prevent injection
  const escapedQuery = escapeRegex(searchQuery.trim());

  const query = {
    $or: [
      { name: { $regex: escapedQuery, $options: 'i' } },
      { description: { $regex: escapedQuery, $options: 'i' } }
    ]
  };

  if (!includeUnavailable) {
    query.status = MENU_ITEM_STATUS.AVAILABLE;
  }

  const items = await MenuItem.find(query)
    .populate('category', 'name')
    .limit(limit)
    .lean();

  return items.map(formatMenuItem);
};

/**
 * Get a single menu item by ID
 * @param {string} itemId - Menu item ID
 * @returns {Promise<Object>} Menu item
 */
const getMenuItemById = async (itemId) => {
  const item = await MenuItem.findById(itemId)
    .populate('category', 'name description imageUrl')
    .lean();

  if (!item) {
    throw new NotFoundError('Menu item not found', 'MenuItem');
  }

  return formatMenuItem(item);
};

/**
 * Create a new menu item
 * @param {Object} data - Menu item data
 * @returns {Promise<Object>} Created menu item
 */
const createMenuItem = async (data) => {
  const {
    name,
    category,
    price,
    description,
    imageUrl,
    costPrice,
    unit,
    status,
    isPopular,
    isNew,
    preparationTime,
    sortOrder,
    toppingGroups
  } = data;

  // Validate category exists
  const categoryDoc = await Category.findById(category);
  if (!categoryDoc) {
    throw new ValidationError('Invalid category ID', [
      { field: 'category', message: 'Category does not exist' }
    ]);
  }

  // Check for duplicate name in same category
  const existingItem = await MenuItem.findOne({
    name: { $regex: new RegExp(`^${name}$`, 'i') },
    category
  });

  if (existingItem) {
    throw new ConflictError(`Menu item "${name}" already exists in this category`);
  }

  // Create menu item
  const menuItem = await MenuItem.create({
    name,
    category,
    price,
    description,
    imageUrl,
    costPrice,
    unit,
    status: status || MENU_ITEM_STATUS.AVAILABLE,
    isPopular: isPopular || false,
    isNew: isNew || false,
    preparationTime: preparationTime || 15,
    sortOrder: sortOrder || 0,
    toppingGroups: toppingGroups || []
  });

  return getMenuItemById(menuItem._id);
};

/**
 * Update a menu item
 * @param {string} itemId - Menu item ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} Updated menu item
 */
const updateMenuItem = async (itemId, data) => {
  const item = await MenuItem.findById(itemId);

  if (!item) {
    throw new NotFoundError('Menu item not found', 'MenuItem');
  }

  // If category is being changed, validate it exists
  if (data.category && data.category !== item.category.toString()) {
    const categoryDoc = await Category.findById(data.category);
    if (!categoryDoc) {
      throw new ValidationError('Invalid category ID', [
        { field: 'category', message: 'Category does not exist' }
      ]);
    }
  }

  // If name is being changed, check for duplicates
  if (data.name && data.name !== item.name) {
    const targetCategory = data.category || item.category;
    const existingItem = await MenuItem.findOne({
      _id: { $ne: itemId },
      name: { $regex: new RegExp(`^${data.name}$`, 'i') },
      category: targetCategory
    });

    if (existingItem) {
      throw new ConflictError(`Menu item "${data.name}" already exists in this category`);
    }
  }

  // Update allowed fields
  const allowedFields = [
    'name', 'description', 'imageUrl', 'price', 'costPrice',
    'unit', 'status', 'isPopular', 'isNew', 'preparationTime',
    'sortOrder', 'category', 'toppingGroups'
  ];

  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      item[field] = data[field];
    }
  });

  await item.save();

  return getMenuItemById(item._id);
};

/**
 * Soft delete a menu item (set status to suspended)
 * @param {string} itemId - Menu item ID
 * @returns {Promise<Object>} Deleted menu item
 */
const softDeleteMenuItem = async (itemId) => {
  const item = await MenuItem.findById(itemId);

  if (!item) {
    throw new NotFoundError('Menu item not found', 'MenuItem');
  }

  // Soft delete by changing status
  item.status = 'suspended';
  await item.save();

  return {
    id: item._id,
    name: item.name,
    status: item.status,
    deletedAt: new Date()
  };
};

/**
 * Update menu item status
 * @param {string} itemId - Menu item ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated menu item
 */
const updateMenuItemStatus = async (itemId, status) => {
  const validStatuses = Object.values(MENU_ITEM_STATUS);
  if (!validStatuses.includes(status)) {
    throw new ValidationError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  return updateMenuItem(itemId, { status });
};

/**
 * Get popular menu items
 * @param {number} limit - Number of items to return
 * @returns {Promise<Array>} Popular menu items
 */
const getPopularItems = async (limit = 10) => {
  const items = await MenuItem.find({
    isPopular: true,
    status: MENU_ITEM_STATUS.AVAILABLE
  })
    .populate('category', 'name')
    .sort({ sortOrder: 1 })
    .limit(limit)
    .lean();

  return items.map(formatMenuItem);
};

/**
 * Get new menu items
 * @param {number} limit - Number of items to return
 * @returns {Promise<Array>} New menu items
 */
const getNewItems = async (limit = 10) => {
  const items = await MenuItem.find({
    isNew: true,
    status: MENU_ITEM_STATUS.AVAILABLE
  })
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return items.map(formatMenuItem);
};

/**
 * Bulk update menu item status (for inventory integration)
 * @param {Array<string>} itemIds - Menu item IDs
 * @param {string} status - New status
 * @returns {Promise<Object>} Update result
 */
const bulkUpdateStatus = async (itemIds, status) => {
  const result = await MenuItem.updateMany(
    { _id: { $in: itemIds } },
    { $set: { status } }
  );

  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount
  };
};

/**
 * Format menu item for API response
 * @param {Object} item - Raw menu item document
 * @returns {Object} Formatted menu item
 */
const formatMenuItem = (item) => {
  return {
    id: item._id,
    name: item.name,
    description: item.description || null,
    imageUrl: item.imageUrl || null,
    price: item.price,
    costPrice: item.costPrice || 0,
    unit: item.unit || 'phần',
    status: item.status,
    isPopular: item.isPopular || false,
    isNew: item.isNew || false,
    preparationTime: item.preparationTime || 15,
    sortOrder: item.sortOrder || 0,
    category: item.category ? {
      id: item.category._id || item.category,
      name: item.category.name || null
    } : null,
    toppingGroups: (item.toppingGroups || []).map(group => ({
      id: group._id,
      name: group.name,
      isRequired: group.isRequired,
      minSelect: group.minSelect,
      maxSelect: group.maxSelect,
      sortOrder: group.sortOrder,
      toppings: (group.toppings || []).map(topping => ({
        id: topping._id,
        name: topping.name,
        extraPrice: topping.extraPrice,
        isDefault: topping.isDefault,
        isAvailable: topping.isAvailable,
        sortOrder: topping.sortOrder
      }))
    })),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  };
};

module.exports = {
  getMenuGroupedByCategory,
  getMenuItems,
  searchMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  softDeleteMenuItem,
  updateMenuItemStatus,
  getPopularItems,
  getNewItems,
  bulkUpdateStatus,
  formatMenuItem
};
