/**
 * Review Response Form Component
 * Form to respond to customer reviews
 */

"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { reviewResponseSchema, type ReviewResponseFormValues } from "../schemas/review.schema"
import type { Review } from "@/types/review"

interface ReviewResponseFormProps {
  review: Review
  onSubmit: (data: ReviewResponseFormValues) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function ReviewResponseForm({ review, onSubmit, onCancel, isLoading }: ReviewResponseFormProps) {
  const form = useForm<ReviewResponseFormValues>({
    resolver: zodResolver(reviewResponseSchema),
    defaultValues: {
      response: "",
    },
  })

  const handleSubmit = async (data: ReviewResponseFormValues) => {
    await onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Review Summary */}
        <div className="p-4 bg-muted rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">
              {review.isAnonymous ? "Khách ẩn danh" : review.user.name || review.user.email}
            </span>
            <Badge variant="outline" className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {review.averageRating.toFixed(1)}
            </Badge>
          </div>
          {review.comment && (
            <p className="text-sm text-muted-foreground">{review.comment}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {new Date(review.createdAt).toLocaleDateString('vi-VN')}
          </p>
        </div>

        <FormField
          control={form.control}
          name="response"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phản hồi của bạn</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Nhập phản hồi cho khách hàng..."
                  className="resize-none min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Đang gửi..." : "Gửi phản hồi"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
