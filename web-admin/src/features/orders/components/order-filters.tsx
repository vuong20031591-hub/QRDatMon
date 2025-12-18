"use client"

import { useState } from "react"
import { CalendarIcon, Filter, X } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import type { OrderFilters, OrderStatus } from "@/types/order"
import type { Table } from "@/types"

interface OrderFiltersProps {
  filters: OrderFilters
  tables: Table[]
  onFilterChange: (filters: Partial<OrderFilters>) => void
  onClearFilters: () => void
}

const statusOptions: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "pending", label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "preparing", label: "Đang chuẩn bị" },
  { value: "ready", label: "Sẵn sàng" },
  { value: "served", label: "Đã phục vụ" },
  { value: "cancelled", label: "Đã hủy" },
]

export function OrderFiltersComponent({ filters, tables, onFilterChange, onClearFilters }: OrderFiltersProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(
    filters.startDate ? new Date(filters.startDate) : undefined
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    filters.endDate ? new Date(filters.endDate) : undefined
  )

  const hasActiveFilters = filters.status || filters.tableId || filters.startDate || filters.endDate

  const handleStatusChange = (value: string) => {
    onFilterChange({ status: value === "all" ? undefined : value as OrderStatus })
  }

  const handleTableChange = (value: string) => {
    onFilterChange({ tableId: value === "all" ? undefined : value })
  }

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date)
    onFilterChange({ startDate: date ? date.toISOString() : undefined })
  }

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date)
    onFilterChange({ endDate: date ? date.toISOString() : undefined })
  }

  const handleClear = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    onClearFilters()
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Filter className="h-4 w-4 text-muted-foreground" />
      
      {/* Status Filter */}
      <Select value={filters.status || "all"} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Table Filter */}
      <Select value={filters.tableId || "all"} onValueChange={handleTableChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Chọn bàn" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả bàn</SelectItem>
          {tables.map(table => (
            <SelectItem key={table.id} value={table.id}>
              Bàn {table.tableNumber}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Start Date */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {startDate ? format(startDate, "dd/MM/yyyy") : "Từ ngày"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={handleStartDateChange}
            locale={vi}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* End Date */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {endDate ? format(endDate, "dd/MM/yyyy") : "Đến ngày"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={endDate}
            onSelect={handleEndDateChange}
            locale={vi}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={handleClear} className="gap-1">
          <X className="h-4 w-4" />
          Xóa bộ lọc
        </Button>
      )}
    </div>
  )
}
