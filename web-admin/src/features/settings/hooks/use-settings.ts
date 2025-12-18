/**
 * Settings Hooks
 */

import { useState, useCallback, useEffect } from "react"
import apiClient from "@/lib/api/client"
import type { RestaurantInfo, TaxSettings, NotificationSettings } from "@/types/settings"

export function useRestaurantInfo() {
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRestaurantInfo = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.get("/settings/restaurant")
      setRestaurantInfo(response.data.data.restaurantInfo)
    } catch {
      setError("Không thể tải thông tin nhà hàng")
    } finally {
      setLoading(false)
    }
  }, [])

  const updateRestaurantInfo = useCallback(async (data: Partial<RestaurantInfo>) => {
    const response = await apiClient.put("/settings/restaurant", data)
    setRestaurantInfo(response.data.data.restaurantInfo)
    return response.data.data.restaurantInfo
  }, [])

  useEffect(() => {
    fetchRestaurantInfo()
  }, [fetchRestaurantInfo])

  return { restaurantInfo, loading, error, fetchRestaurantInfo, updateRestaurantInfo }
}

export function useTaxSettings() {
  const [taxSettings, setTaxSettings] = useState<TaxSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTaxSettings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.get("/settings/tax")
      setTaxSettings(response.data.data.taxSettings)
    } catch {
      setError("Không thể tải cài đặt thuế")
    } finally {
      setLoading(false)
    }
  }, [])

  const updateTaxSettings = useCallback(async (data: Partial<TaxSettings>) => {
    const response = await apiClient.put("/settings/tax", data)
    setTaxSettings(response.data.data.taxSettings)
    return response.data.data.taxSettings
  }, [])

  useEffect(() => {
    fetchTaxSettings()
  }, [fetchTaxSettings])

  return { taxSettings, loading, error, fetchTaxSettings, updateTaxSettings }
}

export function useNotificationSettings() {
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotificationSettings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.get("/settings/notifications")
      setNotificationSettings(response.data.data.notificationSettings)
    } catch {
      setError("Không thể tải cài đặt thông báo")
    } finally {
      setLoading(false)
    }
  }, [])

  const updateNotificationSettings = useCallback(async (data: Partial<NotificationSettings>) => {
    const response = await apiClient.put("/settings/notifications", data)
    setNotificationSettings(response.data.data.notificationSettings)
    return response.data.data.notificationSettings
  }, [])

  useEffect(() => {
    fetchNotificationSettings()
  }, [fetchNotificationSettings])

  return { notificationSettings, loading, error, fetchNotificationSettings, updateNotificationSettings }
}
