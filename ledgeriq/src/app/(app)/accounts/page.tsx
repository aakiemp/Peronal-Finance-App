import { accountSchema, type Account } from '@/types/account'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const revalidate = 0

export default async function AccountsPage() {
  const supabase = createSupabaseServerClient()
  const { data: accounts } = await supabase.from('accounts').select('*').order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Accounts</h1>
      <AddAccountForm />
      <ul className="divide-y border rounded">
        {(accounts || []).map((a: Account) => (
          <li key={a.id} className="p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{a.name}</div>
              <div className="text-xs text-gray-600">{a.type}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

async function createAccount(formData: FormData) {
  'use server'
  const supabase = createSupabaseServerClient()
  const name = String(formData.get('name') || '')
  const type = String(formData.get('type') || '')
  const parsed = accountSchema.pick({ name: true, type: true }).safeParse({ name, type })
  if (!parsed.success) throw new Error('Invalid data')
  const { error } = await supabase.from('accounts').insert({ name, type })
  if (error) throw new Error(error.message)
}

function AddAccountForm() {
  return (
    <form action={createAccount} className="flex items-end gap-2">
      <div>
        <label className="block text-sm">Name</label>
        <input name="name" className="border rounded px-2 py-1" required />
      </div>
      <div>
        <label className="block text-sm">Type</label>
        <select name="type" className="border rounded px-2 py-1" required>
          <option value="cash">Cash</option>
          <option value="checking">Checking</option>
          <option value="savings">Savings</option>
          <option value="credit">Credit</option>
          <option value="investment">Investment</option>
        </select>
      </div>
      <button type="submit" className="bg-black text-white rounded px-3 py-2">Add</button>
    </form>
  )
}