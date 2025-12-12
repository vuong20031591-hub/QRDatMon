/**
 * Payment Routes
 * Defines routes for payment processing and VietQR generation
 * Requirements: 6.7, 6.8, 6.9, 22.2
 */

const express = require('express');
const router = express.Router();

const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth');
const { requireStaff, requireCashier } = require('../middleware/roleGuard');
const { validate, paymentSchemas, paramSchemas, Joi } = require('../middleware/validator');

/**
 * @route   POST /api/payments/webhook/sepay
 * @desc    Handle SePay webhook for automatic payment confirmation
 * @access  Public (validated by IP)
 */
router.post(
  '/webhook/sepay',
  paymentController.handleSepayWebhook
);

// All other payment routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/payments/vietqr
 * @desc    Generate VietQR payment code
 * @access  Private
 */
router.post(
  '/vietqr',
  validate(paymentSchemas.generateVietQR),
  paymentController.generateVietQR
);

/**
 * @route   POST /api/payments/confirm
 * @desc    Confirm payment (staff action for cash or manual confirmation)
 * @access  Cashier/Staff
 */
router.post(
  '/confirm',
  requireCashier,
  validate(paymentSchemas.confirmPayment),
  paymentController.confirmPayment
);

/**
 * @route   GET /api/payments/history
 * @desc    Get payment history for user
 * @access  Private
 */
router.get(
  '/history',
  validate(Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  }), 'query'),
  paymentController.getPaymentHistory
);

/**
 * @route   GET /api/payments/bill/:billId/status
 * @desc    Get payment status for a bill
 * @access  Private
 */
router.get(
  '/bill/:billId/status',
  validate(Joi.object({
    billId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
  }), 'params'),
  paymentController.getPaymentStatus
);

/**
 * @route   GET /api/payments/bill/:billId
 * @desc    Get payments for a bill
 * @access  Private
 */
router.get(
  '/bill/:billId',
  validate(Joi.object({
    billId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
  }), 'params'),
  paymentController.getPaymentsByBill
);

/**
 * @route   GET /api/payments/:id
 * @desc    Get payment by ID
 * @access  Private
 */
router.get(
  '/:id',
  validate(paramSchemas.idParam, 'params'),
  paymentController.getPaymentById
);

/**
 * @route   POST /api/payments/:id/cancel
 * @desc    Cancel pending payment
 * @access  Private
 */
router.post(
  '/:id/cancel',
  validate(paramSchemas.idParam, 'params'),
  paymentController.cancelPayment
);

/**
 * @route   POST /api/payments/:id/refund
 * @desc    Refund a completed payment
 * @access  Cashier/Staff
 */
router.post(
  '/:id/refund',
  requireCashier,
  validate(paramSchemas.idParam, 'params'),
  validate(Joi.object({
    reason: Joi.string().trim().min(1).max(500).required(),
    amount: Joi.number().integer().min(1)
  })),
  paymentController.refundPayment
);

module.exports = router;
