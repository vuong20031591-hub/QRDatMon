/**
 * Notification Controller
 * Handles notification-related HTTP requests
 * Requirements: 19.1, 19.2, 19.3, 19.4, 19.5
 */

const notificationService = require('../services/notification.service');
const { ok, created, noContent } = require('../utils/response');

/**
 * Register device for push notifications
 * POST /api/notifications/devices
 */
const registerDevice = async (req, res, next) => {
  try {
    const { token, deviceType } = req.body;
    const result = await notificationService.registerDevice(
      req.user._id,
      token,
      deviceType
    );
    return created(res, result, 'Device registered successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Unregister device
 * DELETE /api/notifications/devices
 */
const unregisterDevice = async (req, res, next) => {
  try {
    const { token } = req.body;
    await notificationService.deactivateToken(token);
    return noContent(res);
  } catch (error) {
    next(error);
  }
};

/**
 * Get user notifications
 * GET /api/notifications
 */
const getNotifications = async (req, res, next) => {
  try {
    const { page, limit, unreadOnly } = req.query;
    const result = await notificationService.getNotifications(req.user._id, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      unreadOnly: unreadOnly === 'true'
    });
    return ok(res, result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get unread count
 * GET /api/notifications/unread-count
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await notificationService.getUnreadCount(req.user._id);
    return ok(res, { unreadCount: count });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark notification as read
 * PUT /api/notifications/:id/read
 */
const markAsRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAsRead(
      req.params.id,
      req.user._id
    );
    return ok(res, result, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read
 * PUT /api/notifications/read-all
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const count = await notificationService.markAllAsRead(req.user._id);
    return ok(res, { updatedCount: count }, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete notification
 * DELETE /api/notifications/:id
 */
const deleteNotification = async (req, res, next) => {
  try {
    await notificationService.deleteNotification(req.params.id, req.user._id);
    return noContent(res);
  } catch (error) {
    next(error);
  }
};

/**
 * Send test notification (Admin only)
 * POST /api/notifications/test
 */
const sendTestNotification = async (req, res, next) => {
  try {
    const { userId, title, body, type = 'system' } = req.body;
    const result = await notificationService.sendPushNotification(userId, {
      title,
      body,
      type,
      data: { test: true }
    });
    return ok(res, result, 'Test notification sent');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerDevice,
  unregisterDevice,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendTestNotification
};
