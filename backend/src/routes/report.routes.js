/**
 * Report Routes
 * Requirements: 10.1, 10.2, 10.3, 10.4
 */

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');

// All report routes require authentication and manager/admin role
router.use(authenticate);
router.use(requireRole('manager', 'admin'));

// Dashboard summary (quick overview)
router.get('/dashboard', reportController.getDashboardSummary);

// Revenue reports
router.get('/revenue', reportController.getRevenueReport);

// Popular items report
router.get('/popular-items', reportController.getPopularItemsReport);

// Operational metrics
router.get('/operations', reportController.getOperationalMetrics);

// Staff performance
router.get('/staff-performance', reportController.getStaffPerformanceReport);

// Review statistics
router.get('/reviews', reportController.getReviewStats);

module.exports = router;
