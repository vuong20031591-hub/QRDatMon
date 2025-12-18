/**
 * Auth Hook - Custom hook for authentication
 */

'use client';

import { useAuthStore } from '@/stores/auth-store';
import type { UserRole } from '@/types';

const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 5,
  manager: 4,
  cashier: 3,
  waiter: 2,
  kitchen: 1,
};

export function useAuth() {
  const { user, staff, isAuthenticated, isLoading, logout } = useAuthStore();
  
  const role = staff?.role || user?.role;
  
  const hasRole = (requiredRole: UserRole): boolean => {
    if (!role) return false;
    return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[requiredRole];
  };
  
  const hasAnyRole = (roles: UserRole[]): boolean => {
    // Nếu chưa có role (chưa đăng nhập), hiển thị tất cả menu cho development
    if (!role) return true;
    return roles.includes(role);
  };
  
  const isAdmin = role === 'admin';
  const isManager = hasRole('manager');
  const isStaff = !!staff;
  
  return {
    user,
    staff,
    role,
    isAuthenticated,
    isLoading,
    isAdmin,
    isManager,
    isStaff,
    hasRole,
    hasAnyRole,
    logout,
  };
}
