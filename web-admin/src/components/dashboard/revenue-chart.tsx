"use client"

import { useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp, TrendingDown } from "lucide-react"

interface RevenueData {
  date: string
  revenue: number
}

interface RevenueChartProps {
  data: RevenueData[]
  title?: string
  description?: string
}

const chartConfig = {
  revenue: {
    label: "Doanh thu",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

type TimeRange = "7d" | "30d" | "90d"

export function RevenueChart({ data, title = "Doanh thu", description }: RevenueChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d")

  const filteredData = (() => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
    return data.slice(-days)
  })()

  const totalRevenue = filteredData.reduce((sum, item) => sum + item.revenue, 0)
  const avgRevenue = filteredData.length > 0 ? totalRevenue / filteredData.length : 0
  
  // Calculate trend
  const midPoint = Math.floor(filteredData.length / 2)
  const firstHalf = filteredData.slice(0, midPoint).reduce((sum, item) => sum + item.revenue, 0)
  const secondHalf = filteredData.slice(midPoint).reduce((sum, item) => sum + item.revenue, 0)
  const trend = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0
  const isPositive = trend >= 0

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
    return value.toString()
  }

  const formatFullCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          <CardDescription>{description || `${timeRange === "7d" ? "7" : timeRange === "30d" ? "30" : "90"} ngày gần nhất`}</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {["7d", "30d", "90d"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range as TimeRange)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                timeRange === range
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {range === "7d" ? "7 ngày" : range === "30d" ? "30 ngày" : "90 ngày"}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Tổng doanh thu</p>
            <p className="text-xl font-bold">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Trung bình/ngày</p>
            <p className="text-xl font-bold">{formatCurrency(avgRevenue)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Xu hướng</p>
            <div className={`flex items-center gap-1 text-xl font-bold ${isPositive ? "text-green-600" : "text-red-600"}`}>
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {Math.abs(trend).toFixed(1)}%
            </div>
          </div>
        </div>

        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgb(59, 130, 246)" stopOpacity={0.5} />
                <stop offset="50%" stopColor="rgb(59, 130, 246)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="rgb(59, 130, 246)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 11 }}
              tickFormatter={(value) => {
                const date = new Date(value)
                return `${date.getDate()}/${date.getMonth() + 1}`
              }}
              interval={timeRange === "7d" ? 0 : timeRange === "30d" ? 4 : 10}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 11 }}
              tickFormatter={formatCurrency}
              width={50}
            />
            <ChartTooltip
              cursor={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1, strokeDasharray: "4 4" }}
              content={
                <ChartTooltipContent
                  formatter={(value) => [formatFullCurrency(value as number), "Doanh thu"]}
                  labelFormatter={(label) => {
                    const date = new Date(String(label))
                    return date.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" })
                  }}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="rgb(59, 130, 246)"
              fill="url(#fillRevenue)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 2, stroke: "hsl(var(--background))" }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
