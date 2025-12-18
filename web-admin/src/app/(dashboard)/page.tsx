/**
 * Dashboard Overview Page - Real API data
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, ShoppingCart, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { StatCard, StatCardSkeleton } from '@/components/shared/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RevenueChart, OrdersByHourChart, PaymentMethodsChart, TopItemsChart } from '@/components/dashboard';
import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/stores/auth-store';

interface DashboardStats {
  today: {
    revenue: number;
    billCount: number;
    orderCount: number;
    pendingOrders: number;
  };
  comparison: {
    revenueChange: number;
    revenueChangeType: 'increase' | 'decrease';
  };
}

interface RevenueData {
  date: string;
  revenue: number;
}

interface OrdersByHourData {
  hour: number;
  count: number;
  revenue: number;
}

interface PaymentMethodData {
  method: string;
  total: number;
  count: number;
  percentage: number;
}

interface PopularItemData {
  rank: number;
  id: string;
  name: string;
  totalQuantity: number;
  totalRevenue: number;
}


interface RecentOrder {
  id: string;
  orderNumber: string;
  bill?: { 
    id: string;
    billNumber: string;
    tableNumber?: number | null;
  };
  items: unknown[];
  status: string;
  totalAmount: number;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [ordersByHour, setOrdersByHour] = useState<OrdersByHourData[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodData[]>([]);
  const [popularItems, setPopularItems] = useState<PopularItemData[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Chờ auth state hydrate xong
    if (!_hasHydrated) return;
    
    // Redirect về login nếu chưa đăng nhập
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchDashboardData = async () => {
      setIsLoading(true);
      
      try {
        const [dashboardRes, revenueRes, opsRes, popularRes, ordersRes] = await Promise.allSettled([
          apiClient.get('/reports/dashboard'),
          apiClient.get('/reports/revenue?groupBy=day'),
          apiClient.get('/reports/operations'),
          apiClient.get('/reports/popular-items?limit=5'),
          apiClient.get('/orders?limit=5&sort=-createdAt'),
        ]);

        if (dashboardRes.status === 'fulfilled') {
          setStats(dashboardRes.value.data.data);
        }

        if (revenueRes.status === 'fulfilled' && revenueRes.value.data.data?.revenueByPeriod) {
          setRevenueData(revenueRes.value.data.data.revenueByPeriod.map((item: { period: string; revenue: number }) => ({
            date: item.period,
            revenue: item.revenue,
          })));
          if (revenueRes.value.data.data?.paymentBreakdown) {
            setPaymentMethods(revenueRes.value.data.data.paymentBreakdown);
          }
        }

        if (opsRes.status === 'fulfilled' && opsRes.value.data.data?.ordersByHour) {
          setOrdersByHour(opsRes.value.data.data.ordersByHour);
        }

        if (popularRes.status === 'fulfilled' && popularRes.value.data.data?.popularItems) {
          setPopularItems(popularRes.value.data.data.popularItems);
        }

        if (ordersRes.status === 'fulfilled' && ordersRes.value.data.data) {
          const orders = ordersRes.value.data.data.orders || ordersRes.value.data.data;
          setRecentOrders(Array.isArray(orders) ? orders.slice(0, 5) : []);
        }
      } catch {
        // Silent fail - show empty state
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, _hasHydrated, router]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const getTimeAgo = (dateString: string) => {
    const diffMins = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);
    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ`;
    return `${Math.floor(diffHours / 24)} ngày`;
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      pending: { label: 'Đang chờ', cls: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
      confirmed: { label: 'Đã xác nhận', cls: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      preparing: { label: 'Đang làm', cls: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
      ready: { label: 'Sẵn sàng', cls: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      served: { label: 'Đã phục vụ', cls: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
      cancelled: { label: 'Đã hủy', cls: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    };
    return map[status] || { label: status, cls: 'bg-gray-100 text-gray-800' };
  };


  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Tổng quan hoạt động nhà hàng hôm nay</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>{[1,2,3,4].map(i => <StatCardSkeleton key={i} />)}</>
        ) : (
          <>
            <StatCard
              title="Doanh thu hôm nay"
              value={formatCurrency(stats?.today?.revenue || 0)}
              icon={DollarSign}
              trend={stats?.comparison ? {
                value: Math.abs(stats.comparison.revenueChange),
                isPositive: stats.comparison.revenueChangeType === 'increase',
              } : undefined}
              description="so với hôm qua"
            />
            <StatCard title="Tổng đơn hàng" value={stats?.today?.orderCount || 0} icon={ShoppingCart} description="hôm nay" />
            <StatCard title="Đơn đang chờ" value={stats?.today?.pendingOrders || 0} icon={Clock} description="cần xử lý" />
            <StatCard title="Hóa đơn hoàn thành" value={stats?.today?.billCount || 0} icon={CheckCircle} description="hôm nay" />
          </>
        )}
      </div>

      {revenueData.length > 0 && (
        <RevenueChart data={revenueData} title="Biểu đồ doanh thu" description="Doanh thu 30 ngày gần nhất" />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {ordersByHour.length > 0 && <OrdersByHourChart data={ordersByHour} />}
        {paymentMethods.length > 0 && <PaymentMethodsChart data={paymentMethods} />}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {popularItems.length > 0 && <TopItemsChart data={popularItems} />}
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />Đơn hàng gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => {
                  const st = getStatusLabel(order.status);
                  const tableDisplay = order.bill?.tableNumber 
                    ? `Bàn ${order.bill.tableNumber}` 
                    : order.orderNumber?.slice(-8) || 'Đơn hàng';
                  return (
                    <div key={order.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium">{tableDisplay}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.items?.length || 0} món • {formatCurrency(order.totalAmount)} • {getTimeAgo(order.createdAt)} trước
                        </p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${st.cls}`}>{st.label}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Chưa có đơn hàng nào</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
