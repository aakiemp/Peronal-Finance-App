import { z } from 'zod'

export const accountTypeEnum = z.enum(['cash','checking','savings','credit','investment'])

export const accountSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  name: z.string().min(1),
  type: accountTypeEnum,
  institution: z.string().optional().nullable(),
  balance_cents: z.bigint().optional(),
  created_at: z.string().datetime().optional(),
})

export type Account = z.infer<typeof accountSchema>