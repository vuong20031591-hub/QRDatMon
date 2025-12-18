"use client"

import { useState } from "react"
import { RefreshCw, Filter, History } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import {
  InventoryList,
  StockUpdateForm,
  InventorySettingsForm,
  LowStockAlert,
  LowStockSummary,
  InventoryHistory,
  useInventory,
  useLowStock,
  useInventoryLogs,
} from "@/features/inventory"
import type { InventoryItem } from "@/types/inventory"
import type { StockUpdateFormValues, InventorySettingsFormValues } from "@/features/inventory/schemas/inventory.schema"

export default function InventoryPage() {
  const { 
    inventory, 
    loading, 
    filters, 
    fetchInventory, 
    updateFilters, 
    updateStock, 
    updateSettings 
  } = useInventory()
  const { lowStockItems, count: lowStockCount, fetchLowStock } = useLowStock()
  const { logs, loading: logsLoading, fetchLogs } = useInventoryLogs()

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [stockDialogOpen, setStockDialogOpen] = useState(false)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const outOfStockCount = lowStockItems.filter(item => item.isOutOfStock).length
  const lowOnlyCount = lowStockCount - outOfStockCount

  const handleUpdateStock = (item: InventoryItem) => {
    setSelectedItem(item)
    setStockDialogOpen(true)
  }

  const handleUpdateSettings = (item: InventoryItem) => {
    setSelectedItem(item)
    setSettingsDialogOpen(true)
  }

  const handleViewHistory = (item: InventoryItem) => {
    setSelectedItem(item)
    fetchLogs()
    setHistoryDialogOpen(true)
  }

  const handleStockSubmit = async (data: StockUpdateFormValues) => {
    if (!selectedItem) return
    try {
      setIsSubmitting(true)
      await updateStock(selectedItem.menuItem.id, data)
      toast.success("Cập nhật số lượng thành công")
      setStockDialogOpen(false)
      fetchLowStock()
    } catch (error) {
      toast.error("Không thể cập nhật số lượng")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSettingsSubmit = async (data: InventorySettingsFormValues) => {
    if (!selectedItem) return
    try {
      setIsSubmitting(true)
      await updateSettings(selectedItem.menuItem.id, data)
      toast.success("Cập nhật cài đặt thành công")
      setSettingsDialogOpen(false)
      fetchLowStock()
    } catch (error) {
      toast.error("Không thể cập nhật cài đặt")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRefresh = () => {
    fetchInventory()
    fetchLowStock()
    toast.success("Đã làm mới dữ liệu")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý kho</h1>
          <p className="text-muted-foreground">
            Theo dõi và quản lý số lượng tồn kho
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LowStockSummary 
            outOfStockCount={outOfStockCount} 
            lowStockCount={lowOnlyCount} 
          />
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <LowStockAlert items={lowStockItems} onUpdateStock={handleUpdateStock} />

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Bộ lọc
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Select
              value={filters.lowStock ? "low" : filters.outOfStock ? "out" : "all"}
              onValueChange={(value) => {
                if (value === "low") {
                  updateFilters({ lowStock: true, outOfStock: false })
                } else if (value === "out") {
                  updateFilters({ lowStock: false, outOfStock: true })
                } else {
                  updateFilters({ lowStock: false, outOfStock: false })
                }
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái kho" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="low">Sắp hết hàng</SelectItem>
                <SelectItem value="out">Hết hàng</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.sortBy || "quantity"}
              onValueChange={(value) => updateFilters({ sortBy: value as 'quantity' | 'createdAt' | 'updatedAt' })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sắp xếp theo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quantity">Số lượng</SelectItem>
                <SelectItem value="createdAt">Ngày tạo</SelectItem>
                <SelectItem value="updatedAt">Cập nhật gần nhất</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.sortOrder || "asc"}
              onValueChange={(value) => updateFilters({ sortOrder: value as 'asc' | 'desc' })}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Thứ tự" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Tăng dần</SelectItem>
                <SelectItem value="desc">Giảm dần</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách tồn kho ({inventory.length})</CardTitle>
            <Button variant="outline" size="sm" onClick={() => {
              fetchLogs()
              setHistoryDialogOpen(true)
              setSelectedItem(null)
            }}>
              <History className="h-4 w-4 mr-2" />
              Lịch sử
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <InventoryList
            inventory={inventory}
            loading={loading}
            onUpdateStock={handleUpdateStock}
            onUpdateSettings={handleUpdateSettings}
            onViewHistory={handleViewHistory}
          />
        </CardContent>
      </Card>

      {/* Stock Update Dialog */}
      <Dialog open={stockDialogOpen} onOpenChange={setStockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật số lượng</DialogTitle>
            <DialogDescription>
              Thêm hoặc trừ số lượng tồn kho cho món {selectedItem?.menuItem.name}
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <StockUpdateForm
              item={selectedItem}
              onSubmit={handleStockSubmit}
              onCancel={() => setStockDialogOpen(false)}
              isLoading={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cài đặt kho</DialogTitle>
            <DialogDescription>
              Cấu hình ngưỡng cảnh báo và đơn vị cho món {selectedItem?.menuItem.name}
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <InventorySettingsForm
              item={selectedItem}
              onSubmit={handleSettingsSubmit}
              onCancel={() => setSettingsDialogOpen(false)}
              isLoading={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? `Lịch sử - ${selectedItem.menuItem.name}` : 'Lịch sử kho hàng'}
            </DialogTitle>
            <DialogDescription>
              Xem các thay đổi số lượng tồn kho theo thời gian
            </DialogDescription>
          </DialogHeader>
          <InventoryHistory logs={logs} loading={logsLoading} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
