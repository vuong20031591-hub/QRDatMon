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
  employeeCode: string;
  role: UserRole;
  hireDate: string;
  isActive: boolean;
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
  sortOrder: number;
  isActive: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  category?: Category;
  imageUrl?: string;
  status: 'available' | 'out_of_stock' | 'suspended';
}
