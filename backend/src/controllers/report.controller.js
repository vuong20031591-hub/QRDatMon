/**
 * Report Controller
 * Handles report-related HTTP requests
 * Requirements: 10.1, 10.2, 10.3, 10.4
 */

const reportService = require('../services/report.service');
const { ok } = require('../utils/response');

/**
 * Get revenue report
 * GET /api/reports/revenue
 */
const getRevenueReport = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy, areaId, staffId } = req.query;
    const result = await reportService.getRevenueReport({
      startDate,
      endDate,
      groupBy,
      areaId,
      staffId
    });
    return ok(res, result, 'Revenue report generated');
  } catch (error) {
    next(error);
  }
};

/**
 * Get popular items report
 * GET /api/reports/popular-items
 */
const getPopularItemsReport = async (req, res, next) => {
  try {
    const { startDate, endDate, limit, categoryId } = req.query;
    const result = await reportService.getPopularItemsReport({
      startDate,
      endDate,
      limit: parseInt(limit) || 10,
      categoryId
    });
    return ok(res, result, 'Popular items report generated');
  } catch (error) {
    next(error);
  }
};

/**
 * Get operational metrics
 * GET /api/reports/operations
 */
const getOperationalMetrics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const result = await reportService.getOperationalMetrics({
      startDate,
      endDate
    });
    return ok(res, result, 'Operational metrics generated');
  } catch (error) {
    next(error);
  }
};

/**
 * Get staff performance report
 * GET /api/reports/staff-performance
 */
const getStaffPerformanceReport = async (req, res, next) => {
  try {
    const { startDate, endDate, staffId } = req.query;
    const result = await reportService.getStaffPerformanceReport({
      startDate,
      endDate,
      staffId
    });
    return ok(res, result, 'Staff performance report generated');
  } catch (error) {
    next(error);
  }
};

/**
 * Get review statistics
 * GET /api/reports/reviews
 */
const getReviewStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const result = await reportService.getReviewStats({
      startDate,
      endDate
    });
    return ok(res, result, 'Review statistics generated');
  } catch (error) {
    next(error);
  }
};

/**
 * Get dashboard summary
 * GET /api/reports/dashboard
 */
const getDashboardSummary = async (req, res, next) => {
  try {
    const result = await reportService.getDashboardSummary();
    return ok(res, result, 'Dashboard summary generated');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRevenueReport,
  getPopularItemsReport,
  getOperationalMetrics,
  getStaffPerformanceReport,
  getReviewStats,
  getDashboardSummary
};
