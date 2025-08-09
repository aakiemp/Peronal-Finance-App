import { createSupabaseServerClient } from '@/lib/supabase/server'
import { formatCentsToDollars } from '@/lib/money'
import { getInsights } from '@/server/actions/insights'

type AmountRow = { amount_cents: string | number | bigint }

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Simple KPIs placeholder
  const monthStart = new Date()
  monthStart.setDate(1)
  const { data: inflowAgg } = await supabase
    .from('transactions')
    .select('amount_cents')
    .gte('occurred_at', monthStart.toISOString().slice(0,10))

  const total = (inflowAgg || []).reduce((acc: bigint, t: AmountRow) => acc + BigInt(t.amount_cents), 0n)
  const insights = await getInsights()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Kpi title="Net This Month" value={formatCentsToDollars(total)} />
        <Kpi title="# Transactions" value={String(inflowAgg?.length || 0)} />
        <Kpi title="# Uncategorized" value={'—'} />
        <Kpi title="Accounts" value={'—'} />
      </div>
      {insights.length > 0 && (
        <div className="grid gap-2">
          {insights.map((i, idx) => (
            <div key={idx} className="border rounded px-3 py-2 bg-yellow-50 text-yellow-800 text-sm">{i}</div>
          ))}
        </div>
      )}
      <div className="text-sm text-gray-600">Welcome {user?.email}</div>
    </div>
  )
}

function Kpi({ title, value }: { title: string, value: string }) {
  return (
    <div className="border rounded p-4">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-xl font-medium">{value}</div>
    </div>
  )
}