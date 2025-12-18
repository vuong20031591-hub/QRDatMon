"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  createStaffSchema, 
  updateStaffSchema, 
  type StaffFormValues, 
  type UpdateStaffFormValues,
  roleLabels 
} from "../schemas/staff.schema"
import type { Staff, User } from "@/types"

interface StaffFormProps {
  staff?: Staff & { user?: User }
  onSubmit: (data: StaffFormValues | UpdateStaffFormValues) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function StaffForm({ staff, onSubmit, onCancel, isLoading }: StaffFormProps) {
  const isEditing = !!staff

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StaffFormValues>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: {
      email: "",
      name: "",
      phone: "",
      employeeCode: staff?.employeeCode || "",
      role: staff?.role || "waiter",
      hireDate: staff?.hireDate ? new Date(staff.hireDate).toISOString().split("T")[0] : "",
    },
  })

  const selectedRole = watch("role")

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {!isEditing && (
        <>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="email@example.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Tên nhân viên *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Nguyễn Văn A"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input
              id="phone"
              {...register("phone")}
              placeholder="0901234567"
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="employeeCode">Mã nhân viên *</Label>
        <Input
          id="employeeCode"
          {...register("employeeCode")}
          placeholder="VD: NV001"
          className="uppercase"
        />
        {errors.employeeCode && (
          <p className="text-sm text-destructive">{errors.employeeCode.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Vai trò *</Label>
        <Select
          value={selectedRole}
          onValueChange={(value) => setValue("role", value as StaffFormValues["role"])}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn vai trò" />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={4}>
            {Object.entries(roleLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.role && (
          <p className="text-sm text-destructive">{errors.role.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="hireDate">Ngày vào làm</Label>
        <Input
          id="hireDate"
          type="date"
          {...register("hireDate")}
        />
        {errors.hireDate && (
          <p className="text-sm text-destructive">{errors.hireDate.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Đang xử lý..." : isEditing ? "Cập nhật" : "Tạo mới"}
        </Button>
      </div>
    </form>
  )
}
