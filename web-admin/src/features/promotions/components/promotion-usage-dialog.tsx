"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { usePromotionUsage } from "../hooks/use-promotions"
import type { Promotion } from "@/types"

interface PromotionUsageDialogProps {
  promotion: Promotion | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount)
}

export function PromotionUsageDialog({ promotion, open, onOpenChange }: PromotionUsageDialogProps) {
  const { usage, stats, loading } = usePromotionUsage(promotion?.id)

  if (!promotion) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Thống kê sử dụng - {promotion.code}
          </DialogTitle>
        </DialogHeader>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{promotion.usedCount}</div>
              <div className="text-sm text-muted-foreground">Lượt sử dụng</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {promotion.usageLimit ? `${promotion.usageLimit - promotion.usedCount}` : "∞"}
              </div>
              <div className="text-sm text-muted-foreground">Còn lại</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {stats ? formatCurrency(stats.totalRevenue) : "-"}
              </div>
              <div className="text-sm text-muted-foreground">Doanh thu tác động</div>
            </CardContent>
          </Card>
        </div>

        {/* Usage History */}
        <div className="space-y-2">
          <h4 className="font-medium">Lịch sử sử dụng</h4>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : usage.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có lượt sử dụng nào
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead className="text-right">Giá trị đơn</TableHead>
                    <TableHead className="text-right">Giảm giá</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usage.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(item.usedAt).toLocaleString("vi-VN")}
                      </TableCell>
                      <TableCell>{item.userName || "Khách"}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.orderAmount)}
                      </TableCell>
                      <TableCell className="text-right text-destructive">
                        -{formatCurrency(item.discountAmount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
