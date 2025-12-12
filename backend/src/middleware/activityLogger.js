/**
 * Activity Logger Middleware
 * Automatically logs create, update, delete operations
 * Requirements: 17.1, 17.2
 */

const activityLogService = require('../services/activityLog.service');

/**
 * Get client IP address from request
 */
const getClientIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    null;
};

/**
 * Create activity logger middleware for specific entity type
 * @param {string} entityType - Type of entity being logged
 * @returns {Function} Express middleware
 */
const createActivityLogger = (entityType) => {
  return (action) => {
    return async (req, res, next) => {
      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to capture response
      res.json = async (data) => {
        // Only log if staff is authenticated and operation was successful
        if (req.staff && res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const logData = {
              staff: req.staff._id,
              action,
              entityType,
              entityId: req.params.id || data?.data?.id || data?.id,
              oldData: req.oldData || null,
              newData: extractNewData(action, data),
              ipAddress: getClientIP(req)
            };

            // Only log if we have an entityId
            if (logData.entityId) {
              await activityLogService.logActivity(logData);
            }
          } catch (error) {
            // Don't fail the request if logging fails
            console.error('Activity logging failed:', error.message);
          }
        }

        // Call original json method
        return originalJson(data);
      };

      next();
    };
  };
};

/**
 * Extract new data from response based on action
 */
const extractNewData = (action, responseData) => {
  if (action === 'delete') {
    return null;
  }

  // Try to extract data from common response structures
  if (responseData?.data) {
    return sanitizeData(responseData.data);
  }

  if (responseData?.order || responseData?.bill || responseData?.menuItem) {
    return sanitizeData(responseData.order || responseData.bill || responseData.menuItem);
  }

  return null;
};

/**
 * Sanitize data for logging (remove sensitive fields)
 */
const sanitizeData = (data) => {
  if (!data) return null;

  const sanitized = { ...data };

  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'refreshToken', 'firebaseUid'];
  sensitiveFields.forEach(field => {
    delete sanitized[field];
  });

  return sanitized;
};

/**
 * Middleware to capture old data before update/delete
 * @param {Function} getOldData - Function to fetch old data
 * @returns {Function} Express middleware
 */
const captureOldData = (getOldData) => {
  return async (req, res, next) => {
    try {
      if (req.params.id) {
        req.oldData = await getOldData(req.params.id);
      }
    } catch (error) {
      // Don't fail if we can't get old data
      console.error('Failed to capture old data:', error.message);
    }
    next();
  };
};

/**
 * Manual activity logging helper
 * Use this when automatic logging isn't suitable
 */
const logManualActivity = async (req, data) => {
  if (!req.staff) return;

  try {
    await activityLogService.logActivity({
      staff: req.staff._id,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      oldData: data.oldData || null,
      newData: data.newData || null,
      ipAddress: getClientIP(req)
    });
  } catch (error) {
    console.error('Manual activity logging failed:', error.message);
  }
};

// Pre-configured loggers for common entity types
const orderLogger = createActivityLogger('order');
const billLogger = createActivityLogger('bill');
const menuItemLogger = createActivityLogger('menu_item');
const tableLogger = createActivityLogger('table');
const staffLogger = createActivityLogger('staff');
const orderItemLogger = createActivityLogger('order_item');

module.exports = {
  createActivityLogger,
  captureOldData,
  logManualActivity,
  getClientIP,
  orderLogger,
  billLogger,
  menuItemLogger,
  tableLogger,
  staffLogger,
  orderItemLogger
};
