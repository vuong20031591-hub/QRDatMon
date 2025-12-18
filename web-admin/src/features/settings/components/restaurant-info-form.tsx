"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { restaurantInfoSchema, type RestaurantInfoFormValues } from "../schemas/settings.schema"
import type { RestaurantInfo } from "@/types/settings"
import { Loader2 } from "lucide-react"

interface RestaurantInfoFormProps {
  data: RestaurantInfo | null
  onSubmit: (data: RestaurantInfoFormValues) => Promise<void>
  isLoading?: boolean
}

const DAYS = [
  { key: "monday", label: "Thứ 2" },
  { key: "tuesday", label: "Thứ 3" },
  { key: "wednesday", label: "Thứ 4" },
  { key: "thursday", label: "Thứ 5" },
  { key: "friday", label: "Thứ 6" },
  { key: "saturday", label: "Thứ 7" },
  { key: "sunday", label: "Chủ nhật" },
] as const

// Default values chỉ dùng khi DB chưa có data (lần đầu setup)
const defaultOperatingHours = {
  monday: { open: "08:00", close: "22:00", isOpen: true },
  tuesday: { open: "08:00", close: "22:00", isOpen: true },
  wednesday: { open: "08:00", close: "22:00", isOpen: true },
  thursday: { open: "08:00", close: "22:00", isOpen: true },
  friday: { open: "08:00", close: "22:00", isOpen: true },
  saturday: { open: "08:00", close: "23:00", isOpen: true },
  sunday: { open: "08:00", close: "23:00", isOpen: true },
}

export function RestaurantInfoForm({ data, onSubmit, isLoading }: RestaurantInfoFormProps) {
  const form = useForm<RestaurantInfoFormValues>({
    resolver: zodResolver(restaurantInfoSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      email: "",
      logo: "",
      operatingHours: defaultOperatingHours,
    },
  })

  // Reset form khi data từ API thay đổi
  useEffect(() => {
    if (data) {
      form.reset({
        name: data.name || "",
        address: data.address || "",
        phone: data.phone || "",
        email: data.email || "",
        logo: data.logo || "",
        operatingHours: data.operatingHours || defaultOperatingHours,
      })
    }
  }, [data, form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
            <CardDescription>Thông tin hiển thị trên hóa đơn và ứng dụng</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Tên nhà hàng *</FormLabel>
                <FormControl><Input {...field} placeholder="VD: Nhà hàng ABC" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem>
                <FormLabel>Địa chỉ</FormLabel>
                <FormControl><Input {...field} placeholder="VD: 123 Đường ABC, Quận 1, TP.HCM" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Số điện thoại</FormLabel>
                  <FormControl><Input {...field} placeholder="VD: 0901234567" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input {...field} type="email" placeholder="VD: info@nhahang.com" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Giờ hoạt động</CardTitle>
            <CardDescription>Thiết lập giờ mở cửa cho từng ngày trong tuần</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {DAYS.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-4 py-2 border-b last:border-0">
                  <div className="w-24 font-medium">{label}</div>
                  <FormField control={form.control} name={`operatingHours.${key}.isOpen`} render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name={`operatingHours.${key}.open`} render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input {...field} type="time" disabled={!form.watch(`operatingHours.${key}.isOpen`)} />
                      </FormControl>
                    </FormItem>
                  )} />
                  <span>-</span>
                  <FormField control={form.control} name={`operatingHours.${key}.close`} render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input {...field} type="time" disabled={!form.watch(`operatingHours.${key}.isOpen`)} />
                      </FormControl>
                    </FormItem>
                  )} />
                </div>
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
