/**
 * Inventory Hooks - Data fetching and mutations
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import apiClient from "@/lib/api/client"
import type { 
  InventoryItem, 
  InventoryLog, 
  InventoryFilters, 
  InventoryPagination,
  StockUpdateInput,
  InventorySettingsInput,
  LowStockAlert
} from "@/types/inventory"

interface UseInventoryReturn {
  inventory: InventoryItem[]
  pagination: InventoryPagination | null
  loading: boolean
  error: string | null
  filters: InventoryFilters
  fetchInventory: () => Promise<void>
  updateFilters: (newFilters: Partial<InventoryFilters>) => void
  updateStock: (menuItemId: string, data: StockUpdateInput) => Promise<void>
  updateSettings: (menuItemId: string, data: InventorySettingsInput) => Promise<void>
  setPage: (page: number) => void
}

export function useInventory(): UseInventoryReturn {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [pagination, setPagination] = useState<InventoryPagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<InventoryFilters>({
    sortBy: 'quantity',
    sortOrder: 'asc'
  })
  const [page, setPage] = useState(1)

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', '20')
      
      if (filters.lowStock) params.append('lowStock', 'true')
      if (filters.outOfStock) params.append('outOfStock', 'true')
      if (filters.search) params.append('search', filters.search)
      if (filters.sortBy) params.append('sortBy', filters.sortBy)
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)

      const response = await apiClient.get(`/inventory?${params.toString()}`)
      const responseData = response.data
      
      // API returns data as array directly, pagination in meta
      const inventoryData = Array.isArray(responseData.data) ? responseData.data : (responseData.data?.inventory || [])
      const paginationData = responseData.meta?.pagination || responseData.data?.pagination || null
      
      setInventory(inventoryData)
      setPagination(paginationData)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch inventory'
      setError(errorMessage)
      console.error('Failed to fetch inventory:', err)
    } finally {
      setLoading(false)
    }
  }, [page, filters])

  const updateFilters = useCallback((newFilters: Partial<InventoryFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setPage(1)
  }, [])

  const updateStock = useCallback(async (menuItemId: string, data: StockUpdateInput) => {
    // Clean up data - remove empty strings and undefined values
    const cleanData: Record<string, unknown> = {
      quantityChange: Number(data.quantityChange)
    }
    if (data.reason && data.reason.trim()) {
      cleanData.reason = data.reason.trim()
    }
    if (data.referenceType) {
      cleanData.referenceType = data.referenceType
    }
    
    const response = await apiClient.patch(`/inventory/${menuItemId}/stock`, cleanData)
    await fetchInventory()
    return response.data.data
  }, [fetchInventory])

  const updateSettings = useCallback(async (menuItemId: string, data: InventorySettingsInput) => {
    const response = await apiClient.patch(`/inventory/${menuItemId}/settings`, data)
    await fetchInventory()
    return response.data.data
  }, [fetchInventory])

  useEffect(() => {
    fetchInventory()
  }, [fetchInventory])

  return {
    inventory,
    pagination,
    loading,
    error,
    filters,
    fetchInventory,
    updateFilters,
    updateStock,
    updateSettings,
    setPage
  }
}

interface UseLowStockReturn {
  lowStockItems: InventoryItem[]
  count: number
  loading: boolean
  fetchLowStock: () => Promise<void>
}

export function useLowStock(): UseLowStockReturn {
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchLowStock = useCallback(async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/inventory/low-stock')
      const responseData = response.data
      // API returns array directly in data
      const items = Array.isArray(responseData.data) ? responseData.data : (responseData.data?.items || [])
      setLowStockItems(items)
      setCount(items.length)
    } catch (err) {
      console.error('Failed to fetch low stock items:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLowStock()
  }, [fetchLowStock])

  return { lowStockItems, count, loading, fetchLowStock }
}

interface UseInventoryLogsReturn {
  logs: InventoryLog[]
  pagination: InventoryPagination | null
  loading: boolean
  fetchLogs: () => Promise<void>
  setPage: (page: number) => void
}

export function useInventoryLogs(): UseInventoryLogsReturn {
  const [logs, setLogs] = useState<InventoryLog[]>([])
  const [pagination, setPagination] = useState<InventoryPagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      const response = await apiClient.get(`/inventory/logs?page=${page}&limit=20`)
      const responseData = response.data
      // API returns logs in data.logs, pagination in meta
      const logsData = responseData.data?.logs || []
      const paginationData = responseData.meta?.pagination || responseData.data?.pagination || null
      setLogs(logsData)
      setPagination(paginationData)
    } catch (err) {
      console.error('Failed to fetch inventory logs:', err)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  return { logs, pagination, loading, fetchLogs, setPage }
}
