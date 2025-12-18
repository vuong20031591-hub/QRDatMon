"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, User, FileText, AlertCircle } from "lucide-react"
import type { Order, OrderStatus, OrderItemStatus } from "@/types/order"

interface OrderDetailProps {
  order: Order
}

const statusConfig: Record<OrderStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" }> = {
  pending: { label: "Chờ xác nhận", variant: "warning" },
  confirmed: { label: "Đã xác nhận", variant: "default" },
  preparing: { label: "Đang chuẩn bị", variant: "secondary" },
  ready: { label: "Sẵn sàng", variant: "success" },
  served: { label: "Đã phục vụ", variant: "outline" },
  cancelled: { label: "Đã hủy", variant: "destructive" },
}

const itemStatusConfig: Record<OrderItemStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" }> = {
  pending: { label: "Chờ", variant: "warning" },
  preparing: { label: "Đang làm", variant: "secondary" },
  ready: { label: "Xong", variant: "success" },
  served: { label: "Đã phục vụ", variant: "outline" },
  cancelled: { label: "Hủy", variant: "destructive" },
}

export function OrderDetail({ order }: OrderDetailProps) {
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

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{order.orderNumber}</h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(order.createdAt)}
          </p>
        </div>
        <Badge variant={statusConfig[order.status].variant} className="text-sm">
          {statusConfig[order.status].label}
        </Badge>
      </div>

      {/* Table & Customer Info */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Bàn:</span>
              <Badge variant="outline">{order.bill?.tableNumber || "-"}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{order.user?.name || "Khách"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Special Notes */}
      {order.note && (
        <Card className="border-warning bg-warning/10">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-warning mt-0.5" />
              <div>
                <p className="text-sm font-medium">Ghi chú đặc biệt</p>
                <p className="text-sm text-muted-foreground">{order.note}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Items */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Chi tiết món ({order.items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={item.id || index} className="flex items-start justify-between py-2 border-b last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.itemName}</span>
                      <Badge variant={itemStatusConfig[item.status].variant} className="text-xs">
                        {itemStatusConfig[item.status].label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} x {formatCurrency(item.unitPrice)}
                    </p>
                    {item.toppings && item.toppings.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        + {item.toppings.map(t => t.name).join(", ")}
                      </p>
                    )}
                    {item.note && (
                      <p className="text-xs text-warning mt-1 flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {item.note}
                      </p>
                    )}
                  </div>
                  <span className="font-medium">{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Total */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Tổng cộng</span>
            <span className="text-primary">{formatCurrency(order.totalAmount)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Cancel Info */}
      {order.status === "cancelled" && order.cancelReason && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
              <div>
                <p className="text-sm font-medium">Lý do hủy</p>
                <p className="text-sm text-muted-foreground">{order.cancelReason}</p>
                {order.cancelledBy && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Hủy bởi: {order.cancelledBy.name}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
