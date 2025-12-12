/**
 * Menu Controller
 * Handles menu-related HTTP requests
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 */

const menuService = require('../services/menu.service');
const { asyncHandler } = require('../middleware/errorHandler');
const { ok, created, noContent, paginated } = require('../utils/response');

/**
 * Get menu items grouped by category
 * GET /api/menu
 */
const getMenu = asyncHandler(async (req, res) => {
  const { includeUnavailable } = req.query;

  const menu = await menuService.getMenuGroupedByCategory({
    includeUnavailable: includeUnavailable === 'true',
    activeOnly: true
  });

  return ok(res, { menu }, 'Menu retrieved successfully');
});

/**
 * Get menu items with filtering and pagination
 * GET /api/menu/items
 */
const getMenuItems = asyncHandler(async (req, res) => {
  const {
    category,
    status,
    minPrice,
    maxPrice,
    isPopular,
    isNew,
    search,
    page,
    limit,
    sortBy,
    sortOrder
  } = req.query;

  const filters = {
    category,
    status,
    minPrice: minPrice ? parseInt(minPrice, 10) : undefined,
    maxPrice: maxPrice ? parseInt(maxPrice, 10) : undefined,
    isPopular: isPopular === 'true' ? true : isPopular === 'false' ? false : undefined,
    isNew: isNew === 'true' ? true : isNew === 'false' ? false : undefined,
    search
  };

  const pagination = {
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 20,
    sortBy,
    sortOrder
  };

  const result = await menuService.getMenuItems(filters, pagination);

  return paginated(
    res,
    result.items,
    result.pagination,
    'Menu items retrieved successfully'
  );
});

/**
 * Search menu items
 * GET /api/menu/search
 */
const searchMenu = asyncHandler(async (req, res) => {
  const { q, limit, includeUnavailable } = req.query;

  const items = await menuService.searchMenuItems(q, {
    limit: parseInt(limit, 10) || 20,
    includeUnavailable: includeUnavailable === 'true'
  });

  return ok(res, { items, query: q, count: items.length }, 'Search completed');
});

/**
 * Get popular menu items
 * GET /api/menu/popular
 */
const getPopularItems = asyncHandler(async (req, res) => {
  const { limit } = req.query;

  const items = await menuService.getPopularItems(parseInt(limit, 10) || 10);

  return ok(res, { items }, 'Popular items retrieved successfully');
});

/**
 * Get new menu items
 * GET /api/menu/new
 */
const getNewItems = asyncHandler(async (req, res) => {
  const { limit } = req.query;

  const items = await menuService.getNewItems(parseInt(limit, 10) || 10);

  return ok(res, { items }, 'New items retrieved successfully');
});

/**
 * Get single menu item by ID
 * GET /api/menu/:id
 */
const getMenuItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const item = await menuService.getMenuItemById(id);

  return ok(res, { item }, 'Menu item retrieved successfully');
});

/**
 * Create new menu item
 * POST /api/menu
 * Admin only
 */
const createMenuItem = asyncHandler(async (req, res) => {
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
  } = req.body;

  const item = await menuService.createMenuItem({
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
  });

  return created(res, { item }, 'Menu item created successfully');
});

/**
 * Update menu item
 * PUT /api/menu/:id
 * Admin only
 */
const updateMenuItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const item = await menuService.updateMenuItem(id, updateData);

  return ok(res, { item }, 'Menu item updated successfully');
});

/**
 * Update menu item status
 * PATCH /api/menu/:id/status
 * Admin only
 */
const updateMenuItemStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const item = await menuService.updateMenuItemStatus(id, status);

  return ok(res, { item }, 'Menu item status updated successfully');
});

/**
 * Soft delete menu item
 * DELETE /api/menu/:id
 * Admin only
 */
const deleteMenuItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await menuService.softDeleteMenuItem(id);

  return ok(res, result, 'Menu item deleted successfully');
});

/**
 * Bulk update menu item status
 * PATCH /api/menu/bulk-status
 * Admin only
 */
const bulkUpdateStatus = asyncHandler(async (req, res) => {
  const { itemIds, status } = req.body;

  const result = await menuService.bulkUpdateStatus(itemIds, status);

  return ok(res, result, 'Menu items status updated successfully');
});

module.exports = {
  getMenu,
  getMenuItems,
  searchMenu,
  getPopularItems,
  getNewItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  updateMenuItemStatus,
  deleteMenuItem,
  bulkUpdateStatus
};
