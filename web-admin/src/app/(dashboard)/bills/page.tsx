"use client"

import { useState } from "react"
import { Filter, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { BillTable } from "@/features/bills/components/bill-table"
import { BillDetailDialog } from "@/features/bills/components/bill-detail-dialog"
import { PaymentDialog } from "@/features/bills/components/payment-dialog"
import { useBills, usePayments } from "@/features/bills/hooks/use-bills"
import { billStatusLabels, type ConfirmPaymentValues } from "@/features/bills/schemas/bill.schema"
import type { Bill, Table } from "@/types"

interface BillWithTable extends Omit<Bill, 'table'> {
  table?: Table
}

export default function BillsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [dateFilter, setDateFilter] = useState<string>("")
  
  const { 
    bills, 
    loading, 
    applyVoucher, 
    removeVoucher, 
    closeBill, 
    cancelBill 
  } = useBills({
    status: statusFilter || undefined,
  })

  const [selectedBill, setSelectedBill] = useState<BillWithTable | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [isPaymentLoading, setIsPaymentLoading] = useState(false)

  const { confirmPayment } = usePayments(selectedBill?.id)

  const [cancelDialog, setCancelDialog] = useState<{
    open: boolean
    bill: BillWithTable | null
    reason: string
  }>({ open: false, bill: null, reason: "" })

  const handleView = (bill: BillWithTable) => {
    setSelectedBill(bill)
    setIsDetailOpen(true)
  }

  const handlePayment = (bill: BillWithTable) => {
    setSelectedBill(bill)
    setIsPaymentOpen(true)
  }

  const handleConfirmPayment = async (data: ConfirmPaymentValues) => {
    if (!selectedBill) return
    try {
      setIsPaymentLoading(true)
      await confirmPayment({
        billId: selectedBill.id,
        method: data.method,
        amount: data.amount,
        transactionId: data.transactionId,
        note: data.note,
      })
      await closeBill(selectedBill.id)
      toast.success("Thanh toán thành công")
      setIsPaymentOpen(false)
      setSelectedBill(null)
    } catch {
      toast.error("Không thể xử lý thanh toán")
    } finally {
      setIsPaymentLoading(false)
    }
  }

  const handleCancel = (bill: BillWithTable) => {
    setCancelDialog({ open: true, bill, reason: "" })
  }

  const handleConfirmCancel = async () => {
    if (!cancelDialog.bill || !cancelDialog.reason.trim()) {
      toast.error("Vui lòng nhập lý do hủy")
      return
    }
    try {
      await cancelBill(cancelDialog.bill.id, cancelDialog.reason)
      toast.success("Đã hủy hóa đơn")
      setCancelDialog({ open: false, bill: null, reason: "" })
    } catch {
      toast.error("Không thể hủy hóa đơn")
    }
  }

  const handlePrint = () => {
    // TODO: Implement print functionality
    toast.info("Chức năng in hóa đơn đang phát triển")
  }

  const handleApplyVoucher = async (billId: string, code: string) => {
    await applyVoucher(billId, code)
  }

  const handleRemoveVoucher = async (billId: string) => {
    await removeVoucher(billId)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quản lý hóa đơn</h1>
        <p className="text-muted-foreground">
          Xem và xử lý thanh toán hóa đơn
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {Object.entries(billStatusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="pl-9 w-[180px]"
          />
        </div>
      </div>

      {/* Bills Table */}
      <BillTable
        bills={bills}
        onView={handleView}
        onPayment={handlePayment}
        onCancel={handleCancel}
        onPrint={handlePrint}
        isLoading={loading}
      />

      {/* Bill Detail Dialog */}
      <BillDetailDialog
        bill={selectedBill}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onApplyVoucher={handleApplyVoucher}
        onRemoveVoucher={handleRemoveVoucher}
      />

      {/* Payment Dialog */}
      <PaymentDialog
        bill={selectedBill}
        open={isPaymentOpen}
        onOpenChange={setIsPaymentOpen}
        onConfirm={handleConfirmPayment}
        isLoading={isPaymentLoading}
      />

      {/* Cancel Dialog */}
      <AlertDialog 
        open={cancelDialog.open} 
        onOpenChange={(open: boolean) => setCancelDialog(prev => ({ ...prev, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hủy hóa đơn?</AlertDialogTitle>
            <AlertDialogDescription>
              Hóa đơn #{cancelDialog.bill?.billNumber} sẽ bị hủy. Vui lòng nhập lý do hủy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Lý do hủy hóa đơn..."
            value={cancelDialog.reason}
            onChange={(e) => setCancelDialog(prev => ({ ...prev, reason: e.target.value }))}
            rows={3}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Đóng</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xác nhận hủy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
