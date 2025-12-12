/**
 * Bill Routes
 * Defines routes for bill management
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.10, 21.1, 21.2, 21.3, 21.4, 21.5
 */

const express = require('express');
const router = express.Router();

const billController = require('../controllers/bill.controller');
const { authenticate } = require('../middleware/auth');
const { requireStaff, requireCashier, attachStaffInfo } = require('../middleware/roleGuard');
const { validate, billSchemas, paramSchemas, Joi } = require('../middleware/validator');

// All bill routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/bills/my-session
 * @desc    Get bill for user's active session
 * @access  Private
 */
router.get(
  '/my-session',
  billController.getBillBySession
);

/**
 * @route   GET /api/bills/history
 * @desc    Get user's bill history
 * @access  Private
 */
router.get(
  '/history',
  validate(Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  }), 'query'),
  billController.getBillHistory
);

/**
 * @route   GET /api/bills/table/:tableId
 * @desc    Get current bill for a table
 * @access  Private
 */
router.get(
  '/table/:tableId',
  validate(Joi.object({
    tableId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
  }), 'params'),
  billController.getBillByTable
);

/**
 * @route   POST /api/bills/merge
 * @desc    Merge multiple bills
 * @access  Staff
 */
router.post(
  '/merge',
  requireStaff,
  validate(Joi.object({
    billIds: Joi.array().items(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/)
    ).min(2).required(),
    targetBillId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/)
  })),
  billController.mergeBills
);

/**
 * @route   GET /api/bills/:id
 * @desc    Get bill by ID
 * @access  Private
 */
router.get(
  '/:id',
  validate(paramSchemas.idParam, 'params'),
  billController.getBillById
);

/**
 * @route   POST /api/bills/:id/voucher
 * @desc    Apply voucher to bill
 * @access  Private
 */
router.post(
  '/:id/voucher',
  validate(paramSchemas.idParam, 'params'),
  validate(billSchemas.applyVoucher),
  billController.applyVoucher
);

/**
 * @route   DELETE /api/bills/:id/voucher
 * @desc    Remove voucher from bill
 * @access  Private
 */
router.delete(
  '/:id/voucher',
  validate(paramSchemas.idParam, 'params'),
  billController.removeVoucher
);

/**
 * @route   POST /api/bills/:id/split
 * @desc    Split bill into multiple bills
 * @access  Staff
 */
router.post(
  '/:id/split',
  requireStaff,
  validate(paramSchemas.idParam, 'params'),
  validate(billSchemas.splitBill),
  billController.splitBill
);

/**
 * @route   POST /api/bills/:id/request-payment
 * @desc    Request payment for bill
 * @access  Private
 */
router.post(
  '/:id/request-payment',
  validate(paramSchemas.idParam, 'params'),
  billController.requestPayment
);

/**
 * @route   POST /api/bills/:id/close
 * @desc    Close bill after payment
 * @access  Cashier/Staff
 */
router.post(
  '/:id/close',
  requireCashier,
  validate(paramSchemas.idParam, 'params'),
  billController.closeBill
);

/**
 * @route   POST /api/bills/:id/cancel
 * @desc    Cancel bill
 * @access  Staff
 */
router.post(
  '/:id/cancel',
  requireStaff,
  validate(paramSchemas.idParam, 'params'),
  validate(Joi.object({
    reason: Joi.string().trim().min(1).max(500).required()
  })),
  billController.cancelBill
);

/**
 * @route   PATCH /api/bills/:id/rates
 * @desc    Update bill service charge and VAT rates
 * @access  Staff
 */
router.patch(
  '/:id/rates',
  requireStaff,
  validate(paramSchemas.idParam, 'params'),
  validate(Joi.object({
    serviceChargePercent: Joi.number().min(0).max(100),
    vatPercent: Joi.number().min(0).max(100)
  })),
  billController.updateBillRates
);

/**
 * @route   POST /api/bills/:id/recalculate
 * @desc    Recalculate bill totals
 * @access  Staff
 */
router.post(
  '/:id/recalculate',
  requireStaff,
  validate(paramSchemas.idParam, 'params'),
  billController.recalculateBill
);

module.exports = router;
