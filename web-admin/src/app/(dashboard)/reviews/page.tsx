"use client"

import { useState } from "react"
import { RefreshCw, MessageSquare, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import {
  ReviewList,
  ReviewStatsCard,
  ReviewResponseForm,
  ReviewFiltersComponent,
  useReviews,
  useReviewStats,
} from "@/features/reviews"
import type { Review } from "@/types/review"
import type { ReviewResponseFormValues } from "@/features/reviews/schemas/review.schema"

export default function ReviewsPage() {
  const { 
    reviews, 
    loading, 
    filters, 
    fetchReviews, 
    updateFilters, 
    respondToReview,
    updateReview,
    deleteReview 
  } = useReviews()
  const { stats, loading: statsLoading, fetchStats } = useReviewStats()

  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [responseDialogOpen, setResponseDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editForm, setEditForm] = useState({
    foodRating: 5,
    serviceRating: 5,
    ambianceRating: 5,
    comment: ""
  })

  const handleRespond = (review: Review) => {
    setSelectedReview(review)
    setResponseDialogOpen(true)
  }

  const handleView = (review: Review) => {
    setSelectedReview(review)
    setViewDialogOpen(true)
  }

  const handleDeleteClick = (review: Review) => {
    setSelectedReview(review)
    setDeleteDialogOpen(true)
  }

  const handleEdit = (review: Review) => {
    setSelectedReview(review)
    setEditForm({
      foodRating: review.foodRating,
      serviceRating: review.serviceRating,
      ambianceRating: review.ambianceRating,
      comment: review.comment || ""
    })
    setEditDialogOpen(true)
  }

  const handleEditSubmit = async () => {
    if (!selectedReview) return
    try {
      setIsSubmitting(true)
      await updateReview(selectedReview.id, editForm)
      toast.success("Đã cập nhật đánh giá")
      setEditDialogOpen(false)
      fetchStats()
    } catch {
      toast.error("Không thể cập nhật đánh giá")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedReview) return
    try {
      setIsSubmitting(true)
      await deleteReview(selectedReview.id)
      toast.success("Đã xóa đánh giá")
      setDeleteDialogOpen(false)
      fetchStats()
    } catch {
      toast.error("Không thể xóa đánh giá")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResponseSubmit = async (data: ReviewResponseFormValues) => {
    if (!selectedReview) return
    try {
      setIsSubmitting(true)
      await respondToReview(selectedReview.id, data.response)
      toast.success("Đã gửi phản hồi thành công")
      setResponseDialogOpen(false)
    } catch {
      toast.error("Không thể gửi phản hồi")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClearFilters = () => {
    updateFilters({
      minRating: undefined,
      maxRating: undefined,
      startDate: undefined,
      endDate: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
  }

  const handleRefresh = () => {
    fetchReviews()
    fetchStats()
    toast.success("Đã làm mới dữ liệu")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Đánh giá</h1>
          <p className="text-muted-foreground">
            Xem và phản hồi đánh giá từ khách hàng
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Làm mới
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Stats */}
        <div className="lg:col-span-1">
          <ReviewStatsCard stats={stats} loading={statsLoading} />
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Bộ lọc</CardTitle>
            </CardHeader>
            <CardContent>
              <ReviewFiltersComponent
                filters={filters}
                onUpdateFilters={updateFilters}
                onClearFilters={handleClearFilters}
              />
            </CardContent>
          </Card>

          {/* List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Danh sách đánh giá ({reviews.length})
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ReviewList
                reviews={reviews}
                loading={loading}
                onRespond={handleRespond}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Response Dialog */}
      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Phản hồi đánh giá</DialogTitle>
            <DialogDescription>
              Gửi phản hồi cho khách hàng về đánh giá của họ
            </DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <ReviewResponseForm
              review={selectedReview}
              onSubmit={handleResponseSubmit}
              onCancel={() => setResponseDialogOpen(false)}
              isLoading={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Detail Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi tiết đánh giá</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {selectedReview.isAnonymous ? "Khách ẩn danh" : selectedReview.user?.name || "Khách hàng"}
                </span>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {selectedReview.averageRating?.toFixed(1)}
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center p-2 bg-muted rounded">
                  <div className="font-medium">{selectedReview.foodRating}</div>
                  <div className="text-xs text-muted-foreground">Món ăn</div>
                </div>
                <div className="text-center p-2 bg-muted rounded">
                  <div className="font-medium">{selectedReview.serviceRating}</div>
                  <div className="text-xs text-muted-foreground">Phục vụ</div>
                </div>
                <div className="text-center p-2 bg-muted rounded">
                  <div className="font-medium">{selectedReview.ambianceRating}</div>
                  <div className="text-xs text-muted-foreground">Không gian</div>
                </div>
              </div>

              {selectedReview.comment && (
                <div>
                  <div className="text-sm font-medium mb-1">Nhận xét:</div>
                  <p className="text-sm text-muted-foreground">{selectedReview.comment}</p>
                </div>
              )}

              {selectedReview.itemReviews && selectedReview.itemReviews.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">Đánh giá món:</div>
                  <div className="space-y-1">
                    {selectedReview.itemReviews.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{item.menuItem?.name}</span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {item.rating}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                Ngày đánh giá: {new Date(selectedReview.createdAt).toLocaleString('vi-VN')}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa đánh giá</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin đánh giá
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="foodRating">Món ăn</Label>
                <Input
                  id="foodRating"
                  type="number"
                  min={1}
                  max={5}
                  value={editForm.foodRating}
                  onChange={(e) => setEditForm(prev => ({ ...prev, foodRating: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serviceRating">Phục vụ</Label>
                <Input
                  id="serviceRating"
                  type="number"
                  min={1}
                  max={5}
                  value={editForm.serviceRating}
                  onChange={(e) => setEditForm(prev => ({ ...prev, serviceRating: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ambianceRating">Không gian</Label>
                <Input
                  id="ambianceRating"
                  type="number"
                  min={1}
                  max={5}
                  value={editForm.ambianceRating}
                  onChange={(e) => setEditForm(prev => ({ ...prev, ambianceRating: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="comment">Nhận xét</Label>
              <Textarea
                id="comment"
                value={editForm.comment}
                onChange={(e) => setEditForm(prev => ({ ...prev, comment: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button onClick={handleEditSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa đánh giá</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm} 
              disabled={isSubmitting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isSubmitting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
