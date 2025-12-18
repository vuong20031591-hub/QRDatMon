/**
 * Report Types for QRDatMon Web Admin
 */

export interface RevenueData {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface RevenueReport {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  revenueByPeriod: RevenueData[];
  comparison?: {
    previousRevenue: number;
    changePercent: number;
  };
}

export interface PopularItem {
  menuItemId: string;
  name: string;
  imageUrl?: string;
  category?: string;
  salesCount: number;
  revenue: number;
}

export interface SalesReport {
  topItems: PopularItem[];
  categoryPerformance: {
    categoryId: string;
    name: string;
    salesCount: number;
    revenue: number;
  }[];
}

export interface StaffPerformance {
  staffId: string;
  employeeCode: string;
  name: string;
  role: string;
  ordersHandled: number;
  avgServiceTime: number; // in minutes
  totalRevenue: number;
}

export interface StaffReport {
  staffPerformance: StaffPerformance[];
  totalOrdersHandled: number;
  avgServiceTime: number;
}

export interface OperationalMetrics {
  avgOrderTime: number;
  peakHours: {
    hour: number;
    orderCount: number;
  }[];
  tableUtilization: number;
  cancelRate: number;
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
  staffId?: string;
  categoryId?: string;
}

export type ReportType = 'revenue' | 'sales' | 'staff' | 'operations';
