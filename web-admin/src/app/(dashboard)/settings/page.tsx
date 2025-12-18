"use client"

import { useState } from "react"
import { Settings, Store, Receipt, Bell } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
  RestaurantInfoForm,
  TaxSettingsForm,
  NotificationSettingsForm,
  useRestaurantInfo,
  useTaxSettings,
  useNotificationSettings,
  type RestaurantInfoFormValues,
  type TaxSettingsFormValues,
  type NotificationSettingsFormValues,
} from "@/features/settings"

export default function SettingsPage() {
  const { restaurantInfo, loading: restaurantLoading, updateRestaurantInfo } = useRestaurantInfo()
  const { taxSettings, loading: taxLoading, updateTaxSettings } = useTaxSettings()
  const { notificationSettings, loading: notificationLoading, updateNotificationSettings } = useNotificationSettings()
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRestaurantSubmit = async (data: RestaurantInfoFormValues) => {
    try {
      setIsSubmitting(true)
      await updateRestaurantInfo(data)
      toast.success("Cập nhật thông tin nhà hàng thành công")
    } catch {
      toast.error("Không thể cập nhật thông tin nhà hàng")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTaxSubmit = async (data: TaxSettingsFormValues) => {
    try {
      setIsSubmitting(true)
      await updateTaxSettings(data)
      toast.success("Cập nhật cài đặt thuế thành công")
    } catch {
      toast.error("Không thể cập nhật cài đặt thuế")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNotificationSubmit = async (data: NotificationSettingsFormValues) => {
    try {
      setIsSubmitting(true)
      await updateNotificationSettings(data)
      toast.success("Cập nhật cài đặt thông báo thành công")
    } catch {
      toast.error("Không thể cập nhật cài đặt thông báo")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Cài đặt</h1>
      </div>

      <Tabs defaultValue="restaurant" className="space-y-6">
        <TabsList>
          <TabsTrigger value="restaurant" className="gap-2">
            <Store className="h-4 w-4" />
            Thông tin nhà hàng
          </TabsTrigger>
          <TabsTrigger value="tax" className="gap-2">
            <Receipt className="h-4 w-4" />
            Thuế & Phí
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Thông báo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="restaurant">
          {restaurantLoading ? (
            <SettingsSkeleton />
          ) : (
            <RestaurantInfoForm
              data={restaurantInfo}
              onSubmit={handleRestaurantSubmit}
              isLoading={isSubmitting}
            />
          )}
        </TabsContent>

        <TabsContent value="tax">
          {taxLoading ? (
            <SettingsSkeleton />
          ) : (
            <TaxSettingsForm
              data={taxSettings}
              onSubmit={handleTaxSubmit}
              isLoading={isSubmitting}
            />
          )}
        </TabsContent>

        <TabsContent value="notifications">
          {notificationLoading ? (
            <SettingsSkeleton />
          ) : (
            <NotificationSettingsForm
              data={notificationSettings}
              onSubmit={handleNotificationSubmit}
              isLoading={isSubmitting}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function SettingsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-[200px] w-full" />
      <Skeleton className="h-10 w-32 ml-auto" />
    </div>
  )
}
