import { z } from "zod"

export const applyVoucherSchema = z.object({
  voucherCode: z.string().min(1, "Vui lòng nhập mã voucher").transform(val => val.toUpperCase()),
})

export const applyDiscountSchema = z.object({
  discountAmount: z.coerce.number().min(0, "Số tiền giảm phải >= 0"),
  discountReason: z.string().min(1, "Vui lòng nhập lý do giảm giá"),
})

export const updateRatesSchema = z.object({
  serviceChargePercent: z.coerce.number().min(0).max(100).optional(),
  vatPercent: z.coerce.number().min(0).max(100).optional(),
})

export const confirmPaymentSchema = z.object({
  method: z.enum(["cash", "card", "qr"], {
    required_error: "Vui lòng chọn phương thức thanh toán",
  }),
  amount: z.coerce.number().min(0, "Số tiền phải >= 0"),
  transactionId: z.string().optional(),
  note: z.string().optional(),
})

export type ApplyVoucherValues = z.infer<typeof applyVoucherSchema>
export type ApplyDiscountValues = z.infer<typeof applyDiscountSchema>
export type UpdateRatesValues = z.infer<typeof updateRatesSchema>
export type ConfirmPaymentValues = z.infer<typeof confirmPaymentSchema>

export const billStatusLabels: Record<string, string> = {
  open: "Đang mở",
  requesting_payment: "Chờ thanh toán",
  paid: "Đã thanh toán",
  cancelled: "Đã hủy",
}

export const paymentMethodLabels: Record<string, string> = {
  cash: "Tiền mặt",
  card: "Thẻ",
  qr: "QR Code",
}
