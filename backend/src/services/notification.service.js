/**
 * Notification Service
 * Handles push notifications and in-app notifications
 * Requirements: 19.1, 19.2, 19.3, 19.4, 19.5
 */

const { Notification, PushToken, User } = require('../models');
const { admin, isInitialized } = require('../config/firebase');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { PAGINATION, SOCKET_EVENTS } = require('../utils/constants');
const { emitNotificationToUser } = require('../socket/emitters');

/**
 * Register device for push notifications
 * @param {string} userId - User ID
 * @param {string} token - FCM token
 * @param {string} deviceType - Device type (android/ios)
 * @returns {Promise<Object>} Registered token
 */
const registerDevice = async (userId, token, deviceType) => {
  if (!token) {
    throw new ValidationError('FCM token is required');
  }

  if (!['android', 'ios'].includes(deviceType)) {
    throw new ValidationError('Device type must be android or ios');
  }

  // Check if token already exists
  let pushToken = await PushToken.findOne({ token });

  if (pushToken) {
    // Update existing token
    pushToken.user = userId;
    pushToken.deviceType = deviceType;
    pushToken.isActive = true;
    await pushToken.save();
  } else {
    // Create new token
    pushToken = await PushToken.create({
      user: userId,
      token,
      deviceType,
      isActive: true
    });
  }

  return formatPushToken(pushToken);
};

/**
 * Deactivate push token
 * @param {string} token - FCM token to deactivate
 * @returns {Promise<boolean>} Success status
 */
const deactivateToken = async (token) => {
  const result = await PushToken.updateOne(
    { token },
    { isActive: false }
  );
  return result.modifiedCount > 0;
};

/**
 * Deactivate all tokens for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Number of deactivated tokens
 */
const deactivateUserTokens = async (userId) => {
  const result = await PushToken.updateMany(
    { user: userId },
    { isActive: false }
  );
  return result.modifiedCount;
};

/**
 * Send push notification to a user
 * @param {string} userId - User ID
 * @param {Object} notification - Notification data
 * @returns {Promise<Object>} Send result
 */
const sendPushNotification = async (userId, notification) => {
  const { title, body, type, data = {} } = notification;

  // Get active tokens for user
  const tokens = await PushToken.find({
    user: userId,
    isActive: true
  });

  if (tokens.length === 0) {
    console.log(`[Notification] No active tokens for user ${userId}`);
    return { sent: 0, failed: 0 };
  }

  // Save notification to database
  const savedNotification = await Notification.create({
    user: userId,
    title,
    body,
    type,
    data,
    isRead: false
  });

  // Emit via socket for real-time
  emitNotificationToUser(userId, formatNotification(savedNotification));

  // Send FCM push notification if Firebase is initialized
  if (!isInitialized()) {
    console.log('[Notification] Firebase not initialized, skipping FCM push');
    return { sent: 0, failed: 0, notificationId: savedNotification._id };
  }

  const fcmTokens = tokens.map(t => t.token);
  const message = {
    notification: {
      title,
      body
    },
    data: {
      type,
      notificationId: savedNotification._id.toString(),
      ...Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      )
    },
    tokens: fcmTokens
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    
    // Handle failed tokens
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(fcmTokens[idx]);
          console.log(`[Notification] Failed to send to token: ${resp.error?.message}`);
        }
      });

      // Deactivate invalid tokens
      if (failedTokens.length > 0) {
        await PushToken.updateMany(
          { token: { $in: failedTokens } },
          { isActive: false }
        );
      }
    }

    return {
      sent: response.successCount,
      failed: response.failureCount,
      notificationId: savedNotification._id
    };
  } catch (error) {
    console.error('[Notification] FCM send error:', error.message);
    return { sent: 0, failed: fcmTokens.length, notificationId: savedNotification._id };
  }
};

/**
 * Send order notification
 * @param {string} userId - User ID
 * @param {string} type - Notification type
 * @param {Object} orderData - Order data
 * @returns {Promise<Object>} Send result
 */
const sendOrderNotification = async (userId, type, orderData) => {
  const templates = {
    order_confirmed: {
      title: 'Đơn hàng đã được xác nhận',
      body: `Đơn hàng #${orderData.orderNumber} đã được xác nhận và đang được chuẩn bị.`
    },
    order_ready: {
      title: 'Món ăn đã sẵn sàng',
      body: `Đơn hàng #${orderData.orderNumber} đã hoàn thành. Nhân viên sẽ mang ra ngay!`
    },
    order_served: {
      title: 'Đã phục vụ',
      body: `Đơn hàng #${orderData.orderNumber} đã được phục vụ. Chúc quý khách ngon miệng!`
    },
    payment_success: {
      title: 'Thanh toán thành công',
      body: `Hóa đơn #${orderData.billNumber} đã được thanh toán. Cảm ơn quý khách!`
    }
  };

  const template = templates[type];
  if (!template) {
    throw new ValidationError(`Invalid notification type: ${type}`);
  }

  return sendPushNotification(userId, {
    title: template.title,
    body: template.body,
    type,
    data: orderData
  });
};

/**
 * Send promotion notification to multiple users
 * @param {Array<string>} userIds - User IDs
 * @param {Object} promotion - Promotion data
 * @returns {Promise<Object>} Send results
 */
const sendPromotionNotification = async (userIds, promotion) => {
  const results = {
    total: userIds.length,
    sent: 0,
    failed: 0
  };

  for (const userId of userIds) {
    try {
      const result = await sendPushNotification(userId, {
        title: `🎉 ${promotion.name}`,
        body: promotion.description || `Giảm ${promotion.discountValue}${promotion.discountType === 'percentage' ? '%' : 'đ'}. Mã: ${promotion.code}`,
        type: 'promotion',
        data: {
          promotionId: promotion._id?.toString() || promotion.id,
          code: promotion.code
        }
      });
      results.sent += result.sent > 0 ? 1 : 0;
      results.failed += result.sent === 0 ? 1 : 0;
    } catch (error) {
      results.failed++;
    }
  }

  return results;
};

/**
 * Get notifications for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Paginated notifications
 */
const getNotifications = async (userId, options = {}) => {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    unreadOnly = false
  } = options;

  const query = { user: userId };
  if (unreadOnly) {
    query.isRead = false;
  }

  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments(query),
    Notification.countDocuments({ user: userId, isRead: false })
  ]);

  return {
    notifications: notifications.map(formatNotification),
    unreadCount,
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
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated notification
 */
const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  );

  if (!notification) {
    throw new NotFoundError('Notification not found');
  }

  return formatNotification(notification);
};

/**
 * Mark all notifications as read for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Number of updated notifications
 */
const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { user: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
  return result.modifiedCount;
};

/**
 * Delete notification
 * @param {string} notificationId - Notification ID
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
const deleteNotification = async (notificationId, userId) => {
  const result = await Notification.deleteOne({
    _id: notificationId,
    user: userId
  });
  return result.deletedCount > 0;
};

/**
 * Get unread count for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Unread count
 */
const getUnreadCount = async (userId) => {
  return Notification.countDocuments({ user: userId, isRead: false });
};

// ============================================
// Helper Functions
// ============================================

const formatNotification = (notification) => ({
  id: notification._id,
  title: notification.title,
  body: notification.body,
  type: notification.type,
  data: notification.data || {},
  isRead: notification.isRead,
  readAt: notification.readAt || null,
  createdAt: notification.createdAt
});

const formatPushToken = (token) => ({
  id: token._id,
  deviceType: token.deviceType,
  isActive: token.isActive,
  createdAt: token.createdAt
});

module.exports = {
  registerDevice,
  deactivateToken,
  deactivateUserTokens,
  sendPushNotification,
  sendOrderNotification,
  sendPromotionNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
};
