/**
 * Order Types for QRDatMon Web Admin
 */

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled';
export type OrderItemStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';

export interface OrderTopping {
  toppingGroupId: string;
  toppingId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface OrderItem {
  id: string;
  menuItem?: {
    id: string;
    name: string;
    imageUrl?: string;
  };
  combo?: {
    id: string;
    name: string;
    imageUrl?: string;
  };
  itemName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  note?: string;
  status: OrderItemStatus;
  toppings: OrderTopping[];
  priority?: number;
  startedAt?: string;
  completedAt?: string;
  servedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  note?: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
  };
  bill?: {
    id: string;
    billNumber?: string;
    tableNumber?: string;
  };
  confirmedBy?: {
    id: string;
    name?: string;
  };
  cancelledBy?: {
    id: string;
    name?: string;
  };
  cancelReason?: string;
  items: OrderItem[];
  confirmedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderFilters {
  status?: OrderStatus;
  tableId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface OrderPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
