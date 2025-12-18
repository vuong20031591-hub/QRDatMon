import { z } from "zod"

export const menuItemSchema = z.object({
  name: z.string().min(1, "Tên món không được để trống").max(200, "Tên món tối đa 200 ký tự"),
  description: z.string().max(1000, "Mô tả tối đa 1000 ký tự").optional(),
  price: z.coerce.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
  costPrice: z.coerce.number().min(0, "Giá vốn phải lớn hơn hoặc bằng 0").optional(),
  unit: z.string().max(50, "Đơn vị tối đa 50 ký tự").optional(),
  category: z.string().min(1, "Vui lòng chọn danh mục"),
  imageUrl: z.string().optional().or(z.literal("")),
  status: z.enum(["available", "out_of_stock", "suspended"]),
  isPopular: z.boolean().optional(),
  isNew: z.boolean().optional(),
  preparationTime: z.coerce.number().min(1, "Thời gian chuẩn bị tối thiểu 1 phút").optional(),
})

export type MenuItemFormValues = z.infer<typeof menuItemSchema>

export const categorySchema = z.object({
  name: z.string().min(1, "Tên danh mục không được để trống").max(100, "Tên danh mục tối đa 100 ký tự"),
  description: z.string().max(500, "Mô tả tối đa 500 ký tự").optional(),
  imageUrl: z.string().url("URL hình ảnh không hợp lệ").optional().or(z.literal("")),
  sortOrder: z.coerce.number().min(0).optional(),
})

export type CategoryFormValues = z.infer<typeof categorySchema>
