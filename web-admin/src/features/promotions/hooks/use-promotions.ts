"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "@/lib/api/client"
import { API_ENDPOINTS } from "@/lib/api/endpoints"
import type { Promotion } from "@/types"

interface PromotionFilters {
  isActive?: boolean
  discountType?: string
  search?: string
}

interface PromotionUsage {
  id: string
  userId: string
  userName?: string
  usedAt: string
  orderAmount: number
  discountAmount: number
}

export function usePromotions(filters?: PromotionFilters) {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPromotions = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters?.isActive !== undefined) params.append("isActive", String(filters.isActive))
      if (filters?.discountType) params.append("discountType", filters.discountType)
      if (filters?.search) params.append("search", filters.search)
      params.append("limit", "100")

      const response = await apiClient.get(`${API_ENDPOINTS.PROMOTIONS.ALL}?${params}`)
      const data = response.data.data?.promotions || response.data.data || []
      setPromotions(Array.isArray(data) ? data.map((p: Promotion & { _id?: string }) => ({
        ...p,
        id: p.id || p._id || ''
      })).filter((p): p is Promotion => !!p.id) : [])
      setError(null)
    } catch {
      setError("Không thể tải danh sách khuyến mãi")
      setPromotions([])
    } finally {
      setLoading(false)
    }
  }, [filters?.isActive, filters?.discountType, filters?.search])

  useEffect(() => { fetchPromotions() }, [fetchPromotions])

  const createPromotion = async (data: Partial<Promotion>) => {
    const response = await apiClient.post(API_ENDPOINTS.PROMOTIONS.CREATE, data)
    await fetchPromotions()
    return response.data
  }

  const updatePromotion = async (id: string, data: Partial<Promotion>) => {
    const response = await apiClient.put(API_ENDPOINTS.PROMOTIONS.UPDATE(id), data)
    await fetchPromotions()
    return response.data
  }

  const deactivatePromotion = async (id: string) => {
    const response = await apiClient.patch(API_ENDPOINTS.PROMOTIONS.DEACTIVATE(id))
    await fetchPromotions()
    return response.data
  }

  const reactivatePromotion = async (id: string) => {
    const response = await apiClient.patch(API_ENDPOINTS.PROMOTIONS.REACTIVATE(id))
    await fetchPromotions()
    return response.data
  }

  const generateCode = async (prefix?: string, length?: number) => {
    const response = await apiClient.post(API_ENDPOINTS.PROMOTIONS.GENERATE_CODE, { prefix, length })
    return response.data.data?.code || response.data.code
  }

  const cleanupExpired = async () => {
    const response = await apiClient.post(API_ENDPOINTS.PROMOTIONS.CLEANUP)
    await fetchPromotions()
    return response.data
  }

  return {
    promotions,
    loading,
    error,
    fetchPromotions,
    createPromotion,
    updatePromotion,
    deactivatePromotion,
    reactivatePromotion,
    generateCode,
    cleanupExpired,
  }
}

export function usePromotionUsage(promotionId?: string) {
  const [usage, setUsage] = useState<PromotionUsage[]>([])
  const [stats, setStats] = useState<{ totalUsed: number; totalRevenue: number } | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchUsage = useCallback(async () => {
    if (!promotionId) return
    try {
      setLoading(true)
      const response = await apiClient.get(API_ENDPOINTS.PROMOTIONS.USAGE(promotionId))
      const data = response.data.data
      setUsage(data?.usage || [])
      setStats({
        totalUsed: data?.totalUsed || 0,
        totalRevenue: data?.totalRevenue || 0,
      })
    } catch {
      setUsage([])
      setStats(null)
    } finally {
      setLoading(false)
    }
  }, [promotionId])

  useEffect(() => { fetchUsage() }, [fetchUsage])

  return { usage, stats, loading, fetchUsage }
}
