import { createSupabaseServerClient } from '@/lib/supabase/server'
import { transactionSchema, type Transaction } from '@/types/transaction'
import { formatCentsToDollars, parseDollarsToCents } from '@/lib/money'
import { matchRule, type RuleRow } from '@/lib/rules'

export const revalidate = 0

type TxRow = Transaction & { accounts?: { name: string } | null; categories?: { name: string } | null }
export default async function TransactionsPage() {
  const supabase = createSupabaseServerClient()
  const { data: txs } = await supabase
    .from('transactions')
    .select('*, accounts(name), categories(name)')
    .order('occurred_at', { ascending: false })
    .limit(50)

  const rows = (txs as unknown as TxRow[]) || []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Transactions</h1>
      <AddTxForm />
      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-2">Date</th>
              <th className="p-2">Account</th>
              <th className="p-2">Merchant</th>
              <th className="p-2">Category</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Memo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="p-2">{String(t.occurred_at)}</td>
                <td className="p-2">{t.accounts?.name ?? ''}</td>
                <td className="p-2">{t.merchant ?? ''}</td>
                <td className="p-2">{t.categories?.name || 'Uncategorized'}</td>
                <td className="p-2">{formatCentsToDollars(BigInt(t.amount_cents))}</td>
                <td className="p-2">{t.memo ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

async function upsertWithRules(formData: FormData) {
  'use server'
  const supabase = createSupabaseServerClient()
  const payload = {
    account_id: String(formData.get('account_id')),
    occurred_at: String(formData.get('occurred_at')),
    amount_cents: parseDollarsToCents(String(formData.get('amount'))),
    merchant: String(formData.get('merchant') || ''),
    memo: String(formData.get('memo') || ''),
  }

  const parsed = transactionSchema.pick({ account_id: true, occurred_at: true, amount_cents: true, merchant: true, memo: true }).safeParse({
    ...payload,
    occurred_at: new Date(payload.occurred_at),
  })
  if (!parsed.success) throw new Error('Invalid data')

  const { data: rules } = await supabase
    .from('rules')
    .select('*')
    .order('priority', { ascending: true })

  let category_id: string | null = null
  for (const r of (rules as RuleRow[]) || []) {
    if (matchRule(r, payload)) { category_id = r.category_id; break }
  }

  const { error } = await supabase.from('transactions').insert({
    account_id: payload.account_id,
    occurred_at: payload.occurred_at,
    amount_cents: payload.amount_cents.toString(),
    merchant: payload.merchant || null,
    memo: payload.memo || null,
    category_id,
  })
  if (error) throw new Error(error.message)
}

async function fetchAccounts() {
  'use server'
  const supabase = createSupabaseServerClient()
  const { data } = await supabase.from('accounts').select('id,name').order('name')
  return (data as { id: string; name: string }[]) || []
}

async function AccountsOptions() {
  const data = await fetchAccounts()
  return (
    <>
      {data.map((a) => (
        <option key={a.id} value={a.id}>{a.name}</option>
      ))}
    </>
  )
}

function AddTxForm() {
  return (
    <form action={upsertWithRules} className="grid md:grid-cols-6 gap-2">
      <div>
        <label className="block text-sm">Date</label>
        <input name="occurred_at" type="date" className="border rounded px-2 py-1" required />
      </div>
      <div>
        <label className="block text-sm">Account</label>
        <select name="account_id" className="border rounded px-2 py-1" required>
          <AccountsOptions />
        </select>
      </div>
      <div>
        <label className="block text-sm">Merchant</label>
        <input name="merchant" className="border rounded px-2 py-1" />
      </div>
      <div>
        <label className="block text-sm">Memo</label>
        <input name="memo" className="border rounded px-2 py-1" />
      </div>
      <div>
        <label className="block text-sm">Amount</label>
        <input name="amount" placeholder="-12.34" className="border rounded px-2 py-1" required />
      </div>
      <div className="flex items-end">
        <button type="submit" className="bg-black text-white px-3 py-2 rounded">Add</button>
      </div>
    </form>
  )
}