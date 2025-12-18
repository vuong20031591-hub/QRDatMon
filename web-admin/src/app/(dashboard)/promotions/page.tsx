"use client"

import { useState } from "react"
import { Plus, Search, Filter, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { PromotionTable } from "@/features/promotions/components/promotion-table"
import { PromotionForm } from "@/features/promotions/components/promotion-form"
import { PromotionUsageDialog } from "@/features/promotions/components/promotion-usage-dialog"
import { usePromotions } from "@/features/promotions/hooks/use-promotions"
import { discountTypeLabels, type PromotionFormValues } from "@/features/promotions/schemas/promotion.schema"
import type { Promotion } from "@/types"

export default function PromotionsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [typeFilter, setTypeFilter] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  
  const { 
    promotions, 
    loading, 
    createPromotion, 
    updatePromotion, 
    deactivatePromotion, 
    reactivatePromotion,
    generateCode,
    cleanupExpired,
  } = usePromotions({
    isActive: statusFilter ? statusFilter === "active" : undefined,
    discountType: typeFilter || undefined,
    search: searchQuery || undefined,
  })

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    promotion: Promotion | null
    action: "deactivate" | "reactivate"
  }>({ open: false, promotion: null, action: "deactivate" })

  const [usageDialog, setUsageDialog] = useState<{
    open: boolean
    promotion: Promotion | null
  }>({ open: false, promotion: null })

  const handleCreate = () => {
    setEditingPromotion(null)
    setIsFormOpen(true)
  }

  const handleEdit = (promo: Promotion) => {
    setEditingPromotion(promo)
    setIsFormOpen(true)
  }

  const handleSubmit = async (data: PromotionFormValues) => {
    try {
      setIsSubmitting(true)
      if (editingPromotion) {
        await updatePromotion(editingPromotion.id, data)
        toast.success("Cập nhật khuyến mãi thành công")
      } else {
        await createPromotion(data)
        toast.success("Tạo khuyến mãi thành công")
      }
      setIsFormOpen(false)
      setEditingPromotion(null)
    } catch {
      toast.error(editingPromotion ? "Không thể cập nhật khuyến mãi" : "Không thể tạo khuyến mãi")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGenerateCode = async () => {
    try {
      const code = await generateCode()
      toast.success(`Đã tạo mã: ${code}`)
      return code
    } catch (err) {
      toast.error("Không thể tạo mã voucher")
      throw err
    }
  }

  const handleDeactivate = (promo: Promotion) => {
    setConfirmDialog({ open: true, promotion: promo, action: "deactivate" })
  }

  const handleReactivate = (promo: Promotion) => {
    setConfirmDialog({ open: true, promotion: promo, action: "reactivate" })
  }

  const handleConfirmAction = async () => {
    if (!confirmDialog.promotion) return
    try {
      if (confirmDialog.action === "deactivate") {
        await deactivatePromotion(confirmDialog.promotion.id)
        toast.success("Đã ngừng khuyến mãi")
      } else {
        await reactivatePromotion(confirmDialog.promotion.id)
        toast.success("Đã kích hoạt lại khuyến mãi")
      }
    } catch {
      toast.error("Không thể thực hiện thao tác")
    } finally {
      setConfirmDialog({ open: false, promotion: null, action: "deactivate" })
    }
  }

  const handleViewUsage = (promo: Promotion) => {
    setUsageDialog({ open: true, promotion: promo })
  }

  const handleCleanupExpired = async () => {
    try {
      await cleanupExpired()
      toast.success("Đã dọn dẹp các khuyến mãi hết hạn")
    } catch {
      toast.error("Không thể dọn dẹp")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý khuyến mãi</h1>
          <p className="text-muted-foreground">
            Tạo và quản lý voucher, mã giảm giá
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCleanupExpired}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Dọn dẹp hết hạn
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo khuyến mãi
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo mã, tên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="active">Đang hoạt động</SelectItem>
            <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter || "all"} onValueChange={(v) => setTypeFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Loại giảm giá" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {Object.entries(discountTypeLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Promotions Table */}
      <PromotionTable
        promotions={promotions}
        onEdit={handleEdit}
        onDeactivate={handleDeactivate}
        onReactivate={handleReactivate}
        onViewUsage={handleViewUsage}
        isLoading={loading}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPromotion ? "Chỉnh sửa khuyến mãi" : "Tạo khuyến mãi mới"}
            </DialogTitle>
          </DialogHeader>
          <PromotionForm
            promotion={editingPromotion || undefined}
            onSubmit={handleSubmit}
            onCancel={() => setIsFormOpen(false)}
            onGenerateCode={handleGenerateCode}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <AlertDialog 
        open={confirmDialog.open} 
        onOpenChange={(open: boolean) => setConfirmDialog(prev => ({ ...prev, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === "deactivate" 
                ? "Ngừng khuyến mãi?" 
                : "Kích hoạt lại khuyến mãi?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === "deactivate"
                ? `Khuyến mãi "${confirmDialog.promotion?.name}" sẽ không thể sử dụng được nữa.`
                : `Khuyến mãi "${confirmDialog.promotion?.name}" sẽ có thể sử dụng trở lại.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>
              {confirmDialog.action === "deactivate" ? "Ngừng hoạt động" : "Kích hoạt"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Usage Dialog */}
      <PromotionUsageDialog
        promotion={usageDialog.promotion}
        open={usageDialog.open}
        onOpenChange={(open) => setUsageDialog(prev => ({ ...prev, open }))}
      />
    </div>
  )
}
