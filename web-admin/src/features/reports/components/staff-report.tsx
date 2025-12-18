/**
 * Staff Report Component
 * Displays orders handled and average service time per staff
 */

"use client"

import { Users, Clock, ShoppingCart, DollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import type { StaffReport } from "@/types/report"

interface StaffReportProps {
  report: StaffReport | null
  loading: boolean
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value)
}

const formatTime = (minutes: number) => {
  if (minutes < 60) return `${Math.round(minutes)} phút`
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  return `${hours}h ${mins}p`
}

const getRoleBadge = (role: string) => {
  const roleMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
    admin: { label: 'Admin', variant: 'default' },
    manager: { label: 'Quản lý', variant: 'default' },
    waiter: { label: 'Phục vụ', variant: 'secondary' },
    cashier: { label: 'Thu ngân', variant: 'secondary' },
    kitchen: { label: 'Bếp', variant: 'outline' },
  }
  return roleMap[role] || { label: role, variant: 'outline' as const }
}

export function StaffReportComponent({ report, loading }: StaffReportProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  if (!report) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Không có dữ liệu báo cáo
        </CardContent>
      </Card>
    )
  }

  const maxOrders = Math.max(...(report.staffPerformance?.map(s => s.ordersHandled) || [1]))

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng đơn xử lý</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.totalOrdersHandled}</div>
            <p className="text-sm text-muted-foreground">đơn hàng</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thời gian phục vụ TB</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(report.avgServiceTime)}</div>
            <p className="text-sm text-muted-foreground">trung bình</p>
          </CardContent>
        </Card>
      </div>

      {/* Staff Performance List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Hiệu suất nhân viên
          </CardTitle>
        </CardHeader>
        <CardContent>
          {report.staffPerformance && report.staffPerformance.length > 0 ? (
            <div className="space-y-4">
              {report.staffPerformance.map((staff, index) => {
                const roleBadge = getRoleBadge(staff.role)
                
                return (
                  <div key={staff.staffId} className="flex items-center gap-4 p-3 rounded-lg border">
                    <span className="text-lg font-bold text-muted-foreground w-6">
                      {index + 1}
                    </span>
                    <Avatar>
                      <AvatarFallback>
                        {staff.name?.charAt(0) || staff.employeeCode.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{staff.name || staff.employeeCode}</p>
                        <Badge variant={roleBadge.variant}>{roleBadge.label}</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <ShoppingCart className="h-3 w-3" />
                          {staff.ordersHandled} đơn
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(staff.avgServiceTime)}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(staff.totalRevenue)}
                        </span>
                      </div>
                      <Progress 
                        value={(staff.ordersHandled / maxOrders) * 100} 
                        className="h-2 mt-2"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Chưa có dữ liệu
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
