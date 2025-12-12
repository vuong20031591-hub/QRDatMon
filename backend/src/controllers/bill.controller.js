/**
 * Bill Controller
 * Handles bill-related HTTP requests
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.10, 21.1, 21.2, 21.3, 21.4, 21.5
 */

const billService = require('../services/bill.service');
const { asyncHandler } = require('../middleware/errorHandler');
const { ok, created, paginated } = require('../utils/response');

/**
 * Get bill by ID
 * GET /api/bills/:id
 */
const getBillById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const bill = await billService.getBillById(id);

  return ok(res, { bill }, 'Bill retrieved successfully');
});

/**
 * Get current bill for a table
 * GET /api/bills/table/:tableId
 */
const getBillByTable = asyncHandler(async (req, res) => {
  const { tableId } = req.params;

  const bill = await billService.getBillByTable(tableId);

  return ok(res, { bill }, 'Bill retrieved successfully');
});

/**
 * Get bill for user's active session
 * GET /api/bills/my-session
 */
const getBillBySession = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const bill = await billService.getBillBySession(userId);

  return ok(res, { bill }, 'Bill retrieved successfully');
});

/**
 * Apply voucher to bill
 * POST /api/bills/:id/voucher
 */
const applyVoucher = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { voucherCode } = req.body;
  const userId = req.user._id;

  const bill = await billService.applyVoucher(id, voucherCode, userId);

  return ok(res, { bill }, 'Voucher applied successfully');
});

/**
 * Remove voucher from bill
 * DELETE /api/bills/:id/voucher
 */
const removeVoucher = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const bill = await billService.removeVoucher(id, userId);

  return ok(res, { bill }, 'Voucher removed successfully');
});

/**
 * Split bill
 * POST /api/bills/:id/split
 * Staff only
 */
const splitBill = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { items } = req.body;
  const staff = req.staff;

  const result = await billService.splitBill(id, items, staff);

  return ok(res, result, 'Bill split successfully');
});

/**
 * Merge bills
 * POST /api/bills/merge
 * Staff only
 */
const mergeBills = asyncHandler(async (req, res) => {
  const { billIds, targetBillId } = req.body;
  const staff = req.staff;

  const bill = await billService.mergeBills(billIds, targetBillId, staff);

  return ok(res, { bill }, 'Bills merged successfully');
});

/**
 * Request payment for bill
 * POST /api/bills/:id/request-payment
 */
const requestPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const bill = await billService.requestPayment(id);

  return ok(res, { bill }, 'Payment requested successfully');
});

/**
 * Close bill after payment
 * POST /api/bills/:id/close
 * Staff only
 */
const closeBill = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const staff = req.staff;

  const bill = await billService.closeBill(id, staff);

  return ok(res, { bill }, 'Bill closed successfully');
});

/**
 * Cancel bill
 * POST /api/bills/:id/cancel
 * Staff only
 */
const cancelBill = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const staff = req.staff;

  const bill = await billService.cancelBill(id, reason, staff);

  return ok(res, { bill }, 'Bill cancelled successfully');
});

/**
 * Get bill history for user
 * GET /api/bills/history
 */
const getBillHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page, limit } = req.query;

  const result = await billService.getBillHistory(userId, {
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 20
  });

  return paginated(
    res,
    result.bills,
    result.pagination,
    'Bill history retrieved successfully'
  );
});

/**
 * Update bill rates (service charge, VAT)
 * PATCH /api/bills/:id/rates
 * Staff only
 */
const updateBillRates = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { serviceChargePercent, vatPercent } = req.body;

  const bill = await billService.updateBillRates(id, {
    serviceChargePercent,
    vatPercent
  });

  return ok(res, { bill }, 'Bill rates updated successfully');
});

/**
 * Recalculate bill totals
 * POST /api/bills/:id/recalculate
 * Staff only
 */
const recalculateBill = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const bill = await billService.recalculateBill(id);

  return ok(res, { bill }, 'Bill recalculated successfully');
});

module.exports = {
  getBillById,
  getBillByTable,
  getBillBySession,
  applyVoucher,
  removeVoucher,
  splitBill,
  mergeBills,
  requestPayment,
  closeBill,
  cancelBill,
  getBillHistory,
  updateBillRates,
  recalculateBill
};
