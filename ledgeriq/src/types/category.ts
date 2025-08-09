import { z } from 'zod'

export const categoryKindEnum = z.enum(['income','expense','transfer'])

export const categorySchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  name: z.string().min(1),
  kind: categoryKindEnum,
  color: z.string().default('#64748b').optional(),
  is_system: z.boolean().default(false).optional(),
})

export type Category = z.infer<typeof categorySchema>