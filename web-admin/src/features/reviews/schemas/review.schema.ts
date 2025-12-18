/**
 * Review Schemas - Zod validation
 */

import { z } from "zod"

export const reviewResponseSchema = z.object({
  response: z.string().min(1, "Phản hồi không được để trống").max(1000, "Phản hồi tối đa 1000 ký tự"),
})

export type ReviewResponseFormValues = z.infer<typeof reviewResponseSchema>
