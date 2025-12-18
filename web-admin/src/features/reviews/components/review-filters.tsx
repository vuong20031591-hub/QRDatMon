/**
 * Review Filters Component
 * Filtering by rating, date, menu item
 */

"use client"

import { Star, Calendar, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { ReviewFilters } from "@/types/review"

interface ReviewFiltersComponentProps {
  filters: ReviewFilters
  onUpdateFilters: (filters: Partial<ReviewFilters>) => void
  onClearFilters: () => void
}

export function ReviewFiltersComponent({ 
  filters, 
  onUpdateFilters, 
  onClearFilters 
}: ReviewFiltersComponentProps) {
  const hasActiveFilters = filters.minRating || filters.maxRating || filters.startDate || filters.endDate

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {/* Rating Filter */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1">
            <Star className="h-4 w-4" />
            Đánh giá
          </Label>
          <Select
            value={filters.minRating?.toString() || "all"}
            onValueChange={(value) => {
              if (value === "all") {
                onUpdateFilters({ minRating: undefined, maxRating: undefined })
              } else {
                const rating = parseInt(value)
                onUpdateFilters({ minRating: rating, maxRating: rating })
              }
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="5">5 sao</SelectItem>
              <SelectItem value="4">4 sao</SelectItem>
              <SelectItem value="3">3 sao</SelectItem>
              <SelectItem value="2">2 sao</SelectItem>
              <SelectItem value="1">1 sao</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Từ ngày
          </Label>
          <Input
            type="date"
            value={filters.startDate || ""}
            onChange={(e) => onUpdateFilters({ startDate: e.target.value || undefined })}
            className="w-[150px]"
          />
        </div>

        <div className="space-y-2">
          <Label>Đến ngày</Label>
          <Input
            type="date"
            value={filters.endDate || ""}
            onChange={(e) => onUpdateFilters({ endDate: e.target.value || undefined })}
            className="w-[150px]"
          />
        </div>

        {/* Sort */}
        <div className="space-y-2">
          <Label>Sắp xếp</Label>
          <Select
            value={filters.sortBy || "createdAt"}
            onValueChange={(value) => onUpdateFilters({ sortBy: value as 'createdAt' | 'averageRating' })}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Mới nhất</SelectItem>
              <SelectItem value="averageRating">Đánh giá cao</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Thứ tự</Label>
          <Select
            value={filters.sortOrder || "desc"}
            onValueChange={(value) => onUpdateFilters({ sortOrder: value as 'asc' | 'desc' })}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Giảm dần</SelectItem>
              <SelectItem value="asc">Tăng dần</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Đang lọc:</span>
          {filters.minRating && (
            <Badge variant="secondary">
              {filters.minRating} sao
            </Badge>
          )}
          {filters.startDate && (
            <Badge variant="secondary">
              Từ {new Date(filters.startDate).toLocaleDateString('vi-VN')}
            </Badge>
          )}
          {filters.endDate && (
            <Badge variant="secondary">
              Đến {new Date(filters.endDate).toLocaleDateString('vi-VN')}
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="h-4 w-4 mr-1" />
            Xóa bộ lọc
          </Button>
        </div>
      )}
    </div>
  )
}
