"use client"

import { useState, useEffect, useCallback } from "react"
import apiClient from "@/lib/api/client"
import { API_ENDPOINTS } from "@/lib/api/endpoints"
import type { MenuItem, Category } from "@/types"

export function useMenuItems() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      const response = await apiClient.get(`${API_ENDPOINTS.MENU.ITEMS}?limit=100`)
      // API returns: { data: [...] } - data is array directly
      const data = Array.isArray(response.data.data) ? response.data.data : (response.data.items || [])
      setItems(data)
      setError(null)
    } catch {
      setError("Không thể tải danh sách món ăn")
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  const createItem = async (data: Partial<MenuItem>) => {
    const response = await apiClient.post(API_ENDPOINTS.MENU.CREATE, data)
    await fetchItems()
    return response.data
  }

  const updateItem = async (id: string, data: Partial<MenuItem>) => {
    const response = await apiClient.put(API_ENDPOINTS.MENU.UPDATE(id), data)
    await fetchItems()
    return response.data
  }

  const deleteItem = async (id: string) => {
    await apiClient.delete(API_ENDPOINTS.MENU.DELETE(id))
    await fetchItems()
  }

  const updateStatus = async (id: string, status: MenuItem["status"]) => {
    const response = await apiClient.patch(`${API_ENDPOINTS.MENU.ITEM(id)}/status`, { status })
    await fetchItems()
    return response.data
  }

  return { items, loading, error, fetchItems, createItem, updateItem, deleteItem, updateStatus }
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.LIST)
      // API returns: { data: { categories: [...] } } or { data: [...] }
      const data = response.data.data?.categories || (Array.isArray(response.data.data) ? response.data.data : [])
      setCategories(data)
      setError(null)
    } catch {
      setError("Không thể tải danh mục")
      setCategories([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  const createCategory = async (data: Partial<Category>) => {
    const response = await apiClient.post(API_ENDPOINTS.CATEGORIES.CREATE, data)
    await fetchCategories()
    return response.data
  }

  const updateCategory = async (id: string, data: Partial<Category>) => {
    const response = await apiClient.put(API_ENDPOINTS.CATEGORIES.UPDATE(id), data)
    await fetchCategories()
    return response.data
  }

  const deleteCategory = async (id: string) => {
    await apiClient.delete(API_ENDPOINTS.CATEGORIES.DELETE(id))
    await fetchCategories()
  }

  return { categories, loading, error, fetchCategories, createCategory, updateCategory, deleteCategory }
}
