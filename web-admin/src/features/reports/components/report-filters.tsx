/**
 * Report Filters Component
 * Date range and grouping filters for reports
 */

"use client"

import { Calendar, Download } from "lucide-react"
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
import type { ReportFilters } from "@/types/report"

interface ReportFiltersComponentProps {
  filters: ReportFilters
  onUpdateFilters: (filters: Partial<ReportFilters>) => void
  onExport?: (format: 'pdf' | 'excel') => void
  showGroupBy?: boolean
}

export function ReportFiltersComponent({ 
  filters, 
  onUpdateFilters, 
  onExport,
  showGroupBy = true
}: ReportFiltersComponentProps) {
  // Quick date presets
  const setDatePreset = (preset: 'today' | 'week' | 'month' | 'year') => {
    const today = new Date()
    let startDate: Date
    
    switch (preset) {
      case 'today':
        startDate = today
        break
      case 'week':
        startDate = new Date(today)
        startDate.setDate(today.getDate() - 7)
        break
      case 'month':
        startDate = new Date(today)
        startDate.setMonth(today.getMonth() - 1)
        break
      case 'year':
        startDate = new Date(today)
        startDate.setFullYear(today.getFullYear() - 1)
        break
    }
    
    onUpdateFilters({
      startDate: startDate.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {/* Quick Presets */}
        <div className="space-y-2">
          <Label>Khoảng thời gian</Label>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setDatePreset('today')}
            >
              Hôm nay
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setDatePreset('week')}
            >
              7 ngày
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setDatePreset('month')}
            >
              30 ngày
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setDatePreset('year')}
            >
              1 năm
            </Button>
          </div>
        </div>

        {/* Custom Date Range */}
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

        {/* Group By */}
        {showGroupBy && (
          <div className="space-y-2">
            <Label>Nhóm theo</Label>
            <Select
              value={filters.groupBy || "day"}
              onValueChange={(value) => onUpdateFilters({ groupBy: value as 'day' | 'week' | 'month' })}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Ngày</SelectItem>
                <SelectItem value="week">Tuần</SelectItem>
                <SelectItem value="month">Tháng</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Export */}
        {onExport && (
          <div className="space-y-2">
            <Label>Xuất báo cáo</Label>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onExport('pdf')}
              >
                <Download className="h-4 w-4 mr-1" />
                PDF
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onExport('excel')}
              >
                <Download className="h-4 w-4 mr-1" />
                Excel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
