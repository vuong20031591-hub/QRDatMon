"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Eye, XCircle, Clock, CheckCircle, ChefHat, Utensils } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { DataTable } from "@/components/shared/data-table"
import type { Order, OrderStatus } from "@/types/order"

interface OrderListProps {
  orders: Order[]
  loading?: boolean
  onViewDetail: (order: Order) => void
  onUpdateStatus: (order: Order, status: OrderStatus) => void
  onCancel: (order: Order) => void
}

const statusConfig: Record<OrderStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"; icon: React.ElementType }> = {
  pending: { label: "Chờ xác nhận", variant: "warning", icon: Clock },
  confirmed: { label: "Đã xác nhận", variant: "default", icon: CheckCircle },
  preparing: { label: "Đang chuẩn bị", variant: "secondary", icon: ChefHat },
  ready: { label: "Sẵn sàng", variant: "success", icon: Utensils },
  served: { label: "Đã phục vụ", variant: "outline", icon: CheckCircle },
  cancelled: { label: "Đã hủy", variant: "destructive", icon: XCircle },
}

export function OrderList({ orders, loading, onViewDetail, onUpdateStatus, onCancel }: OrderListProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const transitions: Record<OrderStatus, OrderStatus | null> = {
      pending: "confirmed",
      confirmed: "preparing",
      preparing: "ready",
      ready: "served",
      served: null,
      cancelled: null,
    }
    return transitions[currentStatus]
  }

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "orderNumber",
      header: "Mã đơn",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.orderNumber}</div>
      ),
    },
    {
      accessorKey: "bill",
      header: "Bàn",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.bill?.tableNumber || "-"}</Badge>
      ),
    },
    {
      accessorKey: "items",
      header: "Số món",
      cell: ({ row }) => (
        <span>{row.original.items.length} món</span>
      ),
    },
    {
      accessorKey: "totalAmount",
      header: "Tổng tiền",
      cell: ({ row }) => (
        <span className="font-medium">{formatCurrency(row.original.totalAmount)}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const status = row.original.status
        const config = statusConfig[status]
        const Icon = config.icon
        return (
          <Badge variant={config.variant} className="gap-1">
            <Icon className="h-3 w-3" />
            {config.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Thời gian",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const order = row.original
        const nextStatus = getNextStatus(order.status)
        const canCancel = ["pending", "confirmed"].includes(order.status)

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetail(order)}>
                <Eye className="mr-2 h-4 w-4" />
                Xem chi tiết
              </DropdownMenuItem>
              {nextStatus && (
                <DropdownMenuItem onClick={() => onUpdateStatus(order, nextStatus)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {statusConfig[nextStatus].label}
                </DropdownMenuItem>
              )}
              {canCancel && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onCancel(order)} className="text-destructive">
                    <XCircle className="mr-2 h-4 w-4" />
                    Hủy đơn
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  if (loading) {
    return <div className="text-center py-8">Đang tải...</div>
  }

  return (
    <DataTable
      columns={columns}
      data={orders}
      searchKey="orderNumber"
      searchPlaceholder="Tìm theo mã đơn..."
    />
  )
}
