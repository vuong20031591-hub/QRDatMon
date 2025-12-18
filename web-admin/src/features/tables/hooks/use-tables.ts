"use client"

import { useState, useEffect, useCallback } from "react"
import apiClient from "@/lib/api/client"
import { API_ENDPOINTS } from "@/lib/api/endpoints"
import type { Table, Area } from "@/types"

export function useTables() {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTables = useCallback(async () => {
    try {
      setLoading(true)
      const response = await apiClient.get(API_ENDPOINTS.TABLES.LIST)
      // API returns: { data: { tables: [...] } }
      const rawData = response.data.data?.tables || response.data.tables || response.data.data || []
      // Ensure each table has an id (API may return _id)
      const data = Array.isArray(rawData) ? rawData.map((t: Table & { _id?: string }) => ({
        ...t,
        id: t.id || t._id || ""
      })) : []
      setTables(data as Table[])
      setError(null)
    } catch {
      setError("Không thể tải danh sách bàn")
      setTables([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTables() }, [fetchTables])

  const createTable = async (data: Partial<Table>) => {
    const response = await apiClient.post(API_ENDPOINTS.TABLES.CREATE, data)
    await fetchTables()
    return response.data
  }

  const updateTable = async (id: string, data: Partial<Table>) => {
    const response = await apiClient.put(API_ENDPOINTS.TABLES.UPDATE(id), data)
    await fetchTables()
    return response.data
  }

  const deleteTable = async (id: string) => {
    await apiClient.delete(API_ENDPOINTS.TABLES.DELETE(id))
    await fetchTables()
  }

  const updateStatus = async (id: string, status: Table["status"]) => {
    const response = await apiClient.patch(API_ENDPOINTS.TABLES.UPDATE_STATUS(id), { status })
    await fetchTables()
    return response.data
  }

  const generateQR = async (id: string, regenerate = false) => {
    const response = await apiClient.post(API_ENDPOINTS.TABLES.GENERATE_QR(id), { regenerate })
    await fetchTables()
    return response.data
  }

  return { tables, loading, error, fetchTables, createTable, updateTable, deleteTable, updateStatus, generateQR }
}

export function useAreas() {
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAreas = useCallback(async () => {
    try {
      setLoading(true)
      const response = await apiClient.get(API_ENDPOINTS.AREAS.LIST)
      // API returns: { data: { areas: [...] } }
      const rawData = response.data.data?.areas || response.data.areas || response.data.data || []
      // Ensure each area has an id (API may return _id)
      const data = Array.isArray(rawData) ? rawData.map((a: Area & { _id?: string }) => ({
        ...a,
        id: a.id || a._id || ""
      })) : []
      setAreas(data as Area[])
      setError(null)
    } catch {
      setError("Không thể tải danh sách khu vực")
      setAreas([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAreas() }, [fetchAreas])

  const createArea = async (data: Partial<Area>) => {
    const response = await apiClient.post(API_ENDPOINTS.AREAS.CREATE, data)
    await fetchAreas()
    return response.data
  }

  const updateArea = async (id: string, data: Partial<Area>) => {
    const response = await apiClient.put(API_ENDPOINTS.AREAS.UPDATE(id), data)
    await fetchAreas()
    return response.data
  }

  const deleteArea = async (id: string) => {
    await apiClient.delete(API_ENDPOINTS.AREAS.DELETE(id))
    await fetchAreas()
  }

  return { areas, loading, error, fetchAreas, createArea, updateArea, deleteArea }
}
