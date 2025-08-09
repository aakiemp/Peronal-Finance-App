import { z } from 'zod'

export const budgetSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  category_id: z.string().uuid(),
  month: z.coerce.date(),
  amount_cents: z.bigint(),
})

export type Budget = z.infer<typeof budgetSchema>