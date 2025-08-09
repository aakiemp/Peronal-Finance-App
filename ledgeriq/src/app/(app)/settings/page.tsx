import { createSupabaseServerClient } from '@/lib/supabase/server'
import { categorySchema, type Category } from '@/types/category'

export const revalidate = 0

export default async function SettingsPage() {
  const supabase = createSupabaseServerClient()
  const { data: categories } = await supabase.from('categories').select('*').order('is_system', { ascending: true }).order('name')

  const rows = (categories as Category[]) || []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <h2 className="text-lg font-medium">Categories</h2>
      <AddCategoryForm />
      <ul className="divide-y border rounded">
        {rows.map((c) => (
          <li key={c.id} className="p-3 flex items-center justify-between">
            <div>
              <div className="font-medium flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded" style={{ background: c.color }} />
                {c.name}
              </div>
              <div className="text-xs text-gray-600">{c.kind}{c.is_system ? ' • system' : ''}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

async function addCategory(formData: FormData) {
  'use server'
  const supabase = createSupabaseServerClient()
  const name = String(formData.get('name'))
  const kind = String(formData.get('kind'))
  const color = String(formData.get('color') || '#64748b')
  const parsed = categorySchema.pick({ name: true, kind: true, color: true }).safeParse({ name, kind, color })
  if (!parsed.success) throw new Error('Invalid data')
  const { error } = await supabase.from('categories').insert({ name, kind, color })
  if (error) throw new Error(error.message)
}

function AddCategoryForm() {
  return (
    <form action={addCategory} className="flex flex-wrap items-end gap-2">
      <div>
        <label className="block text-sm">Name</label>
        <input name="name" className="border rounded px-2 py-1" required />
      </div>
      <div>
        <label className="block text-sm">Kind</label>
        <select name="kind" className="border rounded px-2 py-1">
          <option value="expense">Expense</option>
          <option value="income">Income</option>
          <option value="transfer">Transfer</option>
        </select>
      </div>
      <div>
        <label className="block text-sm">Color</label>
        <input name="color" type="color" defaultValue="#64748b" className="border rounded px-2 py-1" />
      </div>
      <button className="bg-black text-white px-3 py-2 rounded" type="submit">Add</button>
    </form>
  )
}