/**
 * Profile Hook - User profile management
 */

"use client"

import { useState, useCallback } from "react"
import apiClient from "@/lib/api/client"
import { useAuthStore } from "@/stores/auth-store"
import type { User } from "@/types"

interface UpdateProfileData {
  name?: string
  phone?: string
}

interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface UseProfileReturn {
  loading: boolean
  error: string | null
  updateProfile: (data: UpdateProfileData) => Promise<void>
  changePassword: (data: ChangePasswordData) => Promise<void>
  uploadAvatar: (file: File) => Promise<string>
}

export function useProfile(): UseProfileReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user, setAuth, accessToken, staff } = useAuthStore()

  const updateProfile = useCallback(async (data: UpdateProfileData) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiClient.put('/auth/profile', data)
      const updatedUser = response.data.data?.user || response.data.data
      
      // Update auth store with new user data
      if (updatedUser && accessToken) {
        setAuth(updatedUser as User, staff, accessToken)
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể cập nhật hồ sơ'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [accessToken, staff, setAuth])

  const changePassword = useCallback(async (data: ChangePasswordData) => {
    try {
      setLoading(true)
      setError(null)
      
      if (data.newPassword !== data.confirmPassword) {
        throw new Error('Mật khẩu xác nhận không khớp')
      }
      
      await apiClient.put('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể đổi mật khẩu'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const uploadAvatar = useCallback(async (file: File): Promise<string> => {
    try {
      setLoading(true)
      setError(null)
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'avatar')
      
      const response = await apiClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      const imageUrl = response.data.data?.url || response.data.url
      
      // Update profile with new avatar
      await updateProfile({ name: user?.name })
      
      return imageUrl
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải ảnh lên'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [user?.name, updateProfile])

  return {
    loading,
    error,
    updateProfile,
    changePassword,
    uploadAvatar
  }
}
