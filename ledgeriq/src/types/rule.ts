import { z } from 'zod'

export const ruleSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  match_field: z.enum(['merchant','memo']),
  operator: z.enum(['contains','equals','starts_with','ends_with','regex']),
  value: z.string().min(1),
  category_id: z.string().uuid(),
  priority: z.number().int().default(100).optional(),
})

export type Rule = z.infer<typeof ruleSchema>