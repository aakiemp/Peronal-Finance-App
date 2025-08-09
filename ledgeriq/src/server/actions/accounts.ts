"use server"

import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function getComputedBalanceCents(accountId: string): Promise<bigint> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('transactions')
    .select('amount_cents')
    .eq('account_id', accountId)
  if (error) throw new Error(error.message)
  return (data || []).reduce((acc: bigint, t: { amount_cents: string | number | bigint }) => acc + BigInt(t.amount_cents), 0n)
}

export async function reconcileAccount(accountId: string, statementBalanceCents: bigint) {
  const computed = await getComputedBalanceCents(accountId)
  const delta = statementBalanceCents - computed
  if (delta === 0n) return
  const supabase = createSupabaseServerClient()
  const { error } = await supabase.from('transactions').insert({
    account_id: accountId,
    occurred_at: new Date().toISOString().slice(0,10),
    amount_cents: delta.toString(),
    memo: 'Reconciliation adjustment',
  })
  if (error) throw new Error(error.message)
}