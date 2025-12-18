"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy } from "lucide-react"

interface TopItemData {
  rank: number
  id: string
  name: string
  totalQuantity: number
  totalRevenue: number
}

interface TopItemsChartProps {
  data: TopItemData[]
}

const RANK_COLORS = [
  "hsl(45, 93%, 47%)",   // Gold
  "hsl(0, 0%, 70%)",     // Silver
  "hsl(30, 50%, 50%)",   // Bronze
  "hsl(var(--chart-2))", // Green
  "hsl(var(--chart-1))", // Blue
]

const RANK_BADGES = ["🥇", "🥈", "🥉", "4", "5"]

export function TopItemsChart({ data }: TopItemsChartProps) {
  const formattedData = data.slice(0, 5).map((item, index) => ({
    ...item,
    shortName: item.name.length > 20 ? item.name.slice(0, 20) + "..." : item.name,
    fill: RANK_COLORS[index],
    badge: RANK_BADGES[index],
  }))

  const totalQuantity = formattedData.reduce((sum, item) => sum + item.totalQuantity, 0)
  const totalRevenue = formattedData.reduce((sum, item) => sum + item.totalRevenue, 0)
  const maxQuantity = Math.max(...formattedData.map(d => d.totalQuantity), 1)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              Top món bán chạy
            </CardTitle>
            <CardDescription>5 món được đặt nhiều nhất</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{totalQuantity}</p>
            <p className="text-xs text-muted-foreground">tổng số lượng</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Top item highlight */}
        {formattedData[0] && (
          <div className="mb-4 p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏆</span>
              <div className="flex-1">
                <p className="font-semibold">{formattedData[0].name}</p>
                <p className="text-sm text-muted-foreground">
                  {formattedData[0].totalQuantity} đơn • {formatCurrency(formattedData[0].totalRevenue)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-yellow-600">
                  {((formattedData[0].totalQuantity / totalQuantity) * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">tổng đơn</p>
              </div>
            </div>
          </div>
        )}

        {/* Items list with progress bars */}
        <div className="space-y-3">
          {formattedData.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <span className="w-6 text-center text-lg">{item.badge}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium truncate pr-2">{item.name}</span>
                  <span className="text-sm font-bold whitespace-nowrap">{item.totalQuantity} đơn</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(item.totalQuantity / maxQuantity) * 100}%`,
                      backgroundColor: item.fill,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(item.totalRevenue)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Tổng doanh thu Top 5</span>
          <span className="font-bold">{formatCurrency(totalRevenue)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
