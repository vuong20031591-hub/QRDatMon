"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertTriangle } from "lucide-react"
import { cancelOrderSchema, type CancelOrderValues } from "../schemas/order.schema"
import type { Order } from "@/types/order"

interface CancelOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order | null
  onConfirm: (reason: string) => Promise<void>
}

export function CancelOrderDialog({ open, onOpenChange, order, onConfirm }: CancelOrderDialogProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<CancelOrderValues>({
    resolver: zodResolver(cancelOrderSchema),
    defaultValues: { reason: "" },
  })

  const handleSubmit = async (values: CancelOrderValues) => {
    try {
      setLoading(true)
      await onConfirm(values.reason)
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to cancel order:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    form.reset()
    onOpenChange(false)
  }

  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Hủy đơn hàng
          </DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn hủy đơn hàng <strong>{order.orderNumber}</strong>?
            Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Lý do hủy đơn *</Label>
              <Textarea
                id="reason"
                placeholder="Nhập lý do hủy đơn hàng..."
                {...form.register("reason")}
                className="min-h-[100px]"
              />
              {form.formState.errors.reason && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.reason.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Không hủy
            </Button>
            <Button type="submit" variant="destructive" disabled={loading}>
              {loading ? "Đang xử lý..." : "Xác nhận hủy"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
