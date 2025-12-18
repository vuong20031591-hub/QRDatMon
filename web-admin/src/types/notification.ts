/**
 * Notification Types
 */

export type NotificationType = 
  | 'order_confirmed' 
  | 'order_ready' 
  | 'order_served' 
  | 'payment_success' 
  | 'promotion' 
  | 'system';

export interface Notification {
  id: string;
  _id?: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: NotificationPagination;
}

export interface UnreadCountResponse {
  count: number;
}
