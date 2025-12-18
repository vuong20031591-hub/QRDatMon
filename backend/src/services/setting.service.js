/**
 * Setting Service
 * Handles restaurant settings management
 * Requirements: 13.1, 13.2, 13.3, 13.4
 */

const { Setting } = require('../models');
const { NotFoundError, ValidationError } = require('../utils/errors');

/**
 * Setting keys constants
 */
const SETTING_KEYS = {
  // Restaurant Info
  RESTAURANT_NAME: 'RESTAURANT_NAME',
  RESTAURANT_ADDRESS: 'RESTAURANT_ADDRESS',
  RESTAURANT_PHONE: 'RESTAURANT_PHONE',
  RESTAURANT_EMAIL: 'RESTAURANT_EMAIL',
  RESTAURANT_LOGO: 'RESTAURANT_LOGO',
  OPERATING_HOURS: 'OPERATING_HOURS',
  
  // Tax Settings
  VAT_PERCENT: 'VAT_PERCENT',
  SERVICE_CHARGE_PERCENT: 'SERVICE_CHARGE_PERCENT',
  
  // Notification Settings
  NOTIFICATION_NEW_ORDER: 'NOTIFICATION_NEW_ORDER',
  NOTIFICATION_LOW_STOCK: 'NOTIFICATION_LOW_STOCK',
  NOTIFICATION_NEW_REVIEW: 'NOTIFICATION_NEW_REVIEW',
  NOTIFICATION_PAYMENT: 'NOTIFICATION_PAYMENT',
  
  // Currency
  CURRENCY: 'CURRENCY',
};

/**
 * Default settings values
 */
const DEFAULT_SETTINGS = {
  [SETTING_KEYS.RESTAURANT_NAME]: 'QR Đặt Món',
  [SETTING_KEYS.RESTAURANT_ADDRESS]: '',
  [SETTING_KEYS.RESTAURANT_PHONE]: '',
  [SETTING_KEYS.RESTAURANT_EMAIL]: '',
  [SETTING_KEYS.RESTAURANT_LOGO]: '',
  [SETTING_KEYS.OPERATING_HOURS]: JSON.stringify({
    monday: { open: '08:00', close: '22:00', isOpen: true },
    tuesday: { open: '08:00', close: '22:00', isOpen: true },
    wednesday: { open: '08:00', close: '22:00', isOpen: true },
    thursday: { open: '08:00', close: '22:00', isOpen: true },
    friday: { open: '08:00', close: '22:00', isOpen: true },
    saturday: { open: '08:00', close: '23:00', isOpen: true },
    sunday: { open: '08:00', close: '23:00', isOpen: true },
  }),
  [SETTING_KEYS.VAT_PERCENT]: 10,
  [SETTING_KEYS.SERVICE_CHARGE_PERCENT]: 5,
  [SETTING_KEYS.NOTIFICATION_NEW_ORDER]: true,
  [SETTING_KEYS.NOTIFICATION_LOW_STOCK]: true,
  [SETTING_KEYS.NOTIFICATION_NEW_REVIEW]: true,
  [SETTING_KEYS.NOTIFICATION_PAYMENT]: true,
  [SETTING_KEYS.CURRENCY]: 'VND',
};

/**
 * Get all settings
 */
const getAllSettings = async () => {
  const settings = await Setting.find({});
  const settingsMap = {};
  
  // Start with defaults
  Object.keys(DEFAULT_SETTINGS).forEach(key => {
    settingsMap[key] = DEFAULT_SETTINGS[key];
  });
  
  // Override with saved values
  settings.forEach(setting => {
    settingsMap[setting.key] = setting.value;
  });
  
  return settingsMap;
};

/**
 * Get setting by key
 */
const getSettingByKey = async (key) => {
  const setting = await Setting.findOne({ key });
  if (setting) {
    return setting.value;
  }
  return DEFAULT_SETTINGS[key] || null;
};

/**
 * Update single setting
 */
const updateSetting = async (key, value, type = 'string', description = '') => {
  const setting = await Setting.findOneAndUpdate(
    { key },
    { value, type, description },
    { upsert: true, new: true }
  );
  return setting;
};

/**
 * Update multiple settings
 */
const updateSettings = async (settingsData) => {
  const updates = [];
  
  for (const [key, value] of Object.entries(settingsData)) {
    if (Object.values(SETTING_KEYS).includes(key)) {
      const type = typeof value === 'number' ? 'number' 
        : typeof value === 'boolean' ? 'boolean'
        : typeof value === 'object' ? 'json'
        : 'string';
      
      updates.push(
        Setting.findOneAndUpdate(
          { key },
          { value, type },
          { upsert: true, new: true }
        )
      );
    }
  }
  
  await Promise.all(updates);
  return getAllSettings();
};

/**
 * Get restaurant info settings
 */
const getRestaurantInfo = async () => {
  const settings = await getAllSettings();
  return {
    name: settings[SETTING_KEYS.RESTAURANT_NAME],
    address: settings[SETTING_KEYS.RESTAURANT_ADDRESS],
    phone: settings[SETTING_KEYS.RESTAURANT_PHONE],
    email: settings[SETTING_KEYS.RESTAURANT_EMAIL],
    logo: settings[SETTING_KEYS.RESTAURANT_LOGO],
    operatingHours: typeof settings[SETTING_KEYS.OPERATING_HOURS] === 'string' 
      ? JSON.parse(settings[SETTING_KEYS.OPERATING_HOURS])
      : settings[SETTING_KEYS.OPERATING_HOURS],
  };
};

/**
 * Update restaurant info
 */
const updateRestaurantInfo = async (data) => {
  const updates = {};
  
  if (data.name !== undefined) updates[SETTING_KEYS.RESTAURANT_NAME] = data.name;
  if (data.address !== undefined) updates[SETTING_KEYS.RESTAURANT_ADDRESS] = data.address;
  if (data.phone !== undefined) updates[SETTING_KEYS.RESTAURANT_PHONE] = data.phone;
  if (data.email !== undefined) updates[SETTING_KEYS.RESTAURANT_EMAIL] = data.email;
  if (data.logo !== undefined) updates[SETTING_KEYS.RESTAURANT_LOGO] = data.logo;
  if (data.operatingHours !== undefined) {
    updates[SETTING_KEYS.OPERATING_HOURS] = JSON.stringify(data.operatingHours);
  }
  
  await updateSettings(updates);
  return getRestaurantInfo();
};

/**
 * Get tax settings
 */
const getTaxSettings = async () => {
  const settings = await getAllSettings();
  return {
    vatPercent: Number(settings[SETTING_KEYS.VAT_PERCENT]),
    serviceChargePercent: Number(settings[SETTING_KEYS.SERVICE_CHARGE_PERCENT]),
  };
};

/**
 * Update tax settings
 */
const updateTaxSettings = async (data) => {
  const updates = {};
  
  if (data.vatPercent !== undefined) {
    if (data.vatPercent < 0 || data.vatPercent > 100) {
      throw new ValidationError('VAT percent must be between 0 and 100');
    }
    updates[SETTING_KEYS.VAT_PERCENT] = data.vatPercent;
  }
  
  if (data.serviceChargePercent !== undefined) {
    if (data.serviceChargePercent < 0 || data.serviceChargePercent > 100) {
      throw new ValidationError('Service charge percent must be between 0 and 100');
    }
    updates[SETTING_KEYS.SERVICE_CHARGE_PERCENT] = data.serviceChargePercent;
  }
  
  await updateSettings(updates);
  return getTaxSettings();
};

/**
 * Get notification settings
 */
const getNotificationSettings = async () => {
  const settings = await getAllSettings();
  return {
    newOrder: settings[SETTING_KEYS.NOTIFICATION_NEW_ORDER],
    lowStock: settings[SETTING_KEYS.NOTIFICATION_LOW_STOCK],
    newReview: settings[SETTING_KEYS.NOTIFICATION_NEW_REVIEW],
    payment: settings[SETTING_KEYS.NOTIFICATION_PAYMENT],
  };
};

/**
 * Update notification settings
 */
const updateNotificationSettings = async (data) => {
  const updates = {};
  
  if (data.newOrder !== undefined) updates[SETTING_KEYS.NOTIFICATION_NEW_ORDER] = data.newOrder;
  if (data.lowStock !== undefined) updates[SETTING_KEYS.NOTIFICATION_LOW_STOCK] = data.lowStock;
  if (data.newReview !== undefined) updates[SETTING_KEYS.NOTIFICATION_NEW_REVIEW] = data.newReview;
  if (data.payment !== undefined) updates[SETTING_KEYS.NOTIFICATION_PAYMENT] = data.payment;
  
  await updateSettings(updates);
  return getNotificationSettings();
};

module.exports = {
  SETTING_KEYS,
  DEFAULT_SETTINGS,
  getAllSettings,
  getSettingByKey,
  updateSetting,
  updateSettings,
  getRestaurantInfo,
  updateRestaurantInfo,
  getTaxSettings,
  updateTaxSettings,
  getNotificationSettings,
  updateNotificationSettings,
};
