/**
 * Category Routes
 * Defines routes for category management endpoints
 * Requirements: 14.1, 14.2
 */

const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/category.controller');
const { authenticate } = require('../middleware/auth');
const { requireAdmin, requireManager } = require('../middleware/roleGuard');
const { validate, Joi, commonSchemas } = require('../middleware/validator');

// Validation schemas
const categorySchemas = {
  createCategory: Joi.object({
    name: Joi.string().trim().min(1).max(100).required(),
    description: Joi.string().trim().max(500),
    imageUrl: Joi.string().trim().max(500).allow(''),
    sortOrder: Joi.number().integer().min(0)
  }),

  updateCategory: Joi.object({
    name: Joi.string().trim().min(1).max(100),
    description: Joi.string().trim().max(500).allow(''),
    imageUrl: Joi.string().trim().max(500).allow('', null),
    sortOrder: Joi.number().integer().min(0),
    isActive: Joi.boolean()
  }),

  reorderCategories: Joi.object({
    orders: Joi.array().items(
      Joi.object({
        id: commonSchemas.objectId.required(),
        sortOrder: Joi.number().integer().min(0).required()
      })
    ).min(1).required()
  })
};

/**
 * @route   GET /api/categories
 * @desc    Get all categories
 * @access  Public
 * @query   active (boolean) - Filter by active status
 * @query   withCount (boolean) - Include item count per category
 */
router.get('/', categoryController.getCategories);

/**
 * @route   GET /api/categories/:id
 * @desc    Get a single category by ID
 * @access  Public
 */
router.get(
  '/:id',
  validate(Joi.object({ id: commonSchemas.objectId.required() }), 'params'),
  categoryController.getCategoryById
);

/**
 * @route   POST /api/categories
 * @desc    Create a new category
 * @access  Admin only
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(categorySchemas.createCategory),
  categoryController.createCategory
);

/**
 * @route   PUT /api/categories/reorder
 * @desc    Reorder categories
 * @access  Admin only
 */
router.put(
  '/reorder',
  authenticate,
  requireAdmin,
  validate(categorySchemas.reorderCategories),
  categoryController.reorderCategories
);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update a category
 * @access  Admin only
 */
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validate(Joi.object({ id: commonSchemas.objectId.required() }), 'params'),
  validate(categorySchemas.updateCategory),
  categoryController.updateCategory
);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete a category (soft delete by default)
 * @access  Admin only
 * @query   permanent (boolean) - If true, permanently delete
 */
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  validate(Joi.object({ id: commonSchemas.objectId.required() }), 'params'),
  categoryController.deleteCategory
);

/**
 * @route   POST /api/categories/:id/restore
 * @desc    Restore a soft-deleted category
 * @access  Admin only
 */
router.post(
  '/:id/restore',
  authenticate,
  requireAdmin,
  validate(Joi.object({ id: commonSchemas.objectId.required() }), 'params'),
  categoryController.restoreCategory
);

module.exports = router;
