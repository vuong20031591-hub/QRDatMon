/**
 * Inventory Types for QRDatMon Web Admin
 */

export interface InventoryItem {
  id: string;
  menuItem: {
    id: string;
    name: string;
    imageUrl?: string;
    price: number;
    status: string;
    category?: {
      id: string;
      name: string;
    };
  };
  quantity: number;
  minThreshold: number;
  unit: string;
  autoUpdateStatus: boolean;
  isLowStock: boolean;
  isOutOfStock: boolean;
  lastRestockedAt?: string;
  lastRestockedBy?: {
    id: string;
    employeeCode: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface InventoryLog {
  id: string;
  inventory: string;
  menuItem: {
    id: string;
    name: string;
  };
  action: 'add' | 'deduct' | 'adjust' | 'restock';
  quantityBefore: number;
  quantityChange: number;
  quantityAfter: number;
  reason?: string;
  reference?: {
    type: 'order' | 'manual' | 'adjustment' | 'restock';
    id?: string;
  };
  performedBy?: {
    id: string;
    employeeCode: string;
  };
  createdAt: string;
}

export interface InventoryFilters {
  lowStock?: boolean;
  outOfStock?: boolean;
  search?: string;
  sortBy?: 'quantity' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface InventoryPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface StockUpdateInput {
  quantityChange: number;
  reason?: string;
  referenceType?: 'manual' | 'restock' | 'adjustment';
}

export interface InventorySettingsInput {
  minThreshold?: number;
  unit?: string;
  autoUpdateStatus?: boolean;
}

export interface LowStockAlert {
  items: InventoryItem[];
  count: number;
}
