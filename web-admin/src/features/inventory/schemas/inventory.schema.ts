/**
 * Inventory Schemas - Zod validation
 */

import { z } from "zod"

export const stockUpdateSchema = z.object({
  quantityChange: z.coerce.number().int(),
  reason: z.string().max(500).optional(),
  referenceType: z.enum(['manual', 'restock', 'adjustment']).optional(),
})

export const inventorySettingsSchema = z.object({
  minThreshold: z.number().int().min(0).optional(),
  unit: z.string().max(50).optional(),
  autoUpdateStatus: z.boolean().optional(),
})

export const addInventorySchema = z.object({
  menuItemId: z.string().min(1, "Menu item is required"),
  quantity: z.number().int().min(0).default(0),
  minThreshold: z.number().int().min(0).default(10),
  unit: z.string().max(50).optional(),
})

export type StockUpdateFormValues = z.infer<typeof stockUpdateSchema>
export type InventorySettingsFormValues = z.infer<typeof inventorySettingsSchema>
export type AddInventoryFormValues = z.infer<typeof addInventorySchema>
