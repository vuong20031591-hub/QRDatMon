/**
 * Reports Hooks - Data fetching
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import apiClient from "@/lib/api/client"
import type { 
  RevenueReport, 
  SalesReport, 
  StaffReport, 
  OperationalMetrics,
  ReportFilters
} from "@/types/report"

interface UseRevenueReportReturn {
  report: RevenueReport | null
  loading: boolean
  error: string | null
  fetchReport: (filters?: ReportFilters) => Promise<void>
}

export function useRevenueReport(): UseRevenueReportReturn {
  const [report, setReport] = useState<RevenueReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReport = useCallback(async (filters?: ReportFilters) => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (filters?.startDate) params.append('startDate', filters.startDate)
      if (filters?.endDate) params.append('endDate', filters.endDate)
      if (filters?.groupBy) params.append('groupBy', filters.groupBy)

      const response = await apiClient.get(`/reports/revenue?${params.toString()}`)
      const rawData = response.data.data
      
      // Transform API response to match frontend types
      const transformedReport: RevenueReport = {
        totalRevenue: rawData.totals?.totalRevenue || 0,
        totalOrders: rawData.totals?.billCount || 0,
        avgOrderValue: rawData.totals?.avgBillAmount || 0,
        revenueByPeriod: (rawData.revenueByPeriod || []).map((item: { period: string; revenue: number; billCount: number }) => ({
          date: item.period,
          revenue: item.revenue || 0,
          orderCount: item.billCount || 0
        })),
        comparison: rawData.comparison
      }
      
      setReport(transformedReport)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch revenue report'
      setError(errorMessage)
      console.error('Failed to fetch revenue report:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  return { report, loading, error, fetchReport }
}

interface UseSalesReportReturn {
  report: SalesReport | null
  loading: boolean
  error: string | null
  fetchReport: (filters?: ReportFilters) => Promise<void>
}

export function useSalesReport(): UseSalesReportReturn {
  const [report, setReport] = useState<SalesReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReport = useCallback(async (filters?: ReportFilters) => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (filters?.startDate) params.append('startDate', filters.startDate)
      if (filters?.endDate) params.append('endDate', filters.endDate)
      if (filters?.categoryId) params.append('categoryId', filters.categoryId)

      const response = await apiClient.get(`/reports/popular-items?${params.toString()}`)
      const rawData = response.data.data
      
      // Transform API response to match frontend types
      interface RawPopularItem {
        id: string
        name: string
        imageUrl?: string
        category?: string
        totalQuantity: number
        totalRevenue: number
      }

      interface RawCategoryPerformance {
        categoryId: string
        name: string
        salesCount: number
        revenue: number
        itemCount: number
      }
      
      const transformedReport: SalesReport = {
        topItems: (rawData.popularItems || []).map((item: RawPopularItem) => ({
          menuItemId: item.id,
          name: item.name,
          imageUrl: item.imageUrl,
          category: item.category,
          salesCount: item.totalQuantity || 0,
          revenue: item.totalRevenue || 0
        })),
        categoryPerformance: (rawData.categoryPerformance || []).map((cat: RawCategoryPerformance) => ({
          categoryId: cat.categoryId,
          name: cat.name,
          salesCount: cat.salesCount || 0,
          revenue: cat.revenue || 0
        }))
      }
      
      setReport(transformedReport)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sales report'
      setError(errorMessage)
      console.error('Failed to fetch sales report:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  return { report, loading, error, fetchReport }
}

interface UseStaffReportReturn {
  report: StaffReport | null
  loading: boolean
  error: string | null
  fetchReport: (filters?: ReportFilters) => Promise<void>
}

export function useStaffReport(): UseStaffReportReturn {
  const [report, setReport] = useState<StaffReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReport = useCallback(async (filters?: ReportFilters) => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (filters?.startDate) params.append('startDate', filters.startDate)
      if (filters?.endDate) params.append('endDate', filters.endDate)
      if (filters?.staffId) params.append('staffId', filters.staffId)

      const response = await apiClient.get(`/reports/staff-performance?${params.toString()}`)
      const rawData = response.data.data
      
      // Transform API response to match frontend types
      interface RawCashierPerformance {
        staffId: string
        employeeCode?: string
        name: string
        role?: string
        billsProcessed: number
        totalRevenue: number
        avgBillAmount: number
      }
      
      const cashierData = rawData.cashierPerformance || []
      const transformedReport: StaffReport = {
        staffPerformance: cashierData.map((item: RawCashierPerformance) => ({
          staffId: item.staffId,
          employeeCode: item.employeeCode || '',
          name: item.name,
          role: item.role || 'staff',
          ordersHandled: item.billsProcessed || 0,
          avgServiceTime: 0,
          totalRevenue: item.totalRevenue || 0
        })),
        totalOrdersHandled: cashierData.reduce((sum: number, item: RawCashierPerformance) => sum + (item.billsProcessed || 0), 0),
        avgServiceTime: 0
      }
      
      setReport(transformedReport)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch staff report'
      setError(errorMessage)
      console.error('Failed to fetch staff report:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  return { report, loading, error, fetchReport }
}

interface UseOperationalMetricsReturn {
  metrics: OperationalMetrics | null
  loading: boolean
  error: string | null
  fetchMetrics: (filters?: ReportFilters) => Promise<void>
}

export function useOperationalMetrics(): UseOperationalMetricsReturn {
  const [metrics, setMetrics] = useState<OperationalMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = useCallback(async (filters?: ReportFilters) => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (filters?.startDate) params.append('startDate', filters.startDate)
      if (filters?.endDate) params.append('endDate', filters.endDate)

      const response = await apiClient.get(`/reports/operations?${params.toString()}`)
      setMetrics(response.data.data)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch operational metrics'
      setError(errorMessage)
      console.error('Failed to fetch operational metrics:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  return { metrics, loading, error, fetchMetrics }
}
