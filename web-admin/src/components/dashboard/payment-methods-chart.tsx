"use client"

import { Cell, Pie, PieChart, Sector } from "recharts"
import type { PieSectorDataItem } from "recharts/types/polar/Pie"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { CreditCard, Banknote, QrCode, Wallet } from "lucide-react"

interface PaymentMethodData {
  method: string
  total: number
  count: number
  percentage: number
}

interface PaymentMethodsChartProps {
  data: PaymentMethodData[]
}

const COLORS = [
  "hsl(221, 83%, 53%)",  // Primary blue
  "hsl(160, 60%, 45%)",  // Green
  "hsl(30, 80%, 55%)",   // Orange
  "hsl(280, 65%, 60%)",  // Purple
]

const METHOD_CONFIG: Record<string, { label: string; icon: React.ElementType }> = {
  cash: { label: "Tiền mặt", icon: Banknote },
  bank_transfer: { label: "Chuyển khoản", icon: CreditCard },
  qr_code: { label: "QR Code", icon: QrCode },
  card: { label: "Thẻ", icon: Wallet },
}

const chartConfig = {
  total: { label: "Tổng tiền" },
} satisfies ChartConfig

// Custom active shape for pie chart
const renderActiveShape = (props: PieSectorDataItem) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="hsl(var(--background))"
        strokeWidth={2}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 16}
        fill={fill}
        opacity={0.3}
      />
    </g>
  )
}

export function PaymentMethodsChart({ data }: PaymentMethodsChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const formattedData = data.map((item, index) => ({
    ...item,
    name: METHOD_CONFIG[item.method]?.label || item.method,
    fill: COLORS[index % COLORS.length],
    icon: METHOD_CONFIG[item.method]?.icon || Wallet,
  }))

  const totalAmount = formattedData.reduce((sum, item) => sum + item.total, 0)
  const totalCount = formattedData.reduce((sum, item) => sum + item.count, 0)

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
    return value.toString()
  }

  const formatFullCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Phương thức thanh toán</CardTitle>
        <CardDescription>Phân bố theo phương thức</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          {/* Pie Chart */}
          <ChartContainer config={chartConfig} className="h-[200px] w-[200px] flex-shrink-0">
            <PieChart>
              <Pie
                data={formattedData}
                dataKey="total"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                activeShape={renderActiveShape}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {formattedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />
                ))}
              </Pie>
              {/* Center text */}
              <text x="50%" y="45%" textAnchor="middle" className="fill-foreground text-lg font-bold">
                {formatCurrency(totalAmount)}
              </text>
              <text x="50%" y="58%" textAnchor="middle" className="fill-muted-foreground text-xs">
                {totalCount} giao dịch
              </text>
            </PieChart>
          </ChartContainer>

          {/* Legend with details */}
          <div className="flex-1 space-y-3">
            {formattedData.map((item, index) => {
              const Icon = item.icon
              const isActive = activeIndex === index
              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer ${
                    isActive ? "bg-muted" : "hover:bg-muted/50"
                  }`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${item.fill}20` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: item.fill }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm truncate">{item.name}</span>
                      <span className="text-sm font-bold">{item.percentage}%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{item.count} giao dịch</span>
                      <span>{formatFullCurrency(item.total)}</span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${item.percentage}%`, backgroundColor: item.fill }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
