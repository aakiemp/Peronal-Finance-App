import { z } from 'zod'

export const transactionSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  account_id: z.string().uuid(),
  occurred_at: z.coerce.date(),
  amount_cents: z.bigint(),
  merchant: z.string().optional().nullable(),
  memo: z.string().optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  is_transfer: z.boolean().default(false).optional(),
  created_at: z.string().datetime().optional(),
  import_hash: z.string().optional().nullable(),
})

export type Transaction = z.infer<typeof transactionSchema>