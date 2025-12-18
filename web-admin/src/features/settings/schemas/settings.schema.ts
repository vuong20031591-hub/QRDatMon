/**
 * Settings Schemas - Zod validation
 */

import { z } from "zod"

const operatingHourSchema = z.object({
  open: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  close: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  isOpen: z.boolean(),
})

export const restaurantInfoSchema = z.object({
  name: z.string().min(1, "Tên nhà hàng là bắt buộc").max(200),
  address: z.string().max(500).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email("Email không hợp lệ").max(100).optional().or(z.literal("")),
  logo: z.string().url("URL không hợp lệ").max(500).optional().or(z.literal("")),
  operatingHours: z.object({
    monday: operatingHourSchema,
    tuesday: operatingHourSchema,
    wednesday: operatingHourSchema,
    thursday: operatingHourSchema,
    friday: operatingHourSchema,
    saturday: operatingHourSchema,
    sunday: operatingHourSchema,
  }),
})

export const taxSettingsSchema = z.object({
  vatPercent: z.number().min(0, "VAT không được âm").max(100, "VAT không được vượt quá 100%"),
  serviceChargePercent: z.number().min(0, "Phí dịch vụ không được âm").max(100, "Phí dịch vụ không được vượt quá 100%"),
})

export const notificationSettingsSchema = z.object({
  newOrder: z.boolean(),
  lowStock: z.boolean(),
  newReview: z.boolean(),
  payment: z.boolean(),
})

export type RestaurantInfoFormValues = z.infer<typeof restaurantInfoSchema>
export type TaxSettingsFormValues = z.infer<typeof taxSettingsSchema>
export type NotificationSettingsFormValues = z.infer<typeof notificationSettingsSchema>
