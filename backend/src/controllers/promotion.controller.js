/**
 * Promotion Controller
 * Handles promotion/voucher-related HTTP requests
 * Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8, 15.9
 */

const promotionService = require('../services/promotion.service');
const { asyncHandler } = require('../middleware/errorHandler');
const { ok, created, paginated } = require('../utils/response');

/**
 * Get active promotions (public)
 * GET /api/promotions
 */
const getActivePromotions = asyncHandler(async (req, res) => {
  const { page, limit, includeExpired } = req.query;

  const result = await promotionService.getActivePromotions({
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 20,
    includeExpired: includeExpired === 'true'
  });

  return paginated(
    res,
    result.promotions,
    result.pagination,
    'Active promotions retrieved successfully'
  );
});

/**
 * Get all promotions (admin)
 * GET /api/promotions/all
 * Admin only
 */
const getPromotions = asyncHandler(async (req, res) => {
  const { isActive, discountType, search, page, limit, sortBy, sortOrder } = req.query;

  const filters = {
    isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    discountType,
    search
  };

  const pagination = {
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 20,
    sortBy,
    sortOrder
  };

  const result = await promotionService.getPromotions(filters, pagination);

  return paginated(
    res,
    result.promotions,
    result.pagination,
    'Promotions retrieved successfully'
  );
});

/**
 * Get promotion by ID
 * GET /api/promotions/:id
 */
const getPromotionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const promotion = await promotionService.getPromotionById(id);

  return ok(res, { promotion }, 'Promotion retrieved successfully');
});

/**
 * Validate voucher code
 * GET /api/promotions/validate/:code
 */
const validateVoucherCode = asyncHandler(async (req, res) => {
  const { code } = req.params;
  const { orderAmount } = req.query;
  const userId = req.user?._id;

  const result = await promotionService.validateVoucherCode(
    code,
    userId,
    orderAmount ? parseInt(orderAmount, 10) : 0
  );

  return ok(res, result, result.valid ? 'Voucher code is valid' : 'Voucher validation failed');
});

/**
 * Create a new promotion
 * POST /api/promotions
 * Admin only
 */
const createPromotion = asyncHandler(async (req, res) => {
  const {
    code,
    name,
    description,
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscount,
    startDate,
    endDate,
    usageLimit,
    usagePerUser
  } = req.body;

  const promotion = await promotionService.createPromotion({
    code,
    name,
    description,
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscount,
    startDate,
    endDate,
    usageLimit,
    usagePerUser
  });

  return created(res, { promotion }, 'Promotion created successfully');
});

/**
 * Update promotion
 * PUT /api/promotions/:id
 * Admin only
 */
const updatePromotion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const promotion = await promotionService.updatePromotion(id, updateData);

  return ok(res, { promotion }, 'Promotion updated successfully');
});

/**
 * Deactivate promotion
 * PATCH /api/promotions/:id/deactivate
 * Admin only
 */
const deactivatePromotion = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const promotion = await promotionService.deactivatePromotion(id);

  return ok(res, { promotion }, 'Promotion deactivated successfully');
});

/**
 * Reactivate promotion
 * PATCH /api/promotions/:id/reactivate
 * Admin only
 */
const reactivatePromotion = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const promotion = await promotionService.reactivatePromotion(id);

  return ok(res, { promotion }, 'Promotion reactivated successfully');
});

/**
 * Get promotion usage report
 * GET /api/promotions/:id/usage
 * Admin only
 */
const getPromotionUsageReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page, limit, startDate, endDate } = req.query;

  const result = await promotionService.getPromotionUsageReport(id, {
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 20,
    startDate,
    endDate
  });

  return ok(res, result, 'Usage report retrieved successfully');
});

/**
 * Check and deactivate expired promotions
 * POST /api/promotions/cleanup
 * Admin only - can be called by cron job
 */
const checkAndDeactivateExpired = asyncHandler(async (req, res) => {
  const result = await promotionService.checkAndDeactivateExpired();

  return ok(res, result, 'Expired promotions cleanup completed');
});

/**
 * Generate unique voucher code
 * POST /api/promotions/generate-code
 * Admin only
 */
const generateVoucherCode = asyncHandler(async (req, res) => {
  const { prefix, length } = req.body;

  const code = await promotionService.generateVoucherCode({ prefix, length });

  return ok(res, { code }, 'Voucher code generated successfully');
});

module.exports = {
  getActivePromotions,
  getPromotions,
  getPromotionById,
  validateVoucherCode,
  createPromotion,
  updatePromotion,
  deactivatePromotion,
  reactivatePromotion,
  getPromotionUsageReport,
  checkAndDeactivateExpired,
  generateVoucherCode
};
