"use client"

import { useState, useEffect, useCallback } from "react"
import apiClient from "@/lib/api/client"
import { API_ENDPOINTS } from "@/lib/api/endpoints"
import type { Order, OrderFilters, OrderPagination, OrderStatus } from "@/types/order"

interface UseOrdersOptions {
  initialFilters?: OrderFilters
  initialPage?: number
  initialLimit?: number
}

export function useOrders(options: UseOrdersOptions = {}) {
  const { initialFilters = {}, initialPage = 1, initialLimit = 20 } = options
  
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<OrderFilters>(initialFilters)
  const [pagination, setPagination] = useState<OrderPagination>({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  })

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      params.append("page", pagination.page.toString())
      params.append("limit", pagination.limit.toString())
      
      if (filters.status) params.append("status", filters.status)
      if (filters.tableId) params.append("tableId", filters.tableId)
      if (filters.startDate) params.append("startDate", filters.startDate)
      if (filters.endDate) params.append("endDate", filters.endDate)
      
      const response = await apiClient.get(`${API_ENDPOINTS.ORDERS.LIST}?${params.toString()}`)
      const data = response.data
      
      // Handle API response format
      const ordersData = Array.isArray(data.data) ? data.data : (data.orders || [])
      setOrders(ordersData.map(normalizeOrder))
      
      if (data.pagination) {
        setPagination(prev => ({ ...prev, ...data.pagination }))
      }
      setError(null)
    } catch {
      setError("Không thể tải danh sách đơn hàng")
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.page, pagination.limit])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const updateFilters = (newFilters: Partial<OrderFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page
  }

  const setPage = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }

  const updateOrderStatus = async (id: string, status: OrderStatus, reason?: string) => {
    const response = await apiClient.patch(API_ENDPOINTS.ORDERS.UPDATE_STATUS(id), { status, reason })
    await fetchOrders()
    return response.data
  }

  const cancelOrder = async (id: string, reason: string) => {
    const response = await apiClient.patch(API_ENDPOINTS.ORDERS.CANCEL(id), { reason })
    await fetchOrders()
    return response.data
  }

  return {
    orders,
    loading,
    error,
    filters,
    pagination,
    fetchOrders,
    updateFilters,
    setPage,
    updateOrderStatus,
    cancelOrder,
  }
}

export function useOrderDetail(orderId: string | null) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOrder = useCallback(async () => {
    if (!orderId) return
    
    try {
      setLoading(true)
      const response = await apiClient.get(API_ENDPOINTS.ORDERS.DETAIL(orderId))
      const data = response.data.data?.order || response.data.order || response.data.data
      setOrder(normalizeOrder(data))
      setError(null)
    } catch {
      setError("Không thể tải chi tiết đơn hàng")
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => { fetchOrder() }, [fetchOrder])

  const updateItemStatus = async (itemId: string, status: string, reason?: string) => {
    if (!orderId) return
    const response = await apiClient.patch(
      API_ENDPOINTS.ORDERS.ITEM_STATUS(orderId, itemId),
      { status, reason }
    )
    await fetchOrder()
    return response.data
  }

  return { order, loading, error, fetchOrder, updateItemStatus }
}

// Normalize order data from API
function normalizeOrder(order: Order & { _id?: string }): Order {
  return {
    ...order,
    id: order.id || order._id || "",
    items: (order.items || []).map(item => ({
      ...item,
      id: item.id || (item as { _id?: string })._id || "",
    })),
  }
}
