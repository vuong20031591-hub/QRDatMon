/**
 * Notification Routes
 * Requirements: 19.1, 19.2, 19.3, 19.4, 19.5
 */

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { validate, schemas } = require('../middleware/validator');
const Joi = require('joi');

// Custom validation schemas for notifications
const notificationSchemas = {
  registerDevice: Joi.object({
    token: Joi.string().required().messages({
      'string.empty': 'FCM token is required',
      'any.required': 'FCM token is required'
    }),
    deviceType: Joi.string().valid('android', 'ios').required().messages({
      'any.only': 'Device type must be android or ios',
      'any.required': 'Device type is required'
    })
  }),
  unregisterDevice: Joi.object({
    token: Joi.string().required()
  }),
  sendTest: Joi.object({
    userId: Joi.string().required(),
    title: Joi.string().required().max(100),
    body: Joi.string().required().max(500),
    type: Joi.string().valid('order_confirmed', 'order_ready', 'order_served', 'payment_success', 'promotion', 'system').default('system')
  })
};

// All routes require authentication
router.use(authenticate);

// Device registration
router.post('/devices', validate(notificationSchemas.registerDevice), notificationController.registerDevice);
router.delete('/devices', validate(notificationSchemas.unregisterDevice), notificationController.unregisterDevice);

// Notification management
router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.put('/read-all', notificationController.markAllAsRead);
router.put('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);

// Admin only - send test notification
router.post('/test', requireRole('admin', 'manager'), validate(notificationSchemas.sendTest), notificationController.sendTestNotification);

module.exports = router;
