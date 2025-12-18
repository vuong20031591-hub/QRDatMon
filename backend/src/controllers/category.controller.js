/**
 * Category Controller
 * Handles HTTP requests for category operations
 * Requirements: 14.1, 14.2
 */

const categoryService = require('../services/category.service');
const { asyncHandler } = require('../middleware/errorHandler');
const { ok, created, noContent } = require('../utils/response');

/**
 * Get all categories
 * GET /api/categories
 */
const getCategories = asyncHandler(async (req, res) => {
  const { active, withCount } = req.query;

  const options = {
    activeOnly: active !== 'false',
    withItemCount: withCount === 'true'
  };

  const categories = await categoryService.getCategories(options);

  return ok(res, { categories }, 'Categories retrieved successfully');
});

/**
 * Get a single category by ID
 * GET /api/categories/:id
 */
const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await categoryService.getCategoryById(id);

  return ok(res, { category }, 'Category retrieved successfully');
});

/**
 * Create a new category
 * POST /api/categories
 */
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, imageUrl, sortOrder } = req.body;

  const category = await categoryService.createCategory({
    name,
    description,
    imageUrl,
    sortOrder
  });

  return created(res, { category }, 'Category created successfully');
});

/**
 * Update a category
 * PUT /api/categories/:id
 */
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, imageUrl, sortOrder, isActive } = req.body;

  const category = await categoryService.updateCategory(id, {
    name,
    description,
    imageUrl,
    sortOrder,
    isActive
  });

  return ok(res, { category }, 'Category updated successfully');
});

/**
 * Reorder categories
 * PUT /api/categories/reorder
 */
const reorderCategories = asyncHandler(async (req, res) => {
  const { orders } = req.body;

  const categories = await categoryService.updateCategoryOrder(orders);

  return ok(res, { categories }, 'Categories reordered successfully');
});

/**
 * Delete a category (permanent delete with image cleanup)
 * DELETE /api/categories/:id
 * Use ?soft=true for soft delete (deactivate only)
 */
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { soft } = req.query;

  let result;
  if (soft === 'true') {
    result = await categoryService.deleteCategory(id);
  } else {
    // Default: permanent delete with image cleanup
    result = await categoryService.permanentDeleteCategory(id);
  }

  return ok(res, result, 'Category deleted successfully');
});

/**
 * Restore a deleted category
 * POST /api/categories/:id/restore
 */
const restoreCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await categoryService.restoreCategory(id);

  return ok(res, { category }, 'Category restored successfully');
});

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  reorderCategories,
  deleteCategory,
  restoreCategory
};
