/**
 * Activity Log Routes
 * Requirements: 17.3, 17.4
 */

const express = require('express');
const router = express.Router();
const activityLogController = require('../controllers/activityLog.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { USER_ROLES } = require('../utils/constants');

// All routes require authentication and manager/admin role
router.use(authenticate);
router.use(requireRole([USER_ROLES.MANAGER, USER_ROLES.ADMIN]));

/**
 * @route   GET /api/activity-logs
 * @desc    Get activity logs with filters
 * @access  Manager, Admin
 */
router.get('/', activityLogController.getActivityLogs);

/**
 * @route   GET /api/activity-logs/recent
 * @desc    Get recent activities for dashboard
 * @access  Manager, Admin
 */
router.get('/recent', activityLogController.getRecentActivities);

/**
 * @route   GET /api/activity-logs/entity/:entityType/:entityId
 * @desc    Get activity logs for a specific entity
 * @access  Manager, Admin
 */
router.get('/entity/:entityType/:entityId', activityLogController.getEntityLogs);

/**
 * @route   GET /api/activity-logs/staff/:staffId
 * @desc    Get activity logs for a staff member
 * @access  Manager, Admin
 */
router.get('/staff/:staffId', activityLogController.getStaffLogs);

module.exports = router;
