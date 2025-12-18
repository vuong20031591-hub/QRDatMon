"use client"

import { useState } from "react"
import { DollarSign, TrendingUp, Users, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import {
  RevenueChart,
  SalesReportComponent,
  StaffReportComponent,
  ReportFiltersComponent,
  useRevenueReport,
  useSalesReport,
  useStaffReport,
} from "@/features/reports"
import type { ReportFilters, ReportType } from "@/types/report"
import {
  exportRevenuePDF,
  exportRevenueExcel,
  exportSalesPDF,
  exportSalesExcel,
  exportStaffPDF,
  exportStaffExcel,
} from "@/lib/utils/export-report"

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportType>('revenue')
  const [filters, setFilters] = useState<ReportFilters>({
    groupBy: 'day'
  })

  const { report: revenueReport, loading: revenueLoading, fetchReport: fetchRevenue } = useRevenueReport()
  const { report: salesReport, loading: salesLoading, fetchReport: fetchSales } = useSalesReport()
  const { report: staffReport, loading: staffLoading, fetchReport: fetchStaff } = useStaffReport()

  const handleUpdateFilters = (newFilters: Partial<ReportFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    
    // Refetch based on active tab
    switch (activeTab) {
      case 'revenue':
        fetchRevenue(updatedFilters)
        break
      case 'sales':
        fetchSales(updatedFilters)
        break
      case 'staff':
        fetchStaff(updatedFilters)
        break
    }
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as ReportType)
    
    // Fetch data for the new tab
    switch (tab) {
      case 'revenue':
        fetchRevenue(filters)
        break
      case 'sales':
        fetchSales(filters)
        break
      case 'staff':
        fetchStaff(filters)
        break
    }
  }

  const handleExport = (format: 'pdf' | 'excel') => {
    try {
      const exportFilters = {
        startDate: filters.startDate,
        endDate: filters.endDate,
      }

      switch (activeTab) {
        case 'revenue':
          if (!revenueReport) {
            toast.error("Không có dữ liệu để xuất")
            return
          }
          if (format === 'pdf') {
            exportRevenuePDF(revenueReport, exportFilters)
          } else {
            exportRevenueExcel(revenueReport, exportFilters)
          }
          break
        case 'sales':
          if (!salesReport) {
            toast.error("Không có dữ liệu để xuất")
            return
          }
          if (format === 'pdf') {
            exportSalesPDF(salesReport, exportFilters)
          } else {
            exportSalesExcel(salesReport, exportFilters)
          }
          break
        case 'staff':
          if (!staffReport) {
            toast.error("Không có dữ liệu để xuất")
            return
          }
          if (format === 'pdf') {
            exportStaffPDF(staffReport, exportFilters)
          } else {
            exportStaffExcel(staffReport, exportFilters)
          }
          break
      }
      
      toast.success(`Đã xuất báo cáo ${format.toUpperCase()} thành công`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error(`Lỗi khi xuất báo cáo: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleRefresh = () => {
    switch (activeTab) {
      case 'revenue':
        fetchRevenue(filters)
        break
      case 'sales':
        fetchSales(filters)
        break
      case 'staff':
        fetchStaff(filters)
        break
    }
    toast.success("Đã làm mới dữ liệu")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Báo cáo & Thống kê</h1>
          <p className="text-muted-foreground">
            Phân tích doanh thu, bán hàng và hiệu suất nhân viên
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Làm mới
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportFiltersComponent
            filters={filters}
            onUpdateFilters={handleUpdateFilters}
            onExport={handleExport}
            showGroupBy={activeTab === 'revenue' || activeTab === 'sales'}
          />
        </CardContent>
      </Card>

      {/* Report Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Doanh thu
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Bán hàng
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Nhân viên
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="mt-6">
          <RevenueChart report={revenueReport} loading={revenueLoading} />
        </TabsContent>

        <TabsContent value="sales" className="mt-6">
          <SalesReportComponent report={salesReport} loading={salesLoading} />
        </TabsContent>

        <TabsContent value="staff" className="mt-6">
          <StaffReportComponent report={staffReport} loading={staffLoading} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
