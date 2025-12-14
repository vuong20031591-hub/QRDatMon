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
  },
  
  // Orders
  ORDERS: {
    LIST: '/orders',
    KITCHEN: '/orders/kitchen',
    DETAIL: (id: string) => `/orders/${id}`,
    UPDATE_STATUS: (id: string) => `/orders/${id}/status`,
  },
  
  // Staff
  STAFF: {
    LIST: '/staff',
    ME: '/staff/me',
    CREATE: '/staff',
    UPDATE: (id: string) => `/staff/${id}`,
  },
  
  // Reports
  REPORTS: {
    DASHBOARD: '/reports/dashboard',
    REVENUE: '/reports/revenue',
    SALES: '/reports/sales',
  },
  
  // Health
  HEALTH: '/health',
} as const;
