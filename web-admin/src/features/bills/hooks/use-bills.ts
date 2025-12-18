"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "@/lib/api/client"
import { API_ENDPOINTS } from "@/lib/api/endpoints"
import type { Bill, Table, Payment } from "@/types"

interface BillWithTable extends Omit<Bill, 'table'> {
  table?: Table
  orders?: Array<{
    id: string
    orderNumber: string
    items: Array<{
      name: string
      quantity: number
      price: number
    }>
  }>
}

interface BillFilters {
  status?: string
  tableId?: string
  startDate?: string
  endDate?: string
}

export function useBills(filters?: BillFilters) {
  const [bills, setBills] = useState<BillWithTable[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBills = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters?.status) params.append("status", filters.status)
      if (filters?.tableId) params.append("tableId", filters.tableId)
      if (filters?.startDate) params.append("startDate", filters.startDate)
      if (filters?.endDate) params.append("endDate", filters.endDate)
      params.append("limit", "100")

      const response = await apiClient.get(`${API_ENDPOINTS.BILLS.LIST}?${params}`)
      const data = response.data.data?.bills || response.data.data || []
      setBills(Array.isArray(data) ? data.map((b: BillWithTable & { _id?: string }) => ({
        ...b,
        id: b.id || b._id || ''
      })).filter((b): b is BillWithTable => !!b.id) : [])
      setError(null)
    } catch {
      setError("Không thể tải danh sách hóa đơn")
      setBills([])
    } finally {
      setLoading(false)
    }
  }, [filters?.status, filters?.tableId, filters?.startDate, filters?.endDate])

  useEffect(() => { fetchBills() }, [fetchBills])

  const getBillById = async (id: string) => {
    const response = await apiClient.get(API_ENDPOINTS.BILLS.DETAIL(id))
    return response.data.data?.bill || response.data.data
  }

  const applyVoucher = async (billId: string, voucherCode: string) => {
    const response = await apiClient.post(API_ENDPOINTS.BILLS.APPLY_VOUCHER(billId), { voucherCode })
    await fetchBills()
    return response.data
  }

  const removeVoucher = async (billId: string) => {
    const response = await apiClient.delete(API_ENDPOINTS.BILLS.REMOVE_VOUCHER(billId))
    await fetchBills()
    return response.data
  }

  const updateRates = async (billId: string, data: { serviceChargePercent?: number; vatPercent?: number }) => {
    const response = await apiClient.patch(API_ENDPOINTS.BILLS.UPDATE_RATES(billId), data)
    await fetchBills()
    return response.data
  }

  const requestPayment = async (billId: string) => {
    const response = await apiClient.post(API_ENDPOINTS.BILLS.REQUEST_PAYMENT(billId))
    await fetchBills()
    return response.data
  }

  const closeBill = async (billId: string) => {
    const response = await apiClient.post(API_ENDPOINTS.BILLS.CLOSE(billId))
    await fetchBills()
    return response.data
  }

  const cancelBill = async (billId: string, reason: string) => {
    const response = await apiClient.post(API_ENDPOINTS.BILLS.CANCEL(billId), { reason })
    await fetchBills()
    return response.data
  }

  const recalculateBill = async (billId: string) => {
    const response = await apiClient.post(API_ENDPOINTS.BILLS.RECALCULATE(billId))
    await fetchBills()
    return response.data
  }

  return {
    bills,
    loading,
    error,
    fetchBills,
    getBillById,
    applyVoucher,
    removeVoucher,
    updateRates,
    requestPayment,
    closeBill,
    cancelBill,
    recalculateBill,
  }
}

export function usePayments(billId?: string) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(false)

  const fetchPayments = useCallback(async () => {
    if (!billId) return
    try {
      setLoading(true)
      const response = await apiClient.get(API_ENDPOINTS.PAYMENTS.BY_BILL(billId))
      const data = response.data.data?.payments || response.data.data || []
      setPayments(Array.isArray(data) ? data : [])
    } catch {
      setPayments([])
    } finally {
      setLoading(false)
    }
  }, [billId])

  useEffect(() => { fetchPayments() }, [fetchPayments])

  const confirmPayment = async (data: {
    billId: string
    method: string
    amount: number
    transactionId?: string
    note?: string
  }) => {
    const response = await apiClient.post(API_ENDPOINTS.PAYMENTS.CONFIRM, data)
    await fetchPayments()
    return response.data
  }

  return { payments, loading, fetchPayments, confirmPayment }
}
