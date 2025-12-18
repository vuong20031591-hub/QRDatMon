/**
 * Reviews Hooks - Data fetching and mutations
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import apiClient from "@/lib/api/client"
import type { 
  Review, 
  ReviewFilters, 
  ReviewPagination,
  ReviewStats
} from "@/types/review"

interface CreateReviewData {
  foodRating: number
  serviceRating: number
  ambianceRating: number
  comment?: string
  isAnonymous?: boolean
  orderId?: string
  billId?: string
  itemReviews?: { menuItem: string; rating: number; comment?: string }[]
}

interface UpdateReviewData {
  foodRating?: number
  serviceRating?: number
  ambianceRating?: number
  comment?: string
  isAnonymous?: boolean
  itemReviews?: { menuItem: string; rating: number; comment?: string }[]
}

interface UseReviewsReturn {
  reviews: Review[]
  pagination: ReviewPagination | null
  loading: boolean
  error: string | null
  filters: ReviewFilters
  fetchReviews: () => Promise<void>
  getReviewById: (id: string) => Promise<Review>
  createReview: (data: CreateReviewData) => Promise<Review>
  updateReview: (id: string, data: UpdateReviewData) => Promise<Review>
  deleteReview: (id: string) => Promise<void>
  updateFilters: (newFilters: Partial<ReviewFilters>) => void
  respondToReview: (reviewId: string, response: string) => Promise<void>
  setPage: (page: number) => void
}

export function useReviews(): UseReviewsReturn {
  const [reviews, setReviews] = useState<Review[]>([])
  const [pagination, setPagination] = useState<ReviewPagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<ReviewFilters>({
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const [page, setPage] = useState(1)

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', '20')
      
      if (filters.minRating) params.append('minRating', filters.minRating.toString())
      if (filters.maxRating) params.append('maxRating', filters.maxRating.toString())
      if (filters.menuItemId) params.append('menuItemId', filters.menuItemId)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.sortBy) params.append('sortBy', filters.sortBy)
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)

      const response = await apiClient.get(`/reviews?${params.toString()}`)
      
      // API returns: { success, message, data: [...reviews], meta: { pagination } }
      const rawReviews = response.data.data || []
      const paginationData = response.data.meta?.pagination || null
      
      // Transform API response to match frontend types
      const transformedReviews = rawReviews.map((review: Record<string, unknown>) => ({
        ...review,
        // Map ratings object to flat properties
        foodRating: (review.ratings as Record<string, number>)?.food ?? review.foodRating ?? 0,
        serviceRating: (review.ratings as Record<string, number>)?.service ?? review.serviceRating ?? 0,
        ambianceRating: (review.ratings as Record<string, number>)?.ambiance ?? review.ambianceRating ?? 0,
        averageRating: (review.ratings as Record<string, number>)?.average ?? review.averageRating ?? 0,
        // Ensure user object exists for non-anonymous reviews
        user: review.user || { id: '', name: 'Khách hàng' },
      }))
      
      setReviews(transformedReviews)
      setPagination(paginationData)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch reviews'
      setError(errorMessage)
      console.error('Failed to fetch reviews:', err)
    } finally {
      setLoading(false)
    }
  }, [page, filters])

  const updateFilters = useCallback((newFilters: Partial<ReviewFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setPage(1)
  }, [])

  const respondToReview = useCallback(async (reviewId: string, response: string) => {
    await apiClient.post(`/reviews/${reviewId}/respond`, { response })
    await fetchReviews()
  }, [fetchReviews])

  const getReviewById = useCallback(async (id: string): Promise<Review> => {
    const response = await apiClient.get(`/reviews/${id}`)
    const review = response.data.data?.review || response.data.data
    return {
      ...review,
      foodRating: review.ratings?.food ?? review.foodRating ?? 0,
      serviceRating: review.ratings?.service ?? review.serviceRating ?? 0,
      ambianceRating: review.ratings?.ambiance ?? review.ambianceRating ?? 0,
      averageRating: review.ratings?.average ?? review.averageRating ?? 0,
      user: review.user || { id: '', name: 'Khách hàng' },
    }
  }, [])

  const createReview = useCallback(async (data: CreateReviewData): Promise<Review> => {
    const response = await apiClient.post('/reviews', data)
    await fetchReviews()
    return response.data.data?.review || response.data.data
  }, [fetchReviews])

  const updateReview = useCallback(async (id: string, data: UpdateReviewData): Promise<Review> => {
    const response = await apiClient.put(`/reviews/${id}`, data)
    await fetchReviews()
    return response.data.data?.review || response.data.data
  }, [fetchReviews])

  const deleteReview = useCallback(async (id: string): Promise<void> => {
    await apiClient.delete(`/reviews/${id}`)
    await fetchReviews()
  }, [fetchReviews])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  return {
    reviews,
    pagination,
    loading,
    error,
    filters,
    fetchReviews,
    getReviewById,
    createReview,
    updateReview,
    deleteReview,
    updateFilters,
    respondToReview,
    setPage
  }
}

interface UseReviewStatsReturn {
  stats: ReviewStats | null
  loading: boolean
  fetchStats: () => Promise<void>
}

export function useReviewStats(): UseReviewStatsReturn {
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/reviews/stats')
      const rawStats = response.data.data?.stats || response.data.data
      
      // Transform API response to match frontend types
      const transformedStats: ReviewStats = {
        totalReviews: rawStats.totalReviews || 0,
        avgFoodRating: rawStats.averageRatings?.food ?? 0,
        avgServiceRating: rawStats.averageRatings?.service ?? 0,
        avgAmbianceRating: rawStats.averageRatings?.ambiance ?? 0,
        avgOverallRating: rawStats.averageRatings?.overall ?? 0,
        ratingDistribution: Object.entries(rawStats.distribution || {}).map(([rating, count]) => ({
          rating: parseInt(rating),
          count: count as number
        }))
      }
      
      setStats(transformedStats)
    } catch (err) {
      console.error('Failed to fetch review stats:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, fetchStats }
}
