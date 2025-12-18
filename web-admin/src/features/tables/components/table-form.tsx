"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { tableSchema, type TableFormValues } from "../schemas/table.schema"
import type { Table, Area } from "@/types"

interface TableFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  table?: Table | null
  areas: Area[]
  onSubmit: (data: TableFormValues) => Promise<void>
  loading?: boolean
}

export function TableForm({ open, onOpenChange, table, areas, onSubmit, loading }: TableFormProps) {
  const isEdit = !!table
  const form = useForm<TableFormValues>({
    resolver: zodResolver(tableSchema),
    defaultValues: {
      tableNumber: "",
      area: "",
      capacity: 4,
      status: "available",
    },
  })

  // Reset form when table changes (for edit mode)
  useEffect(() => {
    if (open && table) {
      form.reset({
        tableNumber: table.tableNumber || "",
        area: typeof table.area === "string" ? table.area : table.area?.id || "",
        capacity: table.capacity || 4,
        status: table.status || "available",
      })
    } else if (open && !table) {
      form.reset({
        tableNumber: "",
        area: "",
        capacity: 4,
        status: "available",
      })
    }
  }, [open, table, form])

  const handleSubmit = async (data: TableFormValues) => {
    await onSubmit(data)
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Chỉnh sửa bàn" : "Thêm bàn mới"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tableNumber">Số bàn *</Label>
            <Input id="tableNumber" {...form.register("tableNumber")} placeholder="VD: A1, B2, VIP1..." />
            {form.formState.errors.tableNumber && <p className="text-sm text-red-500">{form.formState.errors.tableNumber.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="area">Khu vực *</Label>
            {/* eslint-disable-next-line react-hooks/incompatible-library */}
            <Select value={form.watch("area")} onValueChange={(v) => form.setValue("area", v)}>
              <SelectTrigger><SelectValue placeholder="Chọn khu vực" /></SelectTrigger>
              <SelectContent>
                {areas.map((area) => (<SelectItem key={area.id} value={area.id}>{area.name}</SelectItem>))}
              </SelectContent>
            </Select>
            {form.formState.errors.area && <p className="text-sm text-red-500">{form.formState.errors.area.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="capacity">Sức chứa (người) *</Label>
            <Input id="capacity" type="number" {...form.register("capacity")} min={1} max={100} />
            {form.formState.errors.capacity && <p className="text-sm text-red-500">{form.formState.errors.capacity.message}</p>}
          </div>
          {isEdit && (
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select value={form.watch("status")} onValueChange={(v) => form.setValue("status", v as TableFormValues["status"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Trống</SelectItem>
                  <SelectItem value="occupied">Đang sử dụng</SelectItem>
                  <SelectItem value="reserved">Đã đặt</SelectItem>
                  <SelectItem value="cleaning">Đang dọn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button type="submit" disabled={loading}>{loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm mới"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
