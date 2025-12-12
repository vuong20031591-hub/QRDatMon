/**
 * Staff Routes
 * Defines routes for staff management
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */

const express = require('express');
const router = express.Router();

const staffController = require('../controllers/staff.controller');
const { authenticate } = require('../middleware/auth');
const { requireAdmin, requireManager, requireStaff } = require('../middleware/roleGuard');
const { validate, paramSchemas, Joi } = require('../middleware/validator');

// ============================================
// Staff Self-Service Routes (Staff only)
// ============================================

/**
 * @route   GET /api/staff/me
 * @desc    Get current staff profile
 * @access  Staff
 */
router.get(
  '/me',
  authenticate,
  requireStaff,
  staffController.getMyProfile
);

/**
 * @route   GET /api/staff/active-shift
 * @desc    Get current active shift
 * @access  Staff
 */
router.get(
  '/active-shift',
  authenticate,
  requireStaff,
  staffController.getActiveShift
);

/**
 * @route   POST /api/staff/clock-in
 * @desc    Clock in - Start shift
 * @access  Staff
 */
router.post(
  '/clock-in',
  authenticate,
  requireStaff,
  validate(Joi.object({
    shiftType: Joi.string().valid('morning', 'afternoon', 'evening'),
    note: Joi.string().trim().max(500)
  })),
  staffController.clockIn
);

/**
 * @route   POST /api/staff/clock-out
 * @desc    Clock out - End shift
 * @access  Staff
 */
router.post(
  '/clock-out',
  authenticate,
  requireStaff,
  validate(Joi.object({
    note: Joi.string().trim().max(500)
  })),
  staffController.clockOut
);

/**
 * @route   GET /api/staff/my-shifts
 * @desc    Get my shift history
 * @access  Staff
 */
router.get(
  '/my-shifts',
  authenticate,
  requireStaff,
  validate(Joi.object({
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    shiftType: Joi.string().valid('morning', 'afternoon', 'evening'),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  }), 'query'),
  staffController.getMyShifts
);

// ============================================
// Admin Routes (Manager/Admin only)
// ============================================

/**
 * @route   GET /api/staff/shifts
 * @desc    Get all shifts
 * @access  Manager/Admin
 */
router.get(
  '/shifts',
  authenticate,
  requireManager,
  validate(Joi.object({
    staffId: Joi.string(),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    shiftType: Joi.string().valid('morning', 'afternoon', 'evening'),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  }), 'query'),
  staffController.getAllShifts
);

/**
 * @route   GET /api/staff
 * @desc    Get all staff
 * @access  Manager/Admin
 */
router.get(
  '/',
  authenticate,
  requireManager,
  validate(Joi.object({
    role: Joi.string().valid('waiter', 'cashier', 'kitchen', 'manager', 'admin'),
    isActive: Joi.string().valid('true', 'false'),
    search: Joi.string().trim(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().valid('createdAt', 'employeeCode', 'role'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  }), 'query'),
  staffController.getStaff
);

/**
 * @route   POST /api/staff
 * @desc    Create new staff
 * @access  Admin
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(Joi.object({
    userId: Joi.string().required(),
    employeeCode: Joi.string().trim().uppercase().min(2).max(20).required(),
    role: Joi.string().valid('waiter', 'cashier', 'kitchen', 'manager', 'admin').required(),
    hireDate: Joi.date().iso()
  })),
  staffController.createStaff
);

/**
 * @route   GET /api/staff/:id
 * @desc    Get staff by ID
 * @access  Manager/Admin
 */
router.get(
  '/:id',
  authenticate,
  requireManager,
  validate(paramSchemas.idParam, 'params'),
  staffController.getStaffById
);

/**
 * @route   PUT /api/staff/:id
 * @desc    Update staff
 * @access  Admin
 */
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validate(paramSchemas.idParam, 'params'),
  validate(Joi.object({
    employeeCode: Joi.string().trim().uppercase().min(2).max(20),
    role: Joi.string().valid('waiter', 'cashier', 'kitchen', 'manager', 'admin'),
    hireDate: Joi.date().iso()
  })),
  staffController.updateStaff
);

/**
 * @route   PUT /api/staff/:id/deactivate
 * @desc    Deactivate staff
 * @access  Admin
 */
router.put(
  '/:id/deactivate',
  authenticate,
  requireAdmin,
  validate(paramSchemas.idParam, 'params'),
  staffController.deactivateStaff
);

/**
 * @route   PUT /api/staff/:id/activate
 * @desc    Activate staff
 * @access  Admin
 */
router.put(
  '/:id/activate',
  authenticate,
  requireAdmin,
  validate(paramSchemas.idParam, 'params'),
  staffController.activateStaff
);

/**
 * @route   GET /api/staff/:id/shifts
 * @desc    Get shift history for a staff member
 * @access  Manager/Admin
 */
router.get(
  '/:id/shifts',
  authenticate,
  requireManager,
  validate(paramSchemas.idParam, 'params'),
  validate(Joi.object({
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    shiftType: Joi.string().valid('morning', 'afternoon', 'evening'),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  }), 'query'),
  staffController.getStaffShifts
);

module.exports = router;
