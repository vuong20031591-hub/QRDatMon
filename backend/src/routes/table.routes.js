/**
 * Table Routes
 * Defines routes for table and QR code management
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 13.1, 13.2, 13.3, 13.4, 13.5, 13.6
 */

const express = require('express');
const router = express.Router();

const tableController = require('../controllers/table.controller');
const { authenticate } = require('../middleware/auth');
const { requireStaff, requireAdmin, requireManager } = require('../middleware/roleGuard');
const { validate, tableSchemas, Joi, commonSchemas } = require('../middleware/validator');

// Validation schemas for table operations
const tableValidation = {
  createTable: Joi.object({
    tableNumber: Joi.string().trim().min(1).max(50).required(),
    area: commonSchemas.objectId.required(),
    capacity: Joi.number().integer().min(1).max(100).default(4),
    position: Joi.object({
      x: Joi.number().default(0),
      y: Joi.number().default(0)
    }),
    status: Joi.string().valid('available', 'occupied', 'reserved', 'cleaning').default('available')
  }),

  updateTable: Joi.object({
    tableNumber: Joi.string().trim().min(1).max(50),
    area: commonSchemas.objectId,
    capacity: Joi.number().integer().min(1).max(100),
    position: Joi.object({
      x: Joi.number(),
      y: Joi.number()
    }),
    isActive: Joi.boolean()
  }),

  updateStatus: Joi.object({
    status: Joi.string().valid('available', 'occupied', 'reserved', 'cleaning').required()
  }),

  joinTable: Joi.object({
    qrToken: Joi.string().required().messages({
      'any.required': 'QR token is required',
      'string.empty': 'QR token cannot be empty'
    })
  }),

  generateQR: Joi.object({
    regenerate: Joi.boolean().default(false)
  }),

  mergeTables: Joi.object({
    tableIds: Joi.array()
      .items(commonSchemas.objectId)
      .min(2)
      .required()
      .messages({
        'array.min': 'At least 2 tables are required for merging'
      }),
    primaryTableId: commonSchemas.objectId.required()
  }),

  unmergeTables: Joi.object({
    mergeId: commonSchemas.objectId.required()
  })
};

/**
 * @route   GET /api/tables
 * @desc    Get all tables with optional filtering
 * @access  Staff only
 * @query   area - Filter by area ID
 * @query   status - Filter by status
 * @query   active - Filter by active status
 */
router.get(
  '/',
  authenticate,
  requireStaff,
  tableController.getTables
);

/**
 * @route   GET /api/tables/map
 * @desc    Get table map grouped by area (for floor plan view)
 * @access  Staff only
 * @query   includeInactive - Include inactive tables
 */
router.get(
  '/map',
  authenticate,
  requireStaff,
  tableController.getTableMap
);

/**
 * @route   GET /api/tables/my-session
 * @desc    Get current user's active table session
 * @access  Authenticated users
 */
router.get(
  '/my-session',
  authenticate,
  tableController.getMySession
);

/**
 * @route   POST /api/tables/join
 * @desc    Join a table by scanning QR code
 * @access  Authenticated users
 */
router.post(
  '/join',
  authenticate,
  validate(tableValidation.joinTable),
  tableController.joinTable
);

/**
 * @route   POST /api/tables/merge
 * @desc    Merge multiple tables together
 * @access  Staff only
 */
router.post(
  '/merge',
  authenticate,
  requireStaff,
  validate(tableValidation.mergeTables),
  tableController.mergeTables
);

/**
 * @route   POST /api/tables/unmerge
 * @desc    Unmerge previously merged tables
 * @access  Staff only
 */
router.post(
  '/unmerge',
  authenticate,
  requireStaff,
  validate(tableValidation.unmergeTables),
  tableController.unmergeTables
);

/**
 * @route   GET /api/tables/:id
 * @desc    Get single table details
 * @access  Staff only
 */
router.get(
  '/:id',
  authenticate,
  requireStaff,
  validate(Joi.object({ id: commonSchemas.objectId.required() }), 'params'),
  tableController.getTableById
);

/**
 * @route   POST /api/tables
 * @desc    Create a new table
 * @access  Admin only
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(tableValidation.createTable),
  tableController.createTable
);

/**
 * @route   PUT /api/tables/:id
 * @desc    Update table information
 * @access  Admin only
 */
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validate(Joi.object({ id: commonSchemas.objectId.required() }), 'params'),
  validate(tableValidation.updateTable),
  tableController.updateTable
);

/**
 * @route   PATCH /api/tables/:id/status
 * @desc    Update table status
 * @access  Staff only
 */
router.patch(
  '/:id/status',
  authenticate,
  requireStaff,
  validate(Joi.object({ id: commonSchemas.objectId.required() }), 'params'),
  validate(tableValidation.updateStatus),
  tableController.updateTableStatus
);

/**
 * @route   POST /api/tables/:id/leave
 * @desc    Leave a table (end session)
 * @access  Authenticated users
 */
router.post(
  '/:id/leave',
  authenticate,
  validate(Joi.object({ id: commonSchemas.objectId.required() }), 'params'),
  tableController.leaveTable
);

/**
 * @route   POST /api/tables/:id/qr
 * @desc    Generate QR code for a table
 * @access  Admin only
 */
router.post(
  '/:id/qr',
  authenticate,
  requireAdmin,
  validate(Joi.object({ id: commonSchemas.objectId.required() }), 'params'),
  validate(tableValidation.generateQR),
  tableController.generateQRCode
);

module.exports = router;
