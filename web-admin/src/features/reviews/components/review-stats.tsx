/**
 * Review Stats Component
 * Displays average ratings and distribution
 */

"use client"

import { Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { ReviewStats } from "@/types/review"

interface ReviewStatsCardProps {
  stats: ReviewStats | null
  loading: boolean
}

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`h-5 w-5 ${
          star <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ))}
  </div>
)

export function ReviewStatsCard({ stats, loading }: ReviewStatsCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Thống kê đánh giá</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Thống kê đánh giá</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Chưa có dữ liệu</p>
        </CardContent>
      </Card>
    )
  }

  const maxCount = Math.max(...(stats.ratingDistribution?.map(d => d.count) || [1]))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thống kê đánh giá</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Rating */}
        <div className="text-center">
          <div className="text-5xl font-bold">{stats.avgOverallRating?.toFixed(1) || '0.0'}</div>
          <div className="flex justify-center mt-2">
            <StarRating rating={stats.avgOverallRating || 0} />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {stats.totalReviews || 0} đánh giá
          </p>
        </div>

        {/* Category Ratings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Món ăn</span>
            <div className="flex items-center gap-2">
              <StarRating rating={stats.avgFoodRating || 0} />
              <span className="text-sm font-medium w-8">{stats.avgFoodRating?.toFixed(1) || '0.0'}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Phục vụ</span>
            <div className="flex items-center gap-2">
              <StarRating rating={stats.avgServiceRating || 0} />
              <span className="text-sm font-medium w-8">{stats.avgServiceRating?.toFixed(1) || '0.0'}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Không gian</span>
            <div className="flex items-center gap-2">
              <StarRating rating={stats.avgAmbianceRating || 0} />
              <span className="text-sm font-medium w-8">{stats.avgAmbianceRating?.toFixed(1) || '0.0'}</span>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        {stats.ratingDistribution && stats.ratingDistribution.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Phân bố đánh giá</p>
            {[5, 4, 3, 2, 1].map((rating) => {
              const dist = stats.ratingDistribution?.find(d => d.rating === rating)
              const count = dist?.count || 0
              const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0
              
              return (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm w-4">{rating}</span>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Progress value={percentage} className="flex-1 h-2" />
                  <span className="text-sm text-muted-foreground w-8">{count}</span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
