/**
 * Dashboard Overview Page
 */

'use client';

import { useEffect, useState } from 'react';
import { DollarSign, ShoppingCart, Clock, CheckCircle } from 'lucide-react';
import { StatCard, StatCardSkeleton } from '@/components/shared/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import apiClient from '@/lib/api/client';

interface DashboardStats {
  todayRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.get('/reports/dashboard');
        setStats(response.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        // Set mock data for demo
        setStats({
          todayRevenue: 5250000,
          totalOrders: 48,
          pendingOrders: 5,
          completedOrders: 43,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Tổng quan hoạt động nhà hàng hôm nay
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Doanh thu hôm nay"
              value={formatCurrency(stats?.todayRevenue || 0)}
              icon={DollarSign}
              trend={{ value: 12, isPositive: true }}
              description="so với hôm qua"
            />
            <StatCard
              title="Tổng đơn hàng"
              value={stats?.totalOrders || 0}
              icon={ShoppingCart}
              trend={{ value: 8, isPositive: true }}
              description="so với hôm qua"
            />
            <StatCard
              title="Đơn đang chờ"
              value={stats?.pendingOrders || 0}
              icon={Clock}
              description="cần xử lý"
            />
            <StatCard
              title="Đơn hoàn thành"
              value={stats?.completedOrders || 0}
              icon={CheckCircle}
              description="hôm nay"
            />
          </>
        )}
      </div>

      {/* Recent Orders */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Đơn hàng gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium">Bàn {i + 2}</p>
                    <p className="text-sm text-muted-foreground">2 món • 5 phút trước</p>
                  </div>
                  <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
                    Đang chờ
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Món bán chạy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['Phở bò', 'Cơm sườn', 'Bún chả'].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                      {i + 1}
                    </span>
                    <span>{item}</span>
                  </div>
                  <span className="text-muted-foreground">{30 - i * 5} đơn</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
