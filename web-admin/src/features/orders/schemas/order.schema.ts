import { z } from "zod"

export const orderStatusSchema = z.enum([
  "pending",
  "confirmed", 
  "preparing",
  "ready",
  "served",
  "cancelled"
])

export const orderItemStatusSchema = z.enum([
  "pending",
  "preparing",
  "ready",
  "served",
  "cancelled"
])

export const orderFilterSchema = z.object({
  status: orderStatusSchema.optional(),
  tableId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
})

export const updateOrderStatusSchema = z.object({
  status: orderStatusSchema,
  reason: z.string().optional(),
})

export const cancelOrderSchema = z.object({
  reason: z.string().min(1, "Vui lòng nhập lý do hủy đơn"),
})

export type OrderFilterValues = z.infer<typeof orderFilterSchema>
export type UpdateOrderStatusValues = z.infer<typeof updateOrderStatusSchema>
export type CancelOrderValues = z.infer<typeof cancelOrderSchema>
