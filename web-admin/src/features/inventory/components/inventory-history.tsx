/**
 * Inventory History Component
 * Displays stock movements over time
 */

"use client"

import { ArrowUp, ArrowDown, RefreshCw, Settings } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { InventoryLog } from "@/types/inventory"

interface InventoryHistoryProps {
  logs: InventoryLog[]
  loading: boolean
}

const getActionInfo = (action: InventoryLog['action']) => {
  switch (action) {
    case 'add':
      return { label: 'Thêm', icon: ArrowUp, color: 'text-green-600', bg: 'bg-green-100' }
    case 'deduct':
      return { label: 'Trừ', icon: ArrowDown, color: 'text-red-600', bg: 'bg-red-100' }
    case 'restock':
      return { label: 'Nhập kho', icon: RefreshCw, color: 'text-blue-600', bg: 'bg-blue-100' }
    case 'adjust':
      return { label: 'Điều chỉnh', icon: Settings, color: 'text-yellow-600', bg: 'bg-yellow-100' }
    default:
      return { label: action, icon: RefreshCw, color: 'text-gray-600', bg: 'bg-gray-100' }
  }
}

const getReferenceLabel = (type?: string) => {
  switch (type) {
    case 'order': return 'Đơn hàng'
    case 'manual': return 'Thủ công'
    case 'adjustment': return 'Kiểm kê'
    case 'restock': return 'Nhập kho'
    default: return type || '-'
  }
}

export function InventoryHistory({ logs, loading }: InventoryHistoryProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-md" />
        ))}
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Chưa có lịch sử thay đổi
      </div>
    )
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-3">
        {logs.map((log) => {
          const actionInfo = getActionInfo(log.action)
          const Icon = actionInfo.icon
          const isPositive = log.quantityChange > 0

          return (
            <div
              key={log.id}
              className="flex items-start gap-3 p-3 rounded-lg border bg-card"
            >
              <div className={`p-2 rounded-full ${actionInfo.bg}`}>
                <Icon className={`h-4 w-4 ${actionInfo.color}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{log.menuItem.name}</p>
                  <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? '+' : ''}{log.quantityChange}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {actionInfo.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {log.quantityBefore} → {log.quantityAfter}
                  </span>
                </div>

                {log.reason && (
                  <p className="text-sm text-muted-foreground mt-1 truncate">
                    {log.reason}
                  </p>
                )}

                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>
                    {log.performedBy?.employeeCode || 'Hệ thống'} • {getReferenceLabel(log.reference?.type)}
                  </span>
                  <span>
                    {new Date(log.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}
