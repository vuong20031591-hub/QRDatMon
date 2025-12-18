"use client"

import { useState } from "react"
import { Plus, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { StaffTable } from "@/features/staff/components/staff-table"
import { StaffForm } from "@/features/staff/components/staff-form"
import { ActivityLogsDialog } from "@/features/staff/components/activity-logs-dialog"
import { useStaff } from "@/features/staff/hooks/use-staff"
import { roleLabels, type StaffFormValues, type UpdateStaffFormValues } from "@/features/staff/schemas/staff.schema"
import type { Staff, User } from "@/types"

interface StaffWithUser extends Staff {
  user?: User
}

export default function StaffPage() {
  const [roleFilter, setRoleFilter] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  
  const { staff, loading, createStaff, updateStaff, deactivateStaff, activateStaff } = useStaff({
    role: roleFilter || undefined,
    isActive: statusFilter ? statusFilter === "active" : undefined,
    search: searchQuery || undefined,
  })

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<StaffWithUser | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    staff: StaffWithUser | null
    action: "deactivate" | "activate"
  }>({ open: false, staff: null, action: "deactivate" })

  const [logsDialog, setLogsDialog] = useState<{
    open: boolean
    staff: StaffWithUser | null
  }>({ open: false, staff: null })

  const handleCreate = () => {
    setEditingStaff(null)
    setIsFormOpen(true)
  }

  const handleEdit = (s: StaffWithUser) => {
    setEditingStaff(s)
    setIsFormOpen(true)
  }

  const handleSubmit = async (data: StaffFormValues | UpdateStaffFormValues) => {
    try {
      setIsSubmitting(true)
      if (editingStaff) {
        await updateStaff(editingStaff.id, data)
        toast.success("Cập nhật nhân viên thành công")
      } else {
        await createStaff(data)
        toast.success("Tạo nhân viên thành công")
      }
      setIsFormOpen(false)
      setEditingStaff(null)
    } catch {
      toast.error(editingStaff ? "Không thể cập nhật nhân viên" : "Không thể tạo nhân viên")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeactivate = (s: StaffWithUser) => {
    setConfirmDialog({ open: true, staff: s, action: "deactivate" })
  }

  const handleActivate = (s: StaffWithUser) => {
    setConfirmDialog({ open: true, staff: s, action: "activate" })
  }

  const handleConfirmAction = async () => {
    if (!confirmDialog.staff) return
    try {
      if (confirmDialog.action === "deactivate") {
        await deactivateStaff(confirmDialog.staff.id)
        toast.success("Đã vô hiệu hóa nhân viên")
      } else {
        await activateStaff(confirmDialog.staff.id)
        toast.success("Đã kích hoạt nhân viên")
      }
    } catch {
      toast.error("Không thể thực hiện thao tác")
    } finally {
      setConfirmDialog({ open: false, staff: null, action: "deactivate" })
    }
  }

  const handleViewLogs = (s: StaffWithUser) => {
    setLogsDialog({ open: true, staff: s })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý nhân viên</h1>
          <p className="text-muted-foreground">
            Quản lý tài khoản và phân quyền nhân viên
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm nhân viên
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên, email, mã NV..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter || "all"} onValueChange={(v) => setRoleFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả vai trò</SelectItem>
            {Object.entries(roleLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="active">Hoạt động</SelectItem>
            <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Staff Table */}
      <StaffTable
        staff={staff}
        onEdit={handleEdit}
        onDeactivate={handleDeactivate}
        onActivate={handleActivate}
        onViewLogs={handleViewLogs}
        isLoading={loading}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingStaff ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
            </DialogTitle>
          </DialogHeader>
          <StaffForm
            staff={editingStaff || undefined}
            onSubmit={handleSubmit}
            onCancel={() => setIsFormOpen(false)}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <AlertDialog 
        open={confirmDialog.open} 
        onOpenChange={(open: boolean) => setConfirmDialog(prev => ({ ...prev, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === "deactivate" 
                ? "Vô hiệu hóa nhân viên?" 
                : "Kích hoạt nhân viên?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === "deactivate"
                ? `Nhân viên ${confirmDialog.staff?.user?.name || confirmDialog.staff?.employeeCode} sẽ không thể đăng nhập vào hệ thống. Dữ liệu lịch sử vẫn được giữ lại.`
                : `Nhân viên ${confirmDialog.staff?.user?.name || confirmDialog.staff?.employeeCode} sẽ có thể đăng nhập và sử dụng hệ thống.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>
              {confirmDialog.action === "deactivate" ? "Vô hiệu hóa" : "Kích hoạt"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Activity Logs Dialog */}
      <ActivityLogsDialog
        staff={logsDialog.staff}
        open={logsDialog.open}
        onOpenChange={(open) => setLogsDialog(prev => ({ ...prev, open }))}
      />
    </div>
  )
}
