"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "@/lib/api/client"
import { API_ENDPOINTS } from "@/lib/api/endpoints"
import type { Staff, User, ActivityLog } from "@/types"

interface StaffWithUser extends Staff {
  user?: User
}

interface StaffFilters {
  role?: string
  isActive?: boolean
  search?: string
}

export function useStaff(filters?: StaffFilters) {
  const [staff, setStaff] = useState<StaffWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters?.role) params.append("role", filters.role)
      if (filters?.isActive !== undefined) params.append("isActive", String(filters.isActive))
      if (filters?.search) params.append("search", filters.search)
      params.append("limit", "100")

      const response = await apiClient.get(`${API_ENDPOINTS.STAFF.LIST}?${params}`)
      const data = response.data.data?.staff || response.data.data || []
      setStaff(Array.isArray(data) ? data.map((s: StaffWithUser & { _id?: string }) => ({
        ...s,
        id: s.id || s._id || ''
      })).filter((s): s is StaffWithUser => !!s.id) : [])
      setError(null)
    } catch {
      setError("Không thể tải danh sách nhân viên")
      setStaff([])
    } finally {
      setLoading(false)
    }
  }, [filters?.role, filters?.isActive, filters?.search])

  useEffect(() => { fetchStaff() }, [fetchStaff])

  const createStaff = async (data: Partial<Staff>) => {
    const response = await apiClient.post(API_ENDPOINTS.STAFF.CREATE, data)
    await fetchStaff()
    return response.data
  }

  const updateStaff = async (id: string, data: Partial<Staff>) => {
    const response = await apiClient.put(API_ENDPOINTS.STAFF.UPDATE(id), data)
    await fetchStaff()
    return response.data
  }

  const deactivateStaff = async (id: string) => {
    const response = await apiClient.put(API_ENDPOINTS.STAFF.DEACTIVATE(id))
    await fetchStaff()
    return response.data
  }

  const activateStaff = async (id: string) => {
    const response = await apiClient.put(API_ENDPOINTS.STAFF.ACTIVATE(id))
    await fetchStaff()
    return response.data
  }

  return { 
    staff, 
    loading, 
    error, 
    fetchStaff, 
    createStaff, 
    updateStaff, 
    deactivateStaff, 
    activateStaff 
  }
}

export function useActivityLogs(staffId?: string) {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (staffId) params.append("staffId", staffId)
      params.append("limit", "50")

      const response = await apiClient.get(`${API_ENDPOINTS.ACTIVITY_LOGS.LIST}?${params}`)
      const data = response.data.data?.logs || response.data.data || []
      setLogs(Array.isArray(data) ? data : [])
      setError(null)
    } catch {
      setError("Không thể tải nhật ký hoạt động")
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [staffId])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  return { logs, loading, error, fetchLogs }
}
