/**
 * Sales Report Component
 * Displays top-selling items and category performance
 */

"use client"

import { TrendingUp, Package } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { SalesReport } from "@/types/report"

interface SalesReportProps {
  report: SalesReport | null
  loading: boolean
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value)
}

export function SalesReportComponent({ report, loading }: SalesReportProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
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

  const maxSales = Math.max(...(report.topItems?.map(i => i.salesCount) || [1]))
  const maxCategoryRevenue = Math.max(...(report.categoryPerformance?.map(c => c.revenue) || [1]))

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Top Selling Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Món bán chạy nhất
          </CardTitle>
        </CardHeader>
        <CardContent>
          {report.topItems && report.topItems.length > 0 ? (
            <div className="space-y-4">
              {report.topItems.slice(0, 10).map((item, index) => (
                <div key={item.menuItemId} className="flex items-center gap-3">
                  <span className="text-lg font-bold text-muted-foreground w-6">
                    {index + 1}
                  </span>
                  <div className="h-10 w-10 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl.startsWith('http') ? item.imageUrl : `http://localhost:3000${item.imageUrl}`}
                        alt={item.name}
                        className="h-10 w-10 object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.nextElementSibling?.classList.remove('hidden')
                        }}
                      />
                    ) : null}
                    <span className={`text-xs text-muted-foreground ${item.imageUrl ? 'hidden' : ''}`}>
                      {item.name.substring(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress 
                        value={(item.salesCount / maxSales) * 100} 
                        className="h-2 flex-1"
                      />
                      <Badge variant="secondary" className="text-xs">
                        {item.salesCount} bán
                      </Badge>
                    </div>
                  </div>
                  <span className="text-sm font-medium">
                    {formatCurrency(item.revenue)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Chưa có dữ liệu
            </p>
          )}
        </CardContent>
      </Card>

      {/* Category Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Hiệu suất danh mục
          </CardTitle>
        </CardHeader>
        <CardContent>
          {report.categoryPerformance && report.categoryPerformance.length > 0 ? (
            <div className="space-y-4">
              {report.categoryPerformance.map((category) => (
                <div key={category.categoryId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{category.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{category.salesCount} bán</Badge>
                      <span className="text-sm font-medium">
                        {formatCurrency(category.revenue)}
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={(category.revenue / maxCategoryRevenue) * 100} 
                    className="h-2"
                  />
                </div>
              ))}
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
