/**
 * Notifications Hook - Data fetching and mutations
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import apiClient from "@/lib/api/client"
import type { Notification, NotificationPagination } from "@/types/notification"

interface UseNotificationsReturn {
  notifications: Notification[]
  pagination: NotificationPagination | null
  unreadCount: number
  loading: boolean
  error: string | null
  fetchNotifications: (unreadOnly?: boolean) => Promise<void>
  fetchUnreadCount: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  loadMore: () => void
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [pagination, setPagination] = useState<NotificationPagination | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const fetchNotifications = useCallback(async (unreadOnly = false) => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', '20')
      if (unreadOnly) params.append('unreadOnly', 'true')

      const response = await apiClient.get(`/notifications?${params.toString()}`)
      
      const rawNotifications = response.data.data?.notifications || response.data.data || []
      const paginationData = response.data.meta?.pagination || response.data.data?.pagination || null
      
      const transformedNotifications: Notification[] = rawNotifications.map((n: Record<string, unknown>) => ({
        id: (n._id || n.id) as string,
        title: n.title as string,
        body: n.body as string,
        type: n.type as string,
        data: n.data as Record<string, unknown>,
        isRead: n.isRead as boolean,
        readAt: n.readAt as string | undefined,
        createdAt: n.createdAt as string,
        updatedAt: n.updatedAt as string | undefined,
      }))
      
      if (page === 1) {
        setNotifications(transformedNotifications)
      } else {
        setNotifications(prev => [...prev, ...transformedNotifications])
      }
      setPagination(paginationData)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải thông báo'
      setError(errorMessage)
      console.error('Failed to fetch notifications:', err)
    } finally {
      setLoading(false)
    }
  }, [page])

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await apiClient.get('/notifications/unread-count')
      const count = response.data.data?.count ?? response.data.data ?? 0
      setUnreadCount(count)
    } catch (err) {
      console.error('Failed to fetch unread count:', err)
    }
  }, [])

  const markAsRead = useCallback(async (id: string) => {
    try {
      await apiClient.put(`/notifications/${id}/read`)
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to mark as read:', err)
      throw err
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      await apiClient.put('/notifications/read-all')
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      )
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark all as read:', err)
      throw err
    }
  }, [])

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await apiClient.delete(`/notifications/${id}`)
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (err) {
      console.error('Failed to delete notification:', err)
      throw err
    }
  }, [])

  const loadMore = useCallback(() => {
    if (pagination && page < pagination.totalPages) {
      setPage(prev => prev + 1)
    }
  }, [pagination, page])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  useEffect(() => {
    fetchUnreadCount()
  }, [fetchUnreadCount])

  return {
    notifications,
    pagination,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMore
  }
}
