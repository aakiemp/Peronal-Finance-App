"use server"

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ruleSchema } from '@/types/rule'

export async function createRule(input: unknown) {
  const parsed = ruleSchema.pick({ match_field: true, operator: true, value: true, category_id: true, priority: true }).safeParse(input)
  if (!parsed.success) throw new Error('Invalid data')
  const supabase = createSupabaseServerClient()
  const { error } = await supabase.from('rules').insert(parsed.data)
  if (error) throw new Error(error.message)
}

export async function deleteRule(id: string) {
  const supabase = createSupabaseServerClient()
  const { error } = await supabase.from('rules').delete().eq('id', id)
  if (error) throw new Error(error.message)
}