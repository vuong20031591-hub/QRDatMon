"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { notificationSettingsSchema, type NotificationSettingsFormValues } from "../schemas/settings.schema"
import type { NotificationSettings } from "@/types/settings"
import { Loader2, Bell, Package, Star, CreditCard } from "lucide-react"

interface NotificationSettingsFormProps {
  data: NotificationSettings | null
  onSubmit: (data: NotificationSettingsFormValues) => Promise<void>
  isLoading?: boolean
}

const NOTIFICATION_ITEMS = [
  { key: "newOrder", label: "Đơn hàng mới", description: "Nhận thông báo khi có đơn hàng mới", icon: Bell },
  { key: "lowStock", label: "Cảnh báo tồn kho", description: "Nhận thông báo khi nguyên liệu sắp hết", icon: Package },
  { key: "newReview", label: "Đánh giá mới", description: "Nhận thông báo khi có đánh giá mới từ khách hàng", icon: Star },
  { key: "payment", label: "Thanh toán", description: "Nhận thông báo khi có thanh toán thành công", icon: CreditCard },
] as const

export function NotificationSettingsForm({ data, onSubmit, isLoading }: NotificationSettingsFormProps) {
  const form = useForm<NotificationSettingsFormValues>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      newOrder: true,
      lowStock: true,
      newReview: true,
      payment: true,
    },
  })

  // Reset form khi data từ API thay đổi
  useEffect(() => {
    if (data) {
      form.reset({
        newOrder: data.newOrder,
        lowStock: data.lowStock,
        newReview: data.newReview,
        payment: data.payment,
      })
    }
  }, [data, form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Cài đặt thông báo</CardTitle>
            <CardDescription>Chọn loại thông báo bạn muốn nhận</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {NOTIFICATION_ITEMS.map(({ key, label, description, icon: Icon }) => (
                <FormField key={key} control={form.control} name={key} render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-muted p-2">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">{label}</FormLabel>
                        <FormDescription>{description}</FormDescription>
                      </div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )} />
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </Form>
  )
}
