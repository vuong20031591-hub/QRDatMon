"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell, ReferenceLine } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Clock } from "lucide-react"

interface OrdersByHourData {
  hour: number
  count: number
  revenue: number
}

interface OrdersByHourChartProps {
  data: OrdersByHourData[]
}

const chartConfig = {
  count: {
    label: "Đơn hàng",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function OrdersByHourChart({ data }: OrdersByHourChartProps) {
  // Fill missing hours with 0
  const fullData = Array.from({ length: 24 }, (_, i) => {
    const existing = data.find(d => d.hour === i)
    return {
      hour: i,
      count: existing?.count || 0,
      revenue: existing?.revenue || 0,
      hourLabel: `${i.toString().padStart(2, "0")}:00`,
    }
  })

  const totalOrders = fullData.reduce((sum, d) => sum + d.count, 0)
  const peakHour = fullData.reduce((max, d) => d.count > max.count ? d : max, fullData[0])
  const avgOrders = totalOrders / 24

  // Identify peak hours (above average)
  const isPeakHour = (count: number) => count > avgOrders * 1.5

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Đơn hàng theo giờ
            </CardTitle>
            <CardDescription>Phân bố đơn hàng trong ngày</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{totalOrders}</p>
            <p className="text-xs text-muted-foreground">tổng đơn</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {/* Peak hour indicator */}
        <div className="flex items-center gap-4 mb-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Giờ cao điểm</p>
            <p className="font-semibold">{peakHour.hourLabel} - {peakHour.count} đơn</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-muted-foreground">Cao điểm</span>
            <span className="w-3 h-3 rounded-full bg-emerald-500 ml-2" />
            <span className="text-muted-foreground">Bình thường</span>
          </div>
        </div>

        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <BarChart data={fullData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="hourLabel"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 10 }}
              interval={2}
            />
            <YAxis 
              tickLine={false} 
              axisLine={false} 
              tickMargin={8} 
              tick={{ fontSize: 10 }}
              width={30}
            />
            <ReferenceLine 
              y={avgOrders} 
              stroke="hsl(var(--muted-foreground))" 
              strokeDasharray="4 4" 
              strokeOpacity={0.5}
            />
            <ChartTooltip
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
              content={
                <ChartTooltipContent
                  formatter={(value, _name, item) => {
                    const payload = item?.payload as Record<string, number> | undefined
                    return [
                      `${value} đơn`,
                      isPeakHour(payload?.count ?? 0) ? "🔥 Giờ cao điểm" : "Đơn hàng"
                    ]
                  }}
                />
              }
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={20}>
              {fullData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={isPeakHour(entry.count) ? "hsl(25, 95%, 53%)" : "hsl(160, 60%, 45%)"}
                  opacity={entry.count === 0 ? 0.2 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
