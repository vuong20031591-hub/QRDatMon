/**
 * Stock Update Form Component
 * Form to update stock quantity with reason
 */

"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { stockUpdateSchema, type StockUpdateFormValues } from "../schemas/inventory.schema"
import type { InventoryItem } from "@/types/inventory"

interface StockUpdateFormProps {
  item: InventoryItem
  onSubmit: (data: StockUpdateFormValues) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function StockUpdateForm({ item, onSubmit, onCancel, isLoading }: StockUpdateFormProps) {
  const form = useForm<StockUpdateFormValues>({
    resolver: zodResolver(stockUpdateSchema),
    defaultValues: {
      quantityChange: 0,
      reason: "",
      referenceType: "manual",
    },
  })

  const handleSubmit = async (data: StockUpdateFormValues) => {
    await onSubmit(data)
  }

  const quantityChange = form.watch("quantityChange")
  const newQuantity = item.quantity + (quantityChange || 0)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Số lượng hiện tại:</span>
            <span className="font-medium">{item.quantity} {item.unit}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-muted-foreground">Số lượng sau cập nhật:</span>
            <span className={`font-medium ${newQuantity < 0 ? 'text-red-500' : newQuantity <= item.minThreshold ? 'text-yellow-500' : 'text-green-500'}`}>
              {newQuantity} {item.unit}
            </span>
          </div>
        </div>

        <FormField
          control={form.control}
          name="quantityChange"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thay đổi số lượng</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Nhập số dương để thêm, số âm để trừ"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormDescription>
                Ví dụ: +10 để nhập thêm, -5 để xuất kho
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="referenceType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loại thao tác</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại thao tác" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="manual">Điều chỉnh thủ công</SelectItem>
                  <SelectItem value="restock">Nhập kho</SelectItem>
                  <SelectItem value="adjustment">Kiểm kê</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lý do</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Nhập lý do thay đổi số lượng..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button type="submit" disabled={isLoading || newQuantity < 0}>
            {isLoading ? "Đang cập nhật..." : "Cập nhật"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
