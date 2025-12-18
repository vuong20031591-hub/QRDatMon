import { z } from "zod"

export const tableSchema = z.object({
  tableNumber: z.string().min(1, "Số bàn không được để trống").max(50, "Số bàn tối đa 50 ký tự"),
  area: z.string().min(1, "Vui lòng chọn khu vực"),
  capacity: z.coerce.number().min(1, "Sức chứa tối thiểu 1 người").max(100, "Sức chứa tối đa 100 người"),
  status: z.enum(["available", "occupied", "reserved", "cleaning"]).optional(),
})

export type TableFormValues = z.infer<typeof tableSchema>

export const areaSchema = z.object({
  name: z.string().min(1, "Tên khu vực không được để trống").max(100, "Tên khu vực tối đa 100 ký tự"),
  description: z.string().max(500, "Mô tả tối đa 500 ký tự").optional(),
  floor: z.coerce.number().min(1, "Tầng tối thiểu là 1").optional(),
  sortOrder: z.coerce.number().min(0).optional(),
})

export type AreaFormValues = z.infer<typeof areaSchema>
