/**
 * Review List Component
 * Displays reviews with ratings and comments
 */

"use client"

import { Star, MessageSquare, User, Trash2, Eye, Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Review } from "@/types/review"

interface ReviewListProps {
  reviews: Review[]
  loading: boolean
  onRespond: (review: Review) => void
  onDelete?: (review: Review) => void
  onView?: (review: Review) => void
  onEdit?: (review: Review) => void
}

const StarRating = ({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) => {
  const sizeClass = size === "sm" ? "h-3 w-3" : "h-4 w-4"
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  )
}

const RatingBadge = ({ label, rating }: { label: string; rating: number }) => (
  <div className="flex items-center gap-2">
    <span className="text-xs text-muted-foreground">{label}:</span>
    <StarRating rating={rating} />
    <span className="text-xs font-medium">{rating.toFixed(1)}</span>
  </div>
)

export function ReviewList({ reviews, loading, onRespond, onDelete, onView, onEdit }: ReviewListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Chưa có đánh giá nào</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-4 pr-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {review.isAnonymous ? (
                        <User className="h-4 w-4" />
                      ) : (
                        review.user.name?.charAt(0) || "U"
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {review.isAnonymous ? "Khách ẩn danh" : review.user.name || review.user.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {review.averageRating.toFixed(1)}
                  </Badge>
                </div>
              </div>

              {/* Ratings */}
              <div className="flex flex-wrap gap-4 mt-3">
                <RatingBadge label="Món ăn" rating={review.foodRating} />
                <RatingBadge label="Phục vụ" rating={review.serviceRating} />
                <RatingBadge label="Không gian" rating={review.ambianceRating} />
              </div>

              {/* Comment */}
              {review.comment && (
                <p className="mt-3 text-sm">{review.comment}</p>
              )}

              {/* Item Reviews */}
              {review.itemReviews && review.itemReviews.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Đánh giá món:</p>
                  <div className="flex flex-wrap gap-2">
                    {review.itemReviews.map((item) => (
                      <Badge key={item.id} variant="secondary" className="flex items-center gap-1">
                        {item.menuItem.name}
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {item.rating}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Response */}
              {review.response && (
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">
                    Phản hồi từ nhà hàng • {review.respondedAt && new Date(review.respondedAt).toLocaleDateString('vi-VN')}
                  </p>
                  <p className="text-sm">{review.response}</p>
                </div>
              )}

              {/* Actions */}
              <div className="mt-3 flex justify-end gap-2">
                {onView && (
                  <Button variant="ghost" size="sm" onClick={() => onView(review)}>
                    <Eye className="h-4 w-4 mr-1" />
                    Chi tiết
                  </Button>
                )}
                {onEdit && (
                  <Button variant="outline" size="sm" onClick={() => onEdit(review)}>
                    <Pencil className="h-4 w-4 mr-1" />
                    Sửa
                  </Button>
                )}
                {!review.response && (
                  <Button variant="outline" size="sm" onClick={() => onRespond(review)}>
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Phản hồi
                  </Button>
                )}
                {onDelete && (
                  <Button variant="destructive" size="sm" onClick={() => onDelete(review)}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Xóa
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  )
}
