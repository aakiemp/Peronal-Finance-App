import { createSupabaseServerClient } from '@/lib/supabase/server'
import { budgetSchema, type Budget } from '@/types/budget'
import { formatCentsToDollars, parseDollarsToCents } from '@/lib/money'
import { startOfMonth } from '@/lib/dates'

export const revalidate = 0

type BudgetRow = Budget & { categories?: { name: string } | null }

export default async function BudgetsPage() {
  const supabase = createSupabaseServerClient()
  const { data: budgets } = await supabase
    .from('budgets')
    .select('*, categories(name)')
    .order('month', { ascending: false })
    .limit(50)

  const rows = (budgets as unknown as BudgetRow[]) || []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Budgets</h1>
      <AddBudgetForm />
      <ul className="divide-y border rounded">
        {rows.map((b) => (
          <li key={b.id} className="p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{b.categories?.name}</div>
              <div className="text-xs text-gray-600">{new Date(b.month).toISOString().slice(0,10)}</div>
            </div>
            <div>{formatCentsToDollars(BigInt(b.amount_cents))}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}

async function fetchExpenseCategories() {
  'use server'
  const supabase = createSupabaseServerClient()
  const { data } = await supabase.from('categories').select('id,name').eq('kind', 'expense').order('name')
  return (data as { id: string; name: string }[]) || []
}

async function createBudget(formData: FormData) {
  'use server'
  const supabase = createSupabaseServerClient()
  const category_id = String(formData.get('category_id'))
  const amount = String(formData.get('amount'))
  const month = String(formData.get('month'))

  const parsed = budgetSchema.pick({ category_id: true, amount_cents: true, month: true }).safeParse({
    category_id,
    amount_cents: parseDollarsToCents(amount),
    month: new Date(month),
  })
  if (!parsed.success) throw new Error('Invalid data')

  const { error } = await supabase.from('budgets').insert({
    category_id,
    amount_cents: parsed.data.amount_cents.toString(),
    month,
  })
  if (error) throw new Error(error.message)
}

async function CategoryOptions() {
  const data = await fetchExpenseCategories()
  return (
    <>
      {data.map((c) => (
        <option key={c.id} value={c.id}>{c.name}</option>
      ))}
    </>
  )
}

function AddBudgetForm() {
  const today = new Date()
  const m = startOfMonth(today).toISOString().slice(0,10)
  return (
    <form action={createBudget} className="flex flex-wrap items-end gap-2">
      <div>
        <label className="block text-sm">Month</label>
        <input name="month" type="date" defaultValue={m} className="border rounded px-2 py-1" required />
      </div>
      <div>
        <label className="block text-sm">Category</label>
        <select name="category_id" className="border rounded px-2 py-1" required>
          <CategoryOptions />
        </select>
      </div>
      <div>
        <label className="block text-sm">Amount</label>
        <input name="amount" placeholder="500.00" className="border rounded px-2 py-1" required />
      </div>
      <button className="bg-black text-white px-3 py-2 rounded" type="submit">Add</button>
    </form>
  )
}