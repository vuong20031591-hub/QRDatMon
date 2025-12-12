/**
 * Activity Log Controller
 * Handles HTTP requests for activity logs
 * Requirements: 17.3, 17.4
 */

const activityLogService = require('../services/activityLog.service');
const { successResponse } = require('../utils/response');

/**
 * Get activity logs with filters
 * GET /api/activity-logs
 */
const getActivityLogs = async (req, res, next) => {
  try {
    const {
      staff,
      action,
      entityType,
      entityId,
      startDate,
      endDate,
      page,
      limit,
      sortBy,
      sortOrder
    } = req.query;

    const filters = {};
    if (staff) filters.staff = staff;
    if (action) filters.action = action;
    if (entityType) filters.entityType = entityType;
    if (entityId) filters.entityId = entityId;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const pagination = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'desc'
    };

    const result = await activityLogService.getActivityLogs(filters, pagination);

    return successResponse(res, result, 'Activity logs retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get activity logs for a specific entity
 * GET /api/activity-logs/entity/:entityType/:entityId
 */
const getEntityLogs = async (req, res, next) => {
  try {
    const { entityType, entityId } = req.params;

    const logs = await activityLogService.getEntityActivityLogs(entityType, entityId);

    return successResponse(res, { logs }, 'Entity activity logs retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get activity logs for a staff member
 * GET /api/activity-logs/staff/:staffId
 */
const getStaffLogs = async (req, res, next) => {
  try {
    const { staffId } = req.params;
    const { page, limit, sortBy, sortOrder } = req.query;

    const pagination = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'desc'
    };

    const result = await activityLogService.getStaffActivityLogs(staffId, pagination);

    return successResponse(res, result, 'Staff activity logs retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get recent activities (for dashboard)
 * GET /api/activity-logs/recent
 */
const getRecentActivities = async (req, res, next) => {
  try {
    const { limit } = req.query;

    const logs = await activityLogService.getRecentActivities(parseInt(limit) || 20);

    return successResponse(res, { logs }, 'Recent activities retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActivityLogs,
  getEntityLogs,
  getStaffLogs,
  getRecentActivities
};
