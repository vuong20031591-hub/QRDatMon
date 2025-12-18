/**
 * Area Routes
 * Defines routes for area/zone management
 */

const express = require('express');
const router = express.Router();

const areaController = require('../controllers/area.controller');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleGuard');
const { validate, Joi, commonSchemas } = require('../middleware/validator');

// Validation schemas
const areaSchemas = {
  createArea: Joi.object({
    name: Joi.string().trim().min(1).max(100).required(),
    description: Joi.string().trim().max(500).allow(''),
    floor: Joi.number().integer().min(1).default(1),
    sortOrder: Joi.number().integer().min(0).default(0)
  }),
  updateArea: Joi.object({
    name: Joi.string().trim().min(1).max(100),
    description: Joi.string().trim().max(500).allow(''),
    floor: Joi.number().integer().min(1),
    sortOrder: Joi.number().integer().min(0),
    isActive: Joi.boolean()
  })
};

/**
 * @route   GET /api/areas
 * @desc    Get all areas
 * @access  Public
 */
router.get('/', areaController.getAreas);

/**
 * @route   POST /api/areas
 * @desc    Create new area
 * @access  Admin
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(areaSchemas.createArea),
  areaController.createArea
);

/**
 * @route   PUT /api/areas/:id
 * @desc    Update area
 * @access  Admin
 */
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validate(Joi.object({ id: commonSchemas.objectId.required() }), 'params'),
  validate(areaSchemas.updateArea),
  areaController.updateArea
);

/**
 * @route   DELETE /api/areas/:id
 * @desc    Soft delete area
 * @access  Admin
 */
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  validate(Joi.object({ id: commonSchemas.objectId.required() }), 'params'),
  areaController.deleteArea
);

module.exports = router;
