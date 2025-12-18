import { z } from "zod"

export const promotionSchema = z.object({
  code: z.string()
    .min(3, "Mã voucher tối thiểu 3 ký tự")
    .max(20, "Mã voucher tối đa 20 ký tự")
    .transform(val => val.toUpperCase()),
  name: z.string()
    .min(1, "Tên khuyến mãi không được để trống")
    .max(200, "Tên khuyến mãi tối đa 200 ký tự"),
  description: z.string().max(1000, "Mô tả tối đa 1000 ký tự").optional(),
  discountType: z.enum(["percent", "fixed"], {
    required_error: "Vui lòng chọn loại giảm giá",
  }),
  discountValue: z.coerce.number().min(0, "Giá trị giảm phải >= 0"),
  minOrderAmount: z.coerce.number().min(0, "Đơn tối thiểu phải >= 0").optional(),
  maxDiscount: z.coerce.number().min(0, "Giảm tối đa phải >= 0").optional().nullable(),
  startDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
  endDate: z.string().min(1, "Vui lòng chọn ngày kết thúc"),
  usageLimit: z.coerce.number().min(1, "Giới hạn sử dụng tối thiểu 1").optional().nullable(),
  usagePerUser: z.coerce.number().min(1, "Giới hạn mỗi người tối thiểu 1").optional(),
}).refine(data => new Date(data.endDate) > new Date(data.startDate), {
  message: "Ngày kết thúc phải sau ngày bắt đầu",
  path: ["endDate"],
})

export type PromotionFormValues = z.infer<typeof promotionSchema>

export const discountTypeLabels: Record<string, string> = {
  percent: "Phần trăm (%)",
  fixed: "Số tiền cố định",
}

export const promotionStatusLabels = {
  active: "Đang hoạt động",
  inactive: "Ngừng hoạt động",
  expired: "Đã hết hạn",
  scheduled: "Chưa bắt đầu",
}
