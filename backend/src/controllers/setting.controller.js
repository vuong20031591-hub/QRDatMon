/**
 * Setting Controller
 * Requirements: 13.1, 13.2, 13.3, 13.4
 */

const settingService = require('../services/setting.service');
const { asyncHandler } = require('../middleware/errorHandler');
const { ok } = require('../utils/response');

/**
 * Get all settings
 * GET /api/settings
 */
const getAllSettings = asyncHandler(async (req, res) => {
  const settings = await settingService.getAllSettings();
  return ok(res, { settings }, 'Settings retrieved successfully');
});

/**
 * Get restaurant info
 * GET /api/settings/restaurant
 */
const getRestaurantInfo = asyncHandler(async (req, res) => {
  const restaurantInfo = await settingService.getRestaurantInfo();
  return ok(res, { restaurantInfo }, 'Restaurant info retrieved successfully');
});

/**
 * Update restaurant info
 * PUT /api/settings/restaurant
 */
const updateRestaurantInfo = asyncHandler(async (req, res) => {
  const restaurantInfo = await settingService.updateRestaurantInfo(req.body);
  return ok(res, { restaurantInfo }, 'Restaurant info updated successfully');
});

/**
 * Get tax settings
 * GET /api/settings/tax
 */
const getTaxSettings = asyncHandler(async (req, res) => {
  const taxSettings = await settingService.getTaxSettings();
  return ok(res, { taxSettings }, 'Tax settings retrieved successfully');
});

/**
 * Update tax settings
 * PUT /api/settings/tax
 */
const updateTaxSettings = asyncHandler(async (req, res) => {
  const taxSettings = await settingService.updateTaxSettings(req.body);
  return ok(res, { taxSettings }, 'Tax settings updated successfully');
});

/**
 * Get notification settings
 * GET /api/settings/notifications
 */
const getNotificationSettings = asyncHandler(async (req, res) => {
  const notificationSettings = await settingService.getNotificationSettings();
  return ok(res, { notificationSettings }, 'Notification settings retrieved successfully');
});

/**
 * Update notification settings
 * PUT /api/settings/notifications
 */
const updateNotificationSettings = asyncHandler(async (req, res) => {
  const notificationSettings = await settingService.updateNotificationSettings(req.body);
  return ok(res, { notificationSettings }, 'Notification settings updated successfully');
});

module.exports = {
  getAllSettings,
  getRestaurantInfo,
  updateRestaurantInfo,
  getTaxSettings,
  updateTaxSettings,
  getNotificationSettings,
  updateNotificationSettings,
};
