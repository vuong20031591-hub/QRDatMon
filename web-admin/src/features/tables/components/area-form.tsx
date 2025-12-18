"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { areaSchema, type AreaFormValues } from "../schemas/table.schema"
import type { Area } from "@/types"

interface AreaFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  area?: Area | null
  onSubmit: (data: AreaFormValues) => Promise<void>
  loading?: boolean
}

export function AreaForm({ open, onOpenChange, area, onSubmit, loading }: AreaFormProps) {
  const isEdit = !!area
  const form = useForm<AreaFormValues>({
    resolver: zodResolver(areaSchema),
    defaultValues: {
      name: "",
      description: "",
      floor: 1,
      sortOrder: 0,
    },
  })

  // Reset form when area changes (for edit mode)
  useEffect(() => {
    if (open && area) {
      form.reset({
        name: area.name || "",
        description: area.description || "",
        floor: area.floor || 1,
        sortOrder: area.sortOrder || 0,
      })
    } else if (open && !area) {
      form.reset({
        name: "",
        description: "",
        floor: 1,
        sortOrder: 0,
      })
    }
  }, [open, area, form])

  const handleSubmit = async (data: AreaFormValues) => {
    await onSubmit(data)
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Chỉnh sửa khu vực" : "Thêm khu vực mới"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên khu vực *</Label>
            <Input id="name" {...form.register("name")} placeholder="VD: Tầng 1, Khu VIP, Sân vườn..." />
            {form.formState.errors.name && <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea id="description" {...form.register("description")} placeholder="Mô tả khu vực" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="floor">Tầng</Label>
              <Input id="floor" type="number" {...form.register("floor")} min={1} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Thứ tự sắp xếp</Label>
              <Input id="sortOrder" type="number" {...form.register("sortOrder")} min={0} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button type="submit" disabled={loading}>{loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm mới"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
