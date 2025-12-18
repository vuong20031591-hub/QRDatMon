/**
 * Inventory List Component
 * Displays inventory items with stock levels and color coding
 */

"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Package, AlertTriangle, XCircle, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTable } from "@/components/shared/data-table"
import type { InventoryItem } from "@/types/inventory"

interface InventoryListProps {
  inventory: InventoryItem[]
  loading: boolean
  onUpdateStock: (item: InventoryItem) => void
  onUpdateSettings: (item: InventoryItem) => void
  onViewHistory: (item: InventoryItem) => void
}

const getStockStatus = (item: InventoryItem) => {
  if (item.isOutOfStock) return { label: "Hết hàng", variant: "destructive" as const, icon: XCircle }
  if (item.isLowStock) return { label: "Sắp hết", variant: "warning" as const, icon: AlertTriangle }
  return { label: "Còn hàng", variant: "success" as const, icon: Package }
}

const getStockProgress = (item: InventoryItem) => {
  if (item.minThreshold === 0) return 100
  const ratio = (item.quantity / (item.minThreshold * 3)) * 100
  return Math.min(ratio, 100)
}

const getProgressColor = (item: InventoryItem) => {
  if (item.isOutOfStock) return "bg-red-500"
  if (item.isLowStock) return "bg-yellow-500"
  return "bg-green-500"
}

export function InventoryList({
  inventory,
  loading,
  onUpdateStock,
  onUpdateSettings,
  onViewHistory
}: InventoryListProps) {
  const columns: ColumnDef<InventoryItem>[] = [
    {
      id: "name",
      accessorFn: (row) => row.menuItem.name,
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Món ăn
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex items-center gap-3">
            {item.menuItem.imageUrl && (
              <img
                src={item.menuItem.imageUrl.startsWith('http') ? item.menuItem.imageUrl : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000'}${item.menuItem.imageUrl}`}
                alt={item.menuItem.name}
                className="h-10 w-10 rounded-md object-cover"
              />
            )}
            <div>
              <p className="font-medium">{item.menuItem.name}</p>
              {item.menuItem.category && (
                <p className="text-sm text-muted-foreground">
                  {item.menuItem.category.name}
                </p>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Số lượng
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{item.quantity}</span>
              <span className="text-muted-foreground">{item.unit}</span>
            </div>
            <div className="w-24">
              <Progress 
                value={getStockProgress(item)} 
                className={`h-2 ${getProgressColor(item)}`}
              />
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "minThreshold",
      header: "Ngưỡng tối thiểu",
      cell: ({ row }) => {
        const item = row.original
        return (
          <span className="text-muted-foreground">
            {item.minThreshold} {item.unit}
          </span>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const item = row.original
        const status = getStockStatus(item)
        const Icon = status.icon
        return (
          <Badge variant={status.variant} className="flex items-center gap-1 w-fit">
            <Icon className="h-3 w-3" />
            {status.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: "lastRestockedAt",
      header: "Nhập kho lần cuối",
      cell: ({ row }) => {
        const item = row.original
        if (!item.lastRestockedAt) return <span className="text-muted-foreground">-</span>
        return (
          <div className="text-sm">
            <p>{new Date(item.lastRestockedAt).toLocaleDateString('vi-VN')}</p>
            {item.lastRestockedBy && (
              <p className="text-muted-foreground">{item.lastRestockedBy.employeeCode}</p>
            )}
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const item = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Mở menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onUpdateStock(item)}>
                Cập nhật số lượng
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateSettings(item)}>
                Cài đặt ngưỡng
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewHistory(item)}>
                Xem lịch sử
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-md" />
        ))}
      </div>
    )
  }

  return (
    <DataTable
      columns={columns}
      data={inventory}
      searchKey="name"
      searchPlaceholder="Tìm kiếm món ăn..."
    />
  )
}
