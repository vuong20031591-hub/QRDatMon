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
import { MoreHorizontal, Pencil, UserX, UserCheck, History } from "lucide-react"
import { roleLabels } from "../schemas/staff.schema"
import type { Staff, User } from "@/types"

interface StaffWithUser extends Staff {
  user?: User
}

interface StaffTableProps {
  staff: StaffWithUser[]
  onEdit: (staff: StaffWithUser) => void
  onDeactivate: (staff: StaffWithUser) => void
  onActivate: (staff: StaffWithUser) => void
  onViewLogs: (staff: StaffWithUser) => void
  isLoading?: boolean
}

const roleBadgeColors: Record<string, string> = {
  admin: "bg-red-500 text-white",
  manager: "bg-blue-500 text-white",
  waiter: "bg-green-500 text-white",
  cashier: "bg-purple-500 text-white",
  kitchen: "bg-orange-500 text-white",
}

export function StaffTable({ 
  staff, 
  onEdit, 
  onDeactivate, 
  onActivate, 
  onViewLogs,
  isLoading 
}: StaffTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (staff.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Không có nhân viên nào
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã NV</TableHead>
            <TableHead>Tên</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Vai trò</TableHead>
            <TableHead>Ngày vào làm</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="font-medium">{s.employeeCode}</TableCell>
              <TableCell>{s.user?.name || "N/A"}</TableCell>
              <TableCell>{s.user?.email || "N/A"}</TableCell>
              <TableCell>
                <Badge className={roleBadgeColors[s.role] || "bg-gray-500 text-white"}>
                  {roleLabels[s.role] || s.role}
                </Badge>
              </TableCell>
              <TableCell>
                {s.hireDate ? new Date(s.hireDate).toLocaleDateString("vi-VN") : "N/A"}
              </TableCell>
              <TableCell>
                <Badge variant={s.isActive ? "default" : "secondary"}>
                  {s.isActive ? "Hoạt động" : "Ngừng hoạt động"}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(s)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onViewLogs(s)}>
                      <History className="mr-2 h-4 w-4" />
                      Xem nhật ký
                    </DropdownMenuItem>
                    {s.isActive ? (
                      <DropdownMenuItem 
                        onClick={() => onDeactivate(s)}
                        className="text-destructive"
                      >
                        <UserX className="mr-2 h-4 w-4" />
                        Vô hiệu hóa
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => onActivate(s)}>
                        <UserCheck className="mr-2 h-4 w-4" />
                        Kích hoạt
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
