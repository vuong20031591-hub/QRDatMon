"use client"

import { Users, QrCode, MoreVertical, Pencil, Trash2, Download } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Table, Area } from "@/types"
import { cn } from "@/lib/utils"

const statusConfig = {
  available: { label: "Trống", color: "bg-green-500", variant: "success" as const },
  occupied: { label: "Đang sử dụng", color: "bg-red-500", variant: "destructive" as const },
  reserved: { label: "Đã đặt", color: "bg-yellow-500", variant: "warning" as const },
  cleaning: { label: "Đang dọn", color: "bg-blue-500", variant: "info" as const },
}

interface TableCardProps {
  table: Table
  areas: Area[]
  onEdit: (table: Table) => void
  onDelete: (table: Table) => void
  onStatusChange: (table: Table, status: Table["status"]) => void
  onDownloadQR: (table: Table) => void
}

export function TableCard({ table, areas, onEdit, onDelete, onStatusChange, onDownloadQR }: TableCardProps) {
  const status = statusConfig[table.status]
  const areaName = typeof table.area === "string" ? areas.find(a => a.id === table.area)?.name : table.area?.name

  return (
    <Card className={cn("relative overflow-hidden transition-all hover:shadow-lg", !table.isActive && "opacity-60")}>
      <div className={cn("absolute top-0 left-0 right-0 h-1", status.color)} />
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold">Bàn {table.tableNumber}</h3>
            <p className="text-sm text-muted-foreground">{areaName || "Chưa phân khu"}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(table)}><Pencil className="mr-2 h-4 w-4" />Chỉnh sửa</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownloadQR(table)}><Download className="mr-2 h-4 w-4" />Tải QR Code</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange(table, "available")}>Đánh dấu trống</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange(table, "cleaning")}>Đánh dấu đang dọn</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={() => onDelete(table)}><Trash2 className="mr-2 h-4 w-4" />Xóa</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{table.capacity} người</span>
          </div>
          {table.qrToken && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <QrCode className="h-4 w-4" />
              <span>QR sẵn sàng</span>
            </div>
          )}
        </div>
        
        <Badge variant={status.variant}>{status.label}</Badge>
      </CardContent>
    </Card>
  )
}
