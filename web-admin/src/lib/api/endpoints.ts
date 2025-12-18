/**
 * API Endpoints Definition
 */

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    GOOGLE_LOGIN: '/auth/google',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  
  // Menu
  MENU: {
    LIST: '/menu',
    ITEMS: '/menu/items',
    ITEM: (id: string) => `/menu/${id}`,
    CREATE: '/menu',
    UPDATE: (id: string) => `/menu/${id}`,
    DELETE: (id: string) => `/menu/${id}`,
    BULK_STATUS: '/menu/bulk-status',
  },
  
  // Categories
  CATEGORIES: {
    LIST: '/categories',
    CREATE: '/categories',
    UPDATE: (id: string) => `/categories/${id}`,
    DELETE: (id: string) => `/categories/${id}`,
  },
  
  // Tables
  TABLES: {
    LIST: '/tables',
    MAP: '/tables/map',
    CREATE: '/tables',
    UPDATE: (id: string) => `/tables/${id}`,
    DELETE: (id: string) => `/tables/${id}`,
    GENERATE_QR: (id: string) => `/tables/${id}/qr`,
    UPDATE_STATUS: (id: string) => `/tables/${id}/status`,
  },
  
  // Areas (Zones)
  AREAS: {
    LIST: '/areas',
    CREATE: '/areas',
    UPDATE: (id: string) => `/areas/${id}`,
    DELETE: (id: string) => `/areas/${id}`,
  },
  
  // Orders
  ORDERS: {
    LIST: '/orders',
    KITCHEN: '/orders/kitchen',
    DETAIL: (id: string) => `/orders/${id}`,
    UPDATE_STATUS: (id: string) => `/orders/${id}/status`,
    CANCEL: (id: string) => `/orders/${id}/cancel`,
    CONFIRM: (id: string) => `/orders/${id}/confirm`,
    ITEM_STATUS: (orderId: string, itemId: string) => `/orders/${orderId}/items/${itemId}/status`,
  },
  
  // Staff
  STAFF: {
    LIST: '/staff',
    ME: '/staff/me',
    DETAIL: (id: string) => `/staff/${id}`,
    CREATE: '/staff',
    UPDATE: (id: string) => `/staff/${id}`,
    DEACTIVATE: (id: string) => `/staff/${id}/deactivate`,
    ACTIVATE: (id: string) => `/staff/${id}/activate`,
    SHIFTS: (id: string) => `/staff/${id}/shifts`,
  },

  // Bills
  BILLS: {
    LIST: '/bills',
    DETAIL: (id: string) => `/bills/${id}`,
    BY_TABLE: (tableId: string) => `/bills/table/${tableId}`,
    APPLY_VOUCHER: (id: string) => `/bills/${id}/voucher`,
    REMOVE_VOUCHER: (id: string) => `/bills/${id}/voucher`,
    REQUEST_PAYMENT: (id: string) => `/bills/${id}/request-payment`,
    CLOSE: (id: string) => `/bills/${id}/close`,
    CANCEL: (id: string) => `/bills/${id}/cancel`,
    UPDATE_RATES: (id: string) => `/bills/${id}/rates`,
    RECALCULATE: (id: string) => `/bills/${id}/recalculate`,
    HISTORY: '/bills/history',
  },

  // Payments
  PAYMENTS: {
    CONFIRM: '/payments/confirm',
    DETAIL: (id: string) => `/payments/${id}`,
    BY_BILL: (billId: string) => `/payments/bill/${billId}`,
    STATUS: (billId: string) => `/payments/status/${billId}`,
    HISTORY: '/payments/history',
  },

  // Promotions
  PROMOTIONS: {
    LIST: '/promotions',
    ALL: '/promotions/all',
    DETAIL: (id: string) => `/promotions/${id}`,
    CREATE: '/promotions',
    UPDATE: (id: string) => `/promotions/${id}`,
    DEACTIVATE: (id: string) => `/promotions/${id}/deactivate`,
    REACTIVATE: (id: string) => `/promotions/${id}/reactivate`,
    VALIDATE: (code: string) => `/promotions/validate/${code}`,
    GENERATE_CODE: '/promotions/generate-code',
    USAGE: (id: string) => `/promotions/${id}/usage`,
    CLEANUP: '/promotions/cleanup',
  },

  // Activity Logs
  ACTIVITY_LOGS: {
    LIST: '/activity-logs',
  },
  
  // Reports
  REPORTS: {
    DASHBOARD: '/reports/dashboard',
    REVENUE: '/reports/revenue',
    SALES: '/reports/sales',
  },

  // Settings
  SETTINGS: {
    ALL: '/settings',
    RESTAURANT: '/settings/restaurant',
    TAX: '/settings/tax',
    NOTIFICATIONS: '/settings/notifications',
  },
  
  // Health
  HEALTH: '/health',
} as const;
