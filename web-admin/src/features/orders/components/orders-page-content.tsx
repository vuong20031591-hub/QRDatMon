"use client"

import { useState, useCallback } from "react"
import { RefreshCw, Download, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { OrderList } from "./order-list"
import { OrderDetail } from "./order-detail"
import { OrderFiltersComponent } from "./order-filters"
import { CancelOrderDialog } from "./cancel-order-dialog"
import { useOrders } from "../hooks/use-orders"
import { useRealtimeOrders } from "../hooks/use-realtime-orders"
import { useTables } from "@/features/tables/hooks/use-tables"
import type { Order, OrderStatus } from "@/types/order"

export default function OrdersPageContent() {
  const { orders, loading, filters, fetchOrders, updateFilters, updateOrderStatus, cancelOrder } = useOrders()
  const { tables } = useTables()
  
  // Real-time updates
  const handleOrderCreated = useCallback(() => {
    fetchOrders()
  }, [fetchOrders])
  
  const handleOrderStatusUpdated = useCallback(() => {
    fetchOrders()
  }, [fetchOrders])
  
  useRealtimeOrders({
    onOrderCreated: handleOrderCreated,
    onOrderStatusUpdated: handleOrderStatusUpdated,
    showNotifications: true,
  })
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null)


  const statusCounts = {
    pending: orders.filter(o => o.status === "pending").length,
    preparing: orders.filter(o => o.status === "preparing").length,
    ready: orders.filter(o => o.status === "ready").length,
  }

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order)
    setDetailOpen(true)
  }

  const handleUpdateStatus = async (order: Order, status: OrderStatus) => {
    try {
      await updateOrderStatus(order.id, status)
      toast.success(`Đã cập nhật trạng thái đơn hàng`)
    } catch {
      toast.error("Không thể cập nhật trạng thái")
    }
  }

  const handleCancelClick = (order: Order) => {
    setOrderToCancel(order)
    setCancelDialogOpen(true)
  }

  const handleCancelConfirm = async (reason: string) => {
    if (!orderToCancel) return
    try {
      await cancelOrder(orderToCancel.id, reason)
      toast.success("Đã hủy đơn hàng")
      setOrderToCancel(null)
    } catch {
      toast.error("Không thể hủy đơn hàng")
      throw new Error("Cancel failed")
    }
  }

  const handleClearFilters = () => {
    updateFilters({ status: undefined, tableId: undefined, startDate: undefined, endDate: undefined })
  }

  const handleExportExcel = () => {
    if (orders.length === 0) {
      toast.error("Không có dữ liệu để xuất")
      return
    }

    const statusLabels: Record<string, string> = {
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận", 
      preparing: "Đang chuẩn bị",
      ready: "Sẵn sàng",
      served: "Đã phục vụ",
      cancelled: "Đã hủy",
    }

    const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleString("vi-VN")
    }

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat("vi-VN").format(value)
    }

    // CSV header
    const headers = ["Mã đơn", "Bàn", "Số món", "Tổng tiền", "Trạng thái", "Thời gian"]
    
    // CSV rows
    const rows = orders.map(order => [
      order.orderNumber,
      order.bill?.tableNumber || "N/A",
      order.items?.length || 0,
      formatCurrency(order.totalAmount || 0),
      statusLabels[order.status] || order.status,
      formatDate(order.createdAt)
    ])

    // Add BOM for UTF-8 Excel compatibility
    const BOM = "\uFEFF"
    const csvContent = BOM + [headers, ...rows].map(row => row.join(",")).join("\n")
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `don-hang-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
    
    toast.success("Đã xuất file Excel thành công")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
          <p className="text-muted-foreground">Theo dõi và xử lý đơn hàng</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchOrders()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Làm mới
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <Download className="mr-2 h-4 w-4" />
            Xuất Excel
          </Button>
        </div>
      </div>

      {/* Status Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Chờ xác nhận</p>
                <p className="text-2xl font-bold">{statusCounts.pending}</p>
              </div>
              <Badge variant="warning" className="text-lg px-3 py-1">
                <Bell className="mr-1 h-4 w-4" />
                {statusCounts.pending}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Đang chuẩn bị</p>
                <p className="text-2xl font-bold">{statusCounts.preparing}</p>
              </div>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {statusCounts.preparing}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sẵn sàng phục vụ</p>
                <p className="text-2xl font-bold">{statusCounts.ready}</p>
              </div>
              <Badge variant="success" className="text-lg px-3 py-1">
                {statusCounts.ready}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <OrderFiltersComponent
            filters={filters}
            tables={tables}
            onFilterChange={updateFilters}
            onClearFilters={handleClearFilters}
          />
        </CardContent>
      </Card>

      {/* Order List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách đơn hàng ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderList
            orders={orders}
            loading={loading}
            onViewDetail={handleViewDetail}
            onUpdateStatus={handleUpdateStatus}
            onCancel={handleCancelClick}
          />
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng</DialogTitle>
            <DialogDescription>
              Xem thông tin chi tiết của đơn hàng
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && <OrderDetail order={selectedOrder} />}
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <CancelOrderDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        order={orderToCancel}
        onConfirm={handleCancelConfirm}
      />
    </div>
  )
}
