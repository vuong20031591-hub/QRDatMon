/**
 * Application Constants
 * Defines order statuses, payment methods, user roles, and rate limit configurations
 * Requirements: 5.3, 5.4, 6.8, 9.1
 */

// Order statuses
const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  SERVED: 'served',
  CANCELLED: 'cancelled'
};

// Order item statuses
const ORDER_ITEM_STATUS = {
  PENDING: 'pending',
  PREPARING: 'preparing',
  READY: 'ready',
  SERVED: 'served',
  CANCELLED: 'cancelled'
};

// Bill statuses
const BILL_STATUS = {
  OPEN: 'open',
  REQUESTING_PAYMENT: 'requesting_payment',
  PAID: 'paid',
  CANCELLED: 'cancelled'
};

// Payment methods
const PAYMENT_METHOD = {
  CASH: 'cash',
  VIETQR: 'vietqr',
  CARD: 'card',
  MOMO: 'momo',
  ZALOPAY: 'zalopay'
};

// Payment statuses
const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

// User roles (staff roles)
const USER_ROLES = {
  WAITER: 'waiter',
  CASHIER: 'cashier',
  KITCHEN: 'kitchen',
  MANAGER: 'manager',
  ADMIN: 'admin'
};

// All staff roles array for validation
const STAFF_ROLES = Object.values(USER_ROLES);

// Role hierarchy (higher number = more permissions)
const ROLE_HIERARCHY = {
  waiter: 1,
  cashier: 2,
  kitchen: 2,
  manager: 3,
  admin: 4
};

// Auth providers
const AUTH_PROVIDER = {
  LOCAL: 'local',
  GOOGLE: 'google',
  PHONE: 'phone'
};

// Table statuses
const TABLE_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  RESERVED: 'reserved',
  CLEANING: 'cleaning',
  INACTIVE: 'inactive'
};

// Menu item statuses
const MENU_ITEM_STATUS = {
  AVAILABLE: 'available',
  OUT_OF_STOCK: 'out_of_stock',
  HIDDEN: 'hidden'
};

// Promotion types
const PROMOTION_TYPE = {
  PERCENTAGE: 'percentage',
  FIXED_AMOUNT: 'fixed_amount',
  BUY_X_GET_Y: 'buy_x_get_y'
};

// Inventory change reasons
const INVENTORY_CHANGE_REASON = {
  ORDER: 'order',
  ADJUSTMENT: 'adjustment',
  RESTOCK: 'restock',
  WASTE: 'waste',
  OTHER: 'other'
};

// Rate limit configurations
const RATE_LIMITS = {
  // General API rate limit
  GENERAL: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many requests, please try again later'
  },
  // Auth endpoints (stricter)
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 requests per window
    message: 'Too many authentication attempts, please try again later'
  },
  // Login attempts (very strict)
  LOGIN: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 attempts per hour
    message: 'Too many login attempts, please try again in an hour'
  },
  // Order creation
  ORDER: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // 10 orders per minute
    message: 'Too many order requests, please slow down'
  },
  // File upload
  UPLOAD: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 uploads per hour
    message: 'Upload limit reached, please try again later'
  }
};

// Pagination defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
};

// JWT token expiry times
const TOKEN_EXPIRY = {
  ACCESS_TOKEN: '1h',       // 1 hour
  REFRESH_TOKEN: '7d',      // 7 days
  GUEST_TOKEN: '24h',       // 24 hours
  QR_TOKEN: '12h'           // 12 hours for QR codes
};

// WebSocket events
const SOCKET_EVENTS = {
  // Client -> Server
  ORDER_CREATE: 'order:create',
  ORDER_CONFIRM: 'order:confirm',
  ORDER_ITEM_STATUS: 'order:item:status',
  TABLE_JOIN: 'table:join',
  TABLE_LEAVE: 'table:leave',

  // Server -> Client
  ORDER_CREATED: 'order:created',
  ORDER_CONFIRMED: 'order:confirmed',
  ORDER_STATUS_UPDATED: 'order:status:updated',
  ORDER_ITEM_READY: 'order:item:ready',
  TABLE_STATUS_CHANGED: 'table:status:changed',
  MENU_ITEM_UPDATED: 'menu:item:updated',
  NOTIFICATION_PUSH: 'notification:push',
  INVENTORY_LOW: 'inventory:low'
};

// Socket rooms
const SOCKET_ROOMS = {
  KITCHEN: 'kitchen',
  STAFF: 'staff',
  ADMIN: 'admin',
  TABLE_PREFIX: 'table:',
  USER_PREFIX: 'user:'
};

// Error codes
const ERROR_CODES = {
  // Authentication errors (1xxx)
  INVALID_TOKEN: 'E1001',
  TOKEN_EXPIRED: 'E1002',
  UNAUTHORIZED: 'E1003',
  FORBIDDEN: 'E1004',
  INVALID_CREDENTIALS: 'E1005',

  // Validation errors (2xxx)
  VALIDATION_ERROR: 'E2001',
  INVALID_INPUT: 'E2002',
  MISSING_FIELD: 'E2003',
  INVALID_FORMAT: 'E2004',

  // Resource errors (3xxx)
  NOT_FOUND: 'E3001',
  ALREADY_EXISTS: 'E3002',
  CONFLICT: 'E3003',

  // Business logic errors (4xxx)
  ITEM_UNAVAILABLE: 'E4001',
  INSUFFICIENT_STOCK: 'E4002',
  INVALID_VOUCHER: 'E4003',
  VOUCHER_EXPIRED: 'E4004',
  VOUCHER_ALREADY_USED: 'E4005',
  MINIMUM_NOT_MET: 'E4006',
  TABLE_OCCUPIED: 'E4007',
  BILL_ALREADY_PAID: 'E4008',
  ORDER_CANNOT_CANCEL: 'E4009',

  // Server errors (5xxx)
  INTERNAL_ERROR: 'E5001',
  DATABASE_ERROR: 'E5002',
  EXTERNAL_SERVICE_ERROR: 'E5003',

  // Rate limiting (6xxx)
  RATE_LIMIT_EXCEEDED: 'E6001'
};

module.exports = {
  ORDER_STATUS,
  ORDER_ITEM_STATUS,
  BILL_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  USER_ROLES,
  STAFF_ROLES,
  ROLE_HIERARCHY,
  AUTH_PROVIDER,
  TABLE_STATUS,
  MENU_ITEM_STATUS,
  PROMOTION_TYPE,
  INVENTORY_CHANGE_REASON,
  RATE_LIMITS,
  PAGINATION,
  TOKEN_EXPIRY,
  SOCKET_EVENTS,
  SOCKET_ROOMS,
  ERROR_CODES
};
