"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Ticket, X } from "lucide-react"
import { toast } from "sonner"
import { applyVoucherSchema, type ApplyVoucherValues, billStatusLabels } from "../schemas/bill.schema"
import type { Bill, Table } from "@/types"

interface BillWithTable extends Omit<Bill, 'table'> {
  table?: Table
  orders?: Array<{
    id: string
    orderNumber: string
    items: Array<{
      name: string
      quantity: number
      price: number
    }>
  }>
}

interface BillDetailDialogProps {
  bill: BillWithTable | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onApplyVoucher: (billId: string, code: string) => Promise<void>
  onRemoveVoucher: (billId: string) => Promise<void>
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount)
}

export function BillDetailDialog({ 
  bill, 
  open, 
  onOpenChange,
  onApplyVoucher,
  onRemoveVoucher,
}: BillDetailDialogProps) {
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false)
  const [showVoucherInput, setShowVoucherInput] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApplyVoucherValues>({
    resolver: zodResolver(applyVoucherSchema),
  })

  const handleApplyVoucher = async (data: ApplyVoucherValues) => {
    if (!bill) return
    try {
      setIsApplyingVoucher(true)
      await onApplyVoucher(bill.id, data.voucherCode)
      toast.success("Áp dụng voucher thành công")
      reset()
      setShowVoucherInput(false)
    } catch {
      toast.error("Không thể áp dụng voucher")
    } finally {
      setIsApplyingVoucher(false)
    }
  }

  const handleRemoveVoucher = async () => {
    if (!bill) return
    try {
      await onRemoveVoucher(bill.id)
      toast.success("Đã xóa voucher")
    } catch {
      toast.error("Không thể xóa voucher")
    }
  }

  if (!bill) return null

  const tableName = typeof bill.table === "object" ? bill.table?.tableNumber : bill.table

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Chi tiết hóa đơn #{bill.billNumber}</span>
            <Badge variant={bill.status === "paid" ? "secondary" : "outline"}>
              {billStatusLabels[bill.status]}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Bàn:</span>
              <span className="ml-2 font-medium">{tableName || "N/A"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Số khách:</span>
              <span className="ml-2 font-medium">{bill.guestCount}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Thời gian mở:</span>
              <span className="ml-2">{new Date(bill.openedAt).toLocaleString("vi-VN")}</span>
            </div>
            {bill.closedAt && (
              <div>
                <span className="text-muted-foreground">Thời gian đóng:</span>
                <span className="ml-2">{new Date(bill.closedAt).toLocaleString("vi-VN")}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Order Items */}
          {bill.orders && bill.orders.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Các món đã đặt</h4>
              {bill.orders.map((order) => (
                <div key={order.id} className="bg-muted/50 rounded-lg p-3">
                  <div className="text-sm text-muted-foreground mb-2">
                    Đơn #{order.orderNumber}
                  </div>
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm py-1">
                      <span>
                        {item.name} x{item.quantity}
                      </span>
                      <span>{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          <Separator />

          {/* Voucher */}
          {(bill.status === "open" || bill.status === "requesting_payment") && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Voucher / Khuyến mãi</h4>
                {bill.promotion ? (
                  <Button variant="ghost" size="sm" onClick={handleRemoveVoucher}>
                    <X className="h-4 w-4 mr-1" />
                    Xóa voucher
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowVoucherInput(!showVoucherInput)}
                  >
                    <Ticket className="h-4 w-4 mr-1" />
                    Áp dụng voucher
                  </Button>
                )}
              </div>
              
              {showVoucherInput && !bill.promotion && (
                <form onSubmit={handleSubmit(handleApplyVoucher)} className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      {...register("voucherCode")}
                      placeholder="Nhập mã voucher"
                      className="uppercase"
                    />
                    {errors.voucherCode && (
                      <p className="text-sm text-destructive mt-1">{errors.voucherCode.message}</p>
                    )}
                  </div>
                  <Button type="submit" disabled={isApplyingVoucher}>
                    {isApplyingVoucher ? "Đang áp dụng..." : "Áp dụng"}
                  </Button>
                </form>
              )}
            </div>
          )}

          <Separator />

          {/* Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tạm tính</span>
              <span>{formatCurrency(bill.subtotal)}</span>
            </div>
            {bill.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-destructive">
                <span>Giảm giá</span>
                <span>-{formatCurrency(bill.discountAmount)}</span>
              </div>
            )}
            {bill.serviceChargeAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span>Phí dịch vụ ({bill.serviceChargePercent}%)</span>
                <span>{formatCurrency(bill.serviceChargeAmount)}</span>
              </div>
            )}
            {bill.vatAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span>VAT ({bill.vatPercent}%)</span>
                <span>{formatCurrency(bill.vatAmount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Tổng cộng</span>
              <span>{formatCurrency(bill.totalAmount)}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
