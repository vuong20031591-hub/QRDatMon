"use client"

import { useState, useEffect } from "react"
import { Plus, MapPin, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { TableCard } from "@/features/tables/components/table-card"
import { TableForm } from "@/features/tables/components/table-form"
import { AreaForm } from "@/features/tables/components/area-form"
import { QRCodeDialog } from "@/features/tables/components/qr-code-dialog"
import { useTables, useAreas } from "@/features/tables/hooks/use-tables"
import type { Table, Area } from "@/types"
import type { TableFormValues, AreaFormValues } from "@/features/tables/schemas/table.schema"

const statusCounts = (tables: Table[]) => ({
  available: tables.filter(t => t.status === "available").length,
  occupied: tables.filter(t => t.status === "occupied").length,
  reserved: tables.filter(t => t.status === "reserved").length,
  cleaning: tables.filter(t => t.status === "cleaning").length,
})

export default function TablesPage() {
  const [mounted, setMounted] = useState(false)
  const { tables, loading, createTable, updateTable, deleteTable, updateStatus, generateQR } = useTables()
  const { areas, createArea, updateArea, deleteArea } = useAreas()
  
  const [tableFormOpen, setTableFormOpen] = useState(false)
  const [areaFormOpen, setAreaFormOpen] = useState(false)
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [selectedArea, setSelectedArea] = useState<Area | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteAreaDialogOpen, setDeleteAreaDialogOpen] = useState(false)
  const [tableToDelete, setTableToDelete] = useState<Table | null>(null)
  const [areaToDelete, setAreaToDelete] = useState<Area | null>(null)
  const [filterArea, setFilterArea] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredTables = tables.filter(table => {
    const areaMatch = filterArea === "all" || (typeof table.area === "string" ? table.area : table.area?.id) === filterArea
    const statusMatch = filterStatus === "all" || table.status === filterStatus
    return areaMatch && statusMatch
  })

  const counts = statusCounts(tables)

  const handleCreateTable = async (data: TableFormValues) => {
    setFormLoading(true)
    try { await createTable(data) } finally { setFormLoading(false) }
  }

  const handleUpdateTable = async (data: TableFormValues) => {
    if (!selectedTable) return
    setFormLoading(true)
    try { await updateTable(selectedTable.id, data) } finally { setFormLoading(false) }
  }

  const handleDeleteTable = async () => {
    if (!tableToDelete) return
    setFormLoading(true)
    try {
      await deleteTable(tableToDelete.id)
      setDeleteDialogOpen(false)
      setTableToDelete(null)
    } finally { setFormLoading(false) }
  }

  const handleCreateArea = async (data: AreaFormValues) => {
    setFormLoading(true)
    try { await createArea(data) } finally { setFormLoading(false) }
  }

  const handleUpdateArea = async (data: AreaFormValues) => {
    if (!selectedArea) return
    setFormLoading(true)
    try { await updateArea(selectedArea.id, data) } finally { setFormLoading(false) }
  }

  const handleDeleteArea = async () => {
    if (!areaToDelete) return
    setFormLoading(true)
    try {
      await deleteArea(areaToDelete.id)
      setDeleteAreaDialogOpen(false)
      setAreaToDelete(null)
    } finally { setFormLoading(false) }
  }

  const handleStatusChange = async (table: Table, status: Table["status"]) => {
    await updateStatus(table.id, status)
  }

  const handleDownloadQR = (table: Table) => {
    setSelectedTable(table)
    setQrDialogOpen(true)
  }

  const handleRegenerateQR = async (table: Table) => {
    await generateQR(table.id, true)
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quản lý bàn</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setSelectedArea(null); setAreaFormOpen(true) }}>
            <MapPin className="mr-2 h-4 w-4" />Thêm khu vực
          </Button>
          <Button onClick={() => { setSelectedTable(null); setTableFormOpen(true) }}>
            <Plus className="mr-2 h-4 w-4" />Thêm bàn
          </Button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{counts.available}</p><p className="text-sm text-muted-foreground">Trống</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-red-600">{counts.occupied}</p><p className="text-sm text-muted-foreground">Đang sử dụng</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-yellow-600">{counts.reserved}</p><p className="text-sm text-muted-foreground">Đã đặt</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-600">{counts.cleaning}</p><p className="text-sm text-muted-foreground">Đang dọn</p></CardContent></Card>
      </div>

      {/* Areas Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Khu vực ({areas.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {areas.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Chưa có khu vực nào</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {areas.map(area => (
                <Badge key={area.id} variant="outline" className="px-3 py-2 text-sm flex items-center gap-2 bg-muted/50">
                  <span className="text-foreground font-medium">{area.name}</span>
                  {area.floor && <span className="text-muted-foreground">(Tầng {area.floor})</span>}
                  <Button variant="ghost" size="icon" className="h-5 w-5 ml-1" onClick={() => { setSelectedArea(area); setAreaFormOpen(true) }}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive hover:text-destructive" onClick={() => { setAreaToDelete(area); setDeleteAreaDialogOpen(true) }}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle>Danh sách bàn ({filteredTables.length})</CardTitle>
            <div className="flex gap-2">
              <Select value={filterArea} onValueChange={setFilterArea}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Lọc khu vực" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả khu vực</SelectItem>
                  {areas.map(area => <SelectItem key={area.id} value={area.id}>{area.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Lọc trạng thái" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="available">Trống</SelectItem>
                  <SelectItem value="occupied">Đang sử dụng</SelectItem>
                  <SelectItem value="reserved">Đã đặt</SelectItem>
                  <SelectItem value="cleaning">Đang dọn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : filteredTables.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Không có bàn nào</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredTables.map(table => (
                <TableCard
                  key={table.id}
                  table={table}
                  areas={areas}
                  onEdit={(t) => { setSelectedTable(t); setTableFormOpen(true) }}
                  onDelete={(t) => { setTableToDelete(t); setDeleteDialogOpen(true) }}
                  onStatusChange={handleStatusChange}
                  onDownloadQR={handleDownloadQR}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <TableForm open={tableFormOpen} onOpenChange={setTableFormOpen} table={selectedTable} areas={areas} onSubmit={selectedTable ? handleUpdateTable : handleCreateTable} loading={formLoading} />
      <AreaForm open={areaFormOpen} onOpenChange={setAreaFormOpen} area={selectedArea} onSubmit={selectedArea ? handleUpdateArea : handleCreateArea} loading={formLoading} />
      <QRCodeDialog open={qrDialogOpen} onOpenChange={setQrDialogOpen} table={selectedTable} onRegenerate={handleRegenerateQR} />
      <ConfirmDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} title="Xác nhận xóa" description={`Bạn có chắc muốn xóa bàn "${tableToDelete?.tableNumber}"? QR Code của bàn này sẽ không còn hoạt động.`} variant="destructive" confirmText="Xóa" onConfirm={handleDeleteTable} loading={formLoading} />
      <ConfirmDialog open={deleteAreaDialogOpen} onOpenChange={setDeleteAreaDialogOpen} title="Xác nhận xóa khu vực" description={`Bạn có chắc muốn xóa khu vực "${areaToDelete?.name}"? Các bàn trong khu vực này sẽ không bị xóa.`} variant="destructive" confirmText="Xóa" onConfirm={handleDeleteArea} loading={formLoading} />
    </div>
  )
}
