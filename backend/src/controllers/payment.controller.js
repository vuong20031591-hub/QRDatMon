/**
 * Payment Controller
 * Handles payment-related HTTP requests
 * Requirements: 6.7, 6.8, 6.9, 22.2
 */

const paymentService = require('../services/payment.service');
const { asyncHandler } = require('../middleware/errorHandler');
const { ok, created, paginated } = require('../utils/response');

/**
 * Generate VietQR payment code
 * POST /api/payments/vietqr
 */
const generateVietQR = asyncHandler(async (req, res) => {
  const { billId } = req.body;
  const userId = req.user._id;

  const result = await paymentService.generateVietQR(billId, userId);

  return created(res, result, 'VietQR code generated successfully');
});

/**
 * Confirm payment (staff action)
 * POST /api/payments/confirm
 * Staff only
 */
const confirmPayment = asyncHandler(async (req, res) => {
  const { billId, method, amount, transactionId, note } = req.body;
  const staff = req.staff;

  const payment = await paymentService.confirmPayment(
    { billId, method, amount, transactionId, note },
    staff
  );

  return ok(res, { payment }, 'Payment confirmed successfully');
});

/**
 * Handle SePay webhook
 * POST /api/payments/webhook/sepay
 * No auth required - validated by IP and signature
 */
const handleSepayWebhook = asyncHandler(async (req, res) => {
  const webhookData = req.body;
  const clientIp = req.ip || req.connection.remoteAddress;

  const result = await paymentService.handleSepayWebhook(webhookData, clientIp);

  // Always return 200 to acknowledge webhook receipt
  return ok(res, result, result.message || 'Webhook processed');
});

/**
 * Get payment by ID
 * GET /api/payments/:id
 */
const getPaymentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const payment = await paymentService.getPaymentById(id);

  return ok(res, { payment }, 'Payment retrieved successfully');
});

/**
 * Get payment status for a bill
 * GET /api/payments/bill/:billId/status
 */
const getPaymentStatus = asyncHandler(async (req, res) => {
  const { billId } = req.params;

  const result = await paymentService.getPaymentStatus(billId);

  return ok(res, result, 'Payment status retrieved successfully');
});

/**
 * Get payment history for user
 * GET /api/payments/history
 */
const getPaymentHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page, limit } = req.query;

  const result = await paymentService.getPaymentHistory(userId, {
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 20
  });

  return paginated(
    res,
    result.payments,
    result.pagination,
    'Payment history retrieved successfully'
  );
});

/**
 * Cancel pending payment
 * POST /api/payments/:id/cancel
 */
const cancelPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const payment = await paymentService.cancelPayment(id);

  return ok(res, { payment }, 'Payment cancelled successfully');
});

/**
 * Refund payment
 * POST /api/payments/:id/refund
 * Staff only
 */
const refundPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason, amount } = req.body;
  const staff = req.staff;

  const refund = await paymentService.refundPayment(id, { reason, amount }, staff);

  return ok(res, { refund }, 'Payment refunded successfully');
});

/**
 * Get payments for a bill
 * GET /api/payments/bill/:billId
 */
const getPaymentsByBill = asyncHandler(async (req, res) => {
  const { billId } = req.params;

  // Get payment status which includes the latest payment info
  const result = await paymentService.getPaymentStatus(billId);

  return ok(res, result, 'Payments retrieved successfully');
});

module.exports = {
  generateVietQR,
  confirmPayment,
  handleSepayWebhook,
  getPaymentById,
  getPaymentStatus,
  getPaymentHistory,
  cancelPayment,
  refundPayment,
  getPaymentsByBill
};
