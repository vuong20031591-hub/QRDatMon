"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Power, PowerOff, BarChart3 } from "lucide-react"
import { discountTypeLabels } from "../schemas/promotion.schema"
import type { Promotion } from "@/types"

interface PromotionTableProps {
  promotions: Promotion[]
  onEdit: (promotion: Promotion) => void
  onDeactivate: (promotion: Promotion) => void
  onReactivate: (promotion: Promotion) => void
  onViewUsage: (promotion: Promotion) => void
  isLoading?: boolean
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount)
}

function getPromotionStatus(promotion: Promotion): { label: string; variant: "default" | "secondary" | "destructive" | "outline" } {
  const now = new Date()
  const startDate = new Date(promotion.startDate)
  const endDate = new Date(promotion.endDate)

  if (!promotion.isActive) {
    return { label: "Ngừng hoạt động", variant: "secondary" }
  }
  if (now < startDate) {
    return { label: "Chưa bắt đầu", variant: "outline" }
  }
  if (now > endDate) {
    return { label: "Đã hết hạn", variant: "destructive" }
  }
  return { label: "Đang hoạt động", variant: "default" }
}

export function PromotionTable({ 
  promotions, 
  onEdit, 
  onDeactivate, 
  onReactivate, 
  onViewUsage,
  isLoading 
}: PromotionTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (promotions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Không có khuyến mãi nào
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã</TableHead>
            <TableHead>Tên</TableHead>
            <TableHead>Giảm giá</TableHead>
            <TableHead>Thời gian</TableHead>
            <TableHead className="text-center">Đã dùng</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {promotions.map((promo) => {
            const status = getPromotionStatus(promo)
            const discountDisplay = promo.discountType === "percent"
              ? `${promo.discountValue}%`
              : formatCurrency(promo.discountValue)
            
            return (
              <TableRow key={promo.id}>
                <TableCell className="font-mono font-medium">{promo.code}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{promo.name}</div>
                    {promo.description && (
                      <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {promo.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{discountDisplay}</div>
                    <div className="text-sm text-muted-foreground">
                      {discountTypeLabels[promo.discountType]}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <div className="text-sm">
                    <div>{new Date(promo.startDate).toLocaleDateString("vi-VN")}</div>
                    <div className="text-muted-foreground">
                      → {new Date(promo.endDate).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className="font-medium">{promo.usedCount}</span>
                  {promo.usageLimit && (
                    <span className="text-muted-foreground">/{promo.usageLimit}</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(promo)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onViewUsage(promo)}>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Xem thống kê
                      </DropdownMenuItem>
                      {promo.isActive ? (
                        <DropdownMenuItem 
                          onClick={() => onDeactivate(promo)}
                          className="text-destructive"
                        >
                          <PowerOff className="mr-2 h-4 w-4" />
                          Ngừng hoạt động
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => onReactivate(promo)}>
                          <Power className="mr-2 h-4 w-4" />
                          Kích hoạt lại
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
