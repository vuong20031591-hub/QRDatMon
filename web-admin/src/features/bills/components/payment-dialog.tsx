"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { confirmPaymentSchema, type ConfirmPaymentValues, paymentMethodLabels } from "../schemas/bill.schema"
import type { Bill, Table } from "@/types"

interface BillWithTable extends Omit<Bill, 'table'> {
  table?: Table
}

interface PaymentDialogProps {
  bill: BillWithTable | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (data: ConfirmPaymentValues) => Promise<void>
  isLoading?: boolean
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount)
}

export function PaymentDialog({ 
  bill, 
  open, 
  onOpenChange,
  onConfirm,
  isLoading,
}: PaymentDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ConfirmPaymentValues>({
    resolver: zodResolver(confirmPaymentSchema),
    defaultValues: {
      method: "cash",
      amount: bill?.totalAmount || 0,
    },
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedMethod = watch("method")
  const enteredAmount = watch("amount") || 0
  const changeAmount = enteredAmount - (bill?.totalAmount || 0)

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset()
    }
    onOpenChange(open)
  }

  if (!bill) return null

  const tableName = typeof bill.table === "object" ? bill.table?.tableNumber : bill.table

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Thanh toán hóa đơn #{bill.billNumber}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onConfirm)} className="space-y-4">
          {/* Bill Summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Bàn</span>
              <span>{tableName || "N/A"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tạm tính</span>
              <span>{formatCurrency(bill.subtotal)}</span>
            </div>
            {bill.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-destructive">
                <span className="text-muted-foreground">Giảm giá</span>
                <span>-{formatCurrency(bill.discountAmount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Tổng cộng</span>
              <span className="text-lg">{formatCurrency(bill.totalAmount)}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Phương thức thanh toán *</Label>
            <Select
              value={selectedMethod}
              onValueChange={(value) => setValue("method", value as ConfirmPaymentValues["method"])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn phương thức" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(paymentMethodLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.method && (
              <p className="text-sm text-destructive">{errors.method.message}</p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label>Số tiền nhận *</Label>
            <Input
              type="number"
              {...register("amount")}
              defaultValue={bill.totalAmount}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>

          {/* Change */}
          {selectedMethod === "cash" && changeAmount > 0 && (
            <div className="bg-green-50 dark:bg-green-950 rounded-lg p-3">
              <div className="flex justify-between font-medium text-green-700 dark:text-green-300">
                <span>Tiền thừa</span>
                <span>{formatCurrency(changeAmount)}</span>
              </div>
            </div>
          )}

          {/* Transaction ID (for card/qr) */}
          {(selectedMethod === "card" || selectedMethod === "qr") && (
            <div className="space-y-2">
              <Label>Mã giao dịch</Label>
              <Input
                {...register("transactionId")}
                placeholder="Nhập mã giao dịch (nếu có)"
              />
            </div>
          )}

          {/* Note */}
          <div className="space-y-2">
            <Label>Ghi chú</Label>
            <Textarea
              {...register("note")}
              placeholder="Ghi chú thêm..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : "Xác nhận thanh toán"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
