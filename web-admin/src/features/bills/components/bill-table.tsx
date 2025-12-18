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
import { MoreHorizontal, Eye, CreditCard, X, Printer } from "lucide-react"
import { billStatusLabels } from "../schemas/bill.schema"
import type { Bill, Table as TableType } from "@/types"

interface BillWithTable extends Omit<Bill, 'table'> {
  table?: TableType
}

interface BillTableProps {
  bills: BillWithTable[]
  onView: (bill: BillWithTable) => void
  onPayment: (bill: BillWithTable) => void
  onCancel: (bill: BillWithTable) => void
  onPrint: (bill: BillWithTable) => void
  isLoading?: boolean
}

const statusBadgeVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  open: "outline",
  requesting_payment: "default",
  paid: "secondary",
  cancelled: "destructive",
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount)
}

export function BillTable({ 
  bills, 
  onView, 
  onPayment, 
  onCancel, 
  onPrint,
  isLoading 
}: BillTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (bills.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Không có hóa đơn nào
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã HĐ</TableHead>
            <TableHead>Bàn</TableHead>
            <TableHead className="text-right">Tạm tính</TableHead>
            <TableHead className="text-right">Giảm giá</TableHead>
            <TableHead className="text-right">Tổng cộng</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Thời gian</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bills.map((bill) => {
            const tableName = typeof bill.table === "object" 
              ? bill.table?.tableNumber 
              : bill.table
            
            return (
              <TableRow key={bill.id}>
                <TableCell className="font-medium">{bill.billNumber}</TableCell>
                <TableCell>{tableName || "N/A"}</TableCell>
                <TableCell className="text-right">{formatCurrency(bill.subtotal)}</TableCell>
                <TableCell className="text-right text-destructive">
                  {bill.discountAmount > 0 ? `-${formatCurrency(bill.discountAmount)}` : "-"}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(bill.totalAmount)}
                </TableCell>
                <TableCell>
                  <Badge variant={statusBadgeVariants[bill.status] || "secondary"}>
                    {billStatusLabels[bill.status] || bill.status}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {new Date(bill.openedAt).toLocaleString("vi-VN")}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(bill)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Xem chi tiết
                      </DropdownMenuItem>
                      {bill.status === "open" || bill.status === "requesting_payment" ? (
                        <>
                          <DropdownMenuItem onClick={() => onPayment(bill)}>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Thanh toán
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onCancel(bill)}
                            className="text-destructive"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Hủy hóa đơn
                          </DropdownMenuItem>
                        </>
                      ) : null}
                      {bill.status === "paid" && (
                        <DropdownMenuItem onClick={() => onPrint(bill)}>
                          <Printer className="mr-2 h-4 w-4" />
                          In hóa đơn
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
