import { z } from "zod"

// Schema cho tạo mới staff (nhập email + tên để tạo user mới)
export const createStaffSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  name: z.string().min(1, "Vui lòng nhập tên nhân viên"),
  phone: z.string().optional(),
  employeeCode: z.string()
    .min(2, "Mã nhân viên tối thiểu 2 ký tự")
    .max(20, "Mã nhân viên tối đa 20 ký tự")
    .transform(val => val.toUpperCase()),
  role: z.enum(["waiter", "cashier", "kitchen", "manager", "admin"], {
    required_error: "Vui lòng chọn vai trò",
  }),
  hireDate: z.string().optional(),
})

// Schema cho cập nhật staff (không cần email/name)
export const updateStaffSchema = z.object({
  employeeCode: z.string()
    .min(2, "Mã nhân viên tối thiểu 2 ký tự")
    .max(20, "Mã nhân viên tối đa 20 ký tự")
    .transform(val => val.toUpperCase()),
  role: z.enum(["waiter", "cashier", "kitchen", "manager", "admin"], {
    required_error: "Vui lòng chọn vai trò",
  }),
  hireDate: z.string().optional(),
})

// Giữ lại staffSchema cho backward compatibility
export const staffSchema = createStaffSchema

export type StaffFormValues = z.infer<typeof createStaffSchema>
export type UpdateStaffFormValues = z.infer<typeof updateStaffSchema>

export const roleLabels: Record<string, string> = {
  admin: "Quản trị viên",
  manager: "Quản lý",
  waiter: "Phục vụ",
  cashier: "Thu ngân",
  kitchen: "Bếp",
}
