/**
 * Inventory Settings Form Component
 * Form to update inventory settings (threshold, unit, auto-update)
 */

"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { inventorySettingsSchema, type InventorySettingsFormValues } from "../schemas/inventory.schema"
import type { InventoryItem } from "@/types/inventory"

interface InventorySettingsFormProps {
  item: InventoryItem
  onSubmit: (data: InventorySettingsFormValues) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function InventorySettingsForm({ item, onSubmit, onCancel, isLoading }: InventorySettingsFormProps) {
  const form = useForm<InventorySettingsFormValues>({
    resolver: zodResolver(inventorySettingsSchema),
    defaultValues: {
      minThreshold: item.minThreshold,
      unit: item.unit,
      autoUpdateStatus: item.autoUpdateStatus,
    },
  })

  const handleSubmit = async (data: InventorySettingsFormValues) => {
    await onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <p className="font-medium">{item.menuItem.name}</p>
          <p className="text-sm text-muted-foreground">
            Số lượng hiện tại: {item.quantity} {item.unit}
          </p>
        </div>

        <FormField
          control={form.control}
          name="minThreshold"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ngưỡng cảnh báo tối thiểu</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  placeholder="Nhập ngưỡng tối thiểu"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormDescription>
                Hệ thống sẽ cảnh báo khi số lượng dưới ngưỡng này
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Đơn vị</FormLabel>
              <FormControl>
                <Input placeholder="Ví dụ: phần, kg, lít..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="autoUpdateStatus"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Tự động cập nhật trạng thái</FormLabel>
                <FormDescription>
                  Tự động đánh dấu món hết hàng khi số lượng = 0
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Đang lưu..." : "Lưu cài đặt"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
