/**
 * Core Types for QRDatMon Web Admin
 */

// User & Auth Types
export type UserRole = 'admin' | 'manager' | 'waiter' | 'cashier' | 'kitchen';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  isGuest: boolean;
  createdAt: string;
}

export interface Staff {
  id: string;
  userId: string;
  user?: User;
  employeeCode: string;
  role: UserRole;
  hireDate: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StaffFormData {
  userId: string;
  employeeCode: string;
  role: UserRole;
  hireDate?: string;
}

// Bill Types
export type BillStatus = 'open' | 'requesting_payment' | 'paid' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'qr';

export interface Bill {
  id: string;
  billNumber: string;
  table: string | Table;
  cashier?: string | Staff;
  promotion?: string | Promotion;
  guestCount: number;
  subtotal: number;
  discountAmount: number;
  serviceChargePercent: number;
  serviceChargeAmount: number;
  vatPercent: number;
  vatAmount: number;
  totalAmount: number;
  status: BillStatus;
  cancelReason?: string;
  openedAt: string;
  paymentRequestedAt?: string;
  closedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BillFormData {
  tableId: string;
  guestCount?: number;
  serviceChargePercent?: number;
  vatPercent?: number;
}

// Payment Types
export interface Payment {
  id: string;
  bill: string | Bill;
  method: PaymentMethod;
  amount: number;
  transactionId?: string;
  note?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  processedBy?: string | Staff;
  createdAt?: string;
  updatedAt?: string;
}

// Promotion Types
export type DiscountType = 'percent' | 'fixed';

export interface Promotion {
  id: string;
  code: string;
  name: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number | null;
  startDate: string;
  endDate: string;
  usageLimit?: number | null;
  usagePerUser: number;
  usedCount: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PromotionFormData {
  code: string;
  name: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number | null;
  startDate: string;
  endDate: string;
  usageLimit?: number | null;
  usagePerUser?: number;
}

// Activity Log Types
export interface ActivityLog {
  id: string;
  staff: string | Staff;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginResponse {
  user: User;
  staff?: Staff;
  accessToken: string;
  refreshToken: string;
}

// Menu Types
export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type MenuItemStatus = 'available' | 'out_of_stock' | 'suspended';

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  costPrice?: number;
  unit?: string;
  category: string | Category;
  imageUrl?: string;
  status: MenuItemStatus;
  isPopular?: boolean;
  isNew?: boolean;
  preparationTime?: number;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MenuItemFormData {
  name: string;
  description?: string;
  price: number;
  costPrice?: number;
  unit?: string;
  category: string;
  imageUrl?: string;
  status: MenuItemStatus;
  isPopular?: boolean;
  isNew?: boolean;
  preparationTime?: number;
}

// Table Types
export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning';

export interface Area {
  id: string;
  name: string;
  description?: string;
  floor?: number;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Table {
  id: string;
  tableNumber: string;
  area: string | Area;
  capacity: number;
  status: TableStatus;
  qrCodeUrl?: string;
  qrToken?: string;
  position?: { x: number; y: number };
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TableFormData {
  tableNumber: string;
  area: string;
  capacity: number;
  status?: TableStatus;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}


// Re-export Order types
export * from './order';

// Re-export Inventory types
export * from './inventory';

// Re-export Review types
export * from './review';

// Re-export Report types
export * from './report';
