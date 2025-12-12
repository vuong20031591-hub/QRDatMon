/**
 * Activity Log Service
 * Handles activity logging and audit trail
 * Requirements: 17.1, 17.2, 17.3, 17.4
 */

const { ActivityLog, Staff } = require('../models');
const { PAGINATION } = require('../utils/constants');

/**
 * Log an activity
 * @param {Object} data - Activity data
 * @returns {Promise<Object>} Created activity log
 */
const logActivity = async (data) => {
  const {
    staff,
    action,
    entityType,
    entityId,
    oldData,
    newData,
    ipAddress
  } = data;

  const log = await ActivityLog.create({
    staff,
    action,
    entityType,
    entityId,
    oldData: oldData || null,
    newData: newData || null,
    ipAddress: ipAddress || null
  });

  return formatActivityLog(log);
};

/**
 * Get activity logs with filters
 * @param {Object} filters - Filter options
 * @param {Object} pagination - Pagination options
 * @returns {Promise<Object>} Paginated activity logs
 */
const getActivityLogs = async (filters = {}, pagination = {}) => {
  const {
    staff,
    action,
    entityType,
    entityId,
    startDate,
    endDate
  } = filters;

  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = pagination;

  // Build query
  const query = {};

  if (staff) {
    query.staff = staff;
  }

  if (action) {
    query.action = action;
  }

  if (entityType) {
    query.entityType = entityType;
  }

  if (entityId) {
    query.entityId = entityId;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  // Build sort
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query with pagination
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    ActivityLog.find(query)
      .populate('staff', 'name employeeCode role')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    ActivityLog.countDocuments(query)
  ]);

  return {
    logs: logs.map(formatActivityLog),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    }
  };
};

/**
 * Get activity logs for a specific entity
 * @param {string} entityType - Entity type
 * @param {string} entityId - Entity ID
 * @returns {Promise<Array>} Activity logs
 */
const getEntityActivityLogs = async (entityType, entityId) => {
  const logs = await ActivityLog.find({ entityType, entityId })
    .populate('staff', 'name employeeCode role')
    .sort({ createdAt: -1 })
    .lean();

  return logs.map(formatActivityLog);
};

/**
 * Get activity logs by staff member
 * @param {string} staffId - Staff ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Paginated activity logs
 */
const getStaffActivityLogs = async (staffId, options = {}) => {
  return getActivityLogs({ staff: staffId }, options);
};

/**
 * Get recent activities (for dashboard)
 * @param {number} limit - Number of activities to return
 * @returns {Promise<Array>} Recent activity logs
 */
const getRecentActivities = async (limit = 20) => {
  const logs = await ActivityLog.find()
    .populate('staff', 'name employeeCode role')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return logs.map(formatActivityLog);
};

/**
 * Format activity log for API response
 */
const formatActivityLog = (log) => {
  return {
    id: log._id,
    staff: log.staff ? {
      id: log.staff._id || log.staff,
      name: log.staff.name || null,
      employeeCode: log.staff.employeeCode || null,
      role: log.staff.role || null
    } : null,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    oldData: log.oldData || null,
    newData: log.newData || null,
    ipAddress: log.ipAddress || null,
    createdAt: log.createdAt
  };
};

module.exports = {
  logActivity,
  getActivityLogs,
  getEntityActivityLogs,
  getStaffActivityLogs,
  getRecentActivities,
  formatActivityLog
};
