"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { taxSettingsSchema, type TaxSettingsFormValues } from "../schemas/settings.schema"
import type { TaxSettings } from "@/types/settings"
import { Loader2 } from "lucide-react"

interface TaxSettingsFormProps {
  data: TaxSettings | null
  onSubmit: (data: TaxSettingsFormValues) => Promise<void>
  isLoading?: boolean
}

export function TaxSettingsForm({ data, onSubmit, isLoading }: TaxSettingsFormProps) {
  const form = useForm<TaxSettingsFormValues>({
    resolver: zodResolver(taxSettingsSchema),
    defaultValues: {
      vatPercent: 0,
      serviceChargePercent: 0,
    },
  })

  // Reset form khi data từ API thay đổi
  useEffect(() => {
    if (data) {
      form.reset({
        vatPercent: data.vatPercent,
        serviceChargePercent: data.serviceChargePercent,
      })
    }
  }, [data, form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Cài đặt thuế và phí</CardTitle>
            <CardDescription>Thiết lập thuế VAT và phí dịch vụ áp dụng cho tất cả hóa đơn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField control={form.control} name="vatPercent" render={({ field }) => (
              <FormItem>
                <FormLabel>Thuế VAT (%)</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number" 
                    min={0} 
                    max={100} 
                    step={0.1}
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>Thuế giá trị gia tăng áp dụng cho hóa đơn</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="serviceChargePercent" render={({ field }) => (
              <FormItem>
                <FormLabel>Phí dịch vụ (%)</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number" 
                    min={0} 
                    max={100} 
                    step={0.1}
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>Phí dịch vụ áp dụng cho hóa đơn (nếu có)</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
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
