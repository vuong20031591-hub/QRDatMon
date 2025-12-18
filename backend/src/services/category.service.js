/**
 * Category Service
 * Handles category CRUD operations
 * Requirements: 14.1, 14.2
 */

const { Category, MenuItem } = require('../models');
const { NotFoundError, ValidationError, ConflictError } = require('../utils/errors');
const { deleteImageByUrl } = require('../utils/image-utils');

/**
 * Get all categories
 * @param {Object} options - Query options
 * @param {boolean} options.activeOnly - Only return active categories
 * @param {boolean} options.withItemCount - Include item count per category
 * @returns {Promise<Array>} Categories
 */
const getCategories = async (options = {}) => {
  const { activeOnly = true, withItemCount = false } = options;

  const filter = activeOnly ? { isActive: true } : {};

  const categories = await Category.find(filter)
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  if (withItemCount) {
    // Get item counts for each category
    const itemCounts = await MenuItem.aggregate([
      { $match: { status: { $ne: 'suspended' } } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const countMap = itemCounts.reduce((acc, item) => {
      acc[item._id.toString()] = item.count;
      return acc;
    }, {});

    return categories.map(cat => ({
      ...formatCategory(cat),
      itemCount: countMap[cat._id.toString()] || 0
    }));
  }

  return categories.map(formatCategory);
};

/**
 * Get a single category by ID
 * @param {string} categoryId - Category ID
 * @returns {Promise<Object>} Category
 */
const getCategoryById = async (categoryId) => {
  const category = await Category.findById(categoryId).lean();

  if (!category) {
    throw new NotFoundError('Category not found', 'Category');
  }

  return formatCategory(category);
};

/**
 * Create a new category
 * @param {Object} data - Category data
 * @returns {Promise<Object>} Created category
 */
const createCategory = async (data) => {
  const { name, description, imageUrl, sortOrder } = data;

  // Check for duplicate name
  const existingCategory = await Category.findOne({
    name: { $regex: new RegExp(`^${name}$`, 'i') }
  });

  if (existingCategory) {
    throw new ConflictError(`Category "${name}" already exists`);
  }

  // Get next sort order if not provided
  let finalSortOrder = sortOrder;
  if (finalSortOrder === undefined) {
    const lastCategory = await Category.findOne()
      .sort({ sortOrder: -1 })
      .select('sortOrder');
    finalSortOrder = (lastCategory?.sortOrder || 0) + 1;
  }

  const category = await Category.create({
    name,
    description,
    imageUrl,
    sortOrder: finalSortOrder,
    isActive: true
  });

  return formatCategory(category.toObject());
};

/**
 * Update a category
 * @param {string} categoryId - Category ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} Updated category
 */
const updateCategory = async (categoryId, data) => {
  const category = await Category.findById(categoryId);

  if (!category) {
    throw new NotFoundError('Category not found', 'Category');
  }

  // If name is being changed, check for duplicates
  if (data.name && data.name !== category.name) {
    const existingCategory = await Category.findOne({
      _id: { $ne: categoryId },
      name: { $regex: new RegExp(`^${data.name}$`, 'i') }
    });

    if (existingCategory) {
      throw new ConflictError(`Category "${data.name}" already exists`);
    }
  }

  // Update allowed fields
  const allowedFields = ['name', 'description', 'imageUrl', 'sortOrder', 'isActive'];
  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      category[field] = data[field];
    }
  });

  await category.save();

  return formatCategory(category.toObject());
};

/**
 * Update category sort orders (reorder categories)
 * @param {Array<Object>} orders - Array of { id, sortOrder }
 * @returns {Promise<Array>} Updated categories
 */
const updateCategoryOrder = async (orders) => {
  if (!Array.isArray(orders) || orders.length === 0) {
    throw new ValidationError('Orders must be a non-empty array');
  }

  // Validate all IDs exist
  const ids = orders.map(o => o.id);
  const existingCategories = await Category.find({ _id: { $in: ids } });

  if (existingCategories.length !== ids.length) {
    throw new ValidationError('One or more category IDs are invalid');
  }

  // Bulk update sort orders
  const bulkOps = orders.map(({ id, sortOrder }) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { sortOrder } }
    }
  }));

  await Category.bulkWrite(bulkOps);

  // Return updated categories
  return getCategories({ activeOnly: false });
};

/**
 * Soft delete a category (deactivate)
 * @param {string} categoryId - Category ID
 * @returns {Promise<Object>} Deleted category info
 */
const deleteCategory = async (categoryId) => {
  const category = await Category.findById(categoryId);

  if (!category) {
    throw new NotFoundError('Category not found', 'Category');
  }

  // Check if category has menu items
  const itemCount = await MenuItem.countDocuments({
    category: categoryId,
    status: { $ne: 'suspended' }
  });

  if (itemCount > 0) {
    throw new ValidationError(
      `Cannot delete category with ${itemCount} active menu items. Please move or delete the items first.`,
      [{ field: 'category', message: `Category has ${itemCount} active items` }]
    );
  }

  // Soft delete
  category.isActive = false;
  await category.save();

  return {
    id: category._id,
    name: category.name,
    deletedAt: new Date()
  };
};

/**
 * Permanently delete a category (hard delete)
 * Only allowed if category has no items
 * @param {string} categoryId - Category ID
 * @returns {Promise<Object>} Deleted category info
 */
const permanentDeleteCategory = async (categoryId) => {
  const category = await Category.findById(categoryId);

  if (!category) {
    throw new NotFoundError('Category not found', 'Category');
  }

  // Check if category has any menu items (including suspended)
  const itemCount = await MenuItem.countDocuments({ category: categoryId });

  if (itemCount > 0) {
    throw new ValidationError(
      `Cannot permanently delete category with ${itemCount} menu items.`,
      [{ field: 'category', message: `Category has ${itemCount} items` }]
    );
  }

  // Delete image directory if exists
  if (category.imageUrl) {
    await deleteImageByUrl(category.imageUrl);
  }

  await Category.findByIdAndDelete(categoryId);

  return {
    id: categoryId,
    name: category.name,
    permanentlyDeleted: true,
    deletedAt: new Date()
  };
};

/**
 * Restore a deactivated category
 * @param {string} categoryId - Category ID
 * @returns {Promise<Object>} Restored category
 */
const restoreCategory = async (categoryId) => {
  const category = await Category.findById(categoryId);

  if (!category) {
    throw new NotFoundError('Category not found', 'Category');
  }

  if (category.isActive) {
    throw new ValidationError('Category is already active');
  }

  category.isActive = true;
  await category.save();

  return formatCategory(category.toObject());
};

/**
 * Format category for API response
 * @param {Object} category - Raw category document
 * @returns {Object} Formatted category
 */
const formatCategory = (category) => {
  return {
    id: category._id,
    name: category.name,
    description: category.description || null,
    imageUrl: category.imageUrl || null,
    sortOrder: category.sortOrder || 0,
    isActive: category.isActive,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt
  };
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  updateCategoryOrder,
  deleteCategory,
  permanentDeleteCategory,
  restoreCategory,
  formatCategory
};
