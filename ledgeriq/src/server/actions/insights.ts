"use server"

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { startOfMonth, addMonths } from '@/lib/dates'

export async function getInsights() {
  const supabase = createSupabaseServerClient()
  const today = new Date()
  const currStart = startOfMonth(today)
  const prevStart = startOfMonth(addMonths(today, -1))
  const prevEnd = startOfMonth(today)

  // Spend by category this and last month
  const { data: txs } = await supabase
    .from('transactions')
    .select('amount_cents, category_id, occurred_at')
    .gte('occurred_at', prevStart.toISOString().slice(0,10))
    .lt('occurred_at', currStart.toISOString().slice(0,10))

  const { data: txs2 } = await supabase
    .from('transactions')
    .select('amount_cents, category_id, occurred_at')
    .gte('occurred_at', currStart.toISOString().slice(0,10))

  const byCatPrev = new Map<string, bigint>()
  for (const t of txs || []) {
    const amt = BigInt(t.amount_cents)
    if (amt < 0) byCatPrev.set(t.category_id, (byCatPrev.get(t.category_id) || 0n) + (-amt))
  }
  const byCatCurr = new Map<string, bigint>()
  for (const t of txs2 || []) {
    const amt = BigInt(t.amount_cents)
    if (amt < 0) byCatCurr.set(t.category_id, (byCatCurr.get(t.category_id) || 0n) + (-amt))
  }

  const topCat = Array.from(byCatCurr.entries()).sort((a,b)=> Number(b[1]-a[1]))[0]
  const insight1 = topCat ? `You spent ${(Number((byCatCurr.get(topCat[0])||0n) * 100n / ((byCatPrev.get(topCat[0])||1n))) / 100).toFixed(0)}% more on a category vs last month.` : null

  // Budget overrun estimate placeholder
  const insight2 = `You're on track to exceed a category budget if current spending continues.`

  // Recurring merchant placeholder: naive count
  const { data: txs3 } = await supabase
    .from('transactions')
    .select('merchant')
  const counts = new Map<string, number>()
  for (const t of txs3 || []) {
    if (!t.merchant) continue
    counts.set(t.merchant, (counts.get(t.merchant) || 0) + 1)
  }
  const rec = Array.from(counts.entries()).sort((a,b)=> b[1]-a[1])[0]
  const insight3 = rec ? `Recurring merchant detected: ${rec[0]} appears ${rec[1]} times.` : null

  return [insight1, insight2, insight3].filter(Boolean)
}