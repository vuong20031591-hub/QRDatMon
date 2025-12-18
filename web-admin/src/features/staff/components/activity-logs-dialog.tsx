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
import { Badge } from "@/components/ui/badge"
import { useActivityLogs } from "../hooks/use-staff"
import type { Staff, User } from "@/types"

interface StaffWithUser extends Staff {
  user?: User
}

interface ActivityLogsDialogProps {
  staff: StaffWithUser | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const actionLabels: Record<string, string> = {
  create: "Tạo mới",
  update: "Cập nhật",
  delete: "Xóa",
  login: "Đăng nhập",
  logout: "Đăng xuất",
  status_change: "Đổi trạng thái",
}

const resourceLabels: Record<string, string> = {
  order: "Đơn hàng",
  menu: "Món ăn",
  table: "Bàn",
  bill: "Hóa đơn",
  staff: "Nhân viên",
  promotion: "Khuyến mãi",
}

export function ActivityLogsDialog({ staff, open, onOpenChange }: ActivityLogsDialogProps) {
  const { logs, loading } = useActivityLogs(staff?.id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Nhật ký hoạt động - {staff?.user?.name || staff?.employeeCode}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Không có nhật ký hoạt động
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Hành động</TableHead>
                  <TableHead>Đối tượng</TableHead>
                  <TableHead>Chi tiết</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("vi-VN")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {actionLabels[log.action] || log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {resourceLabels[log.resource] || log.resource}
                      {log.resourceId && (
                        <span className="text-muted-foreground ml-1">
                          #{log.resourceId.slice(-6)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {log.details ? JSON.stringify(log.details) : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
