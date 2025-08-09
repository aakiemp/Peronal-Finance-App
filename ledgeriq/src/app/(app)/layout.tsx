import Link from 'next/link'
import { ReactNode } from 'react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { signOut } from '@/server/actions/auth'
import QueryProvider from '@/components/providers/QueryProvider'

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <QueryProvider>
      <div className="min-h-screen grid grid-cols-[240px_1fr]">
        <aside className="border-r p-4 space-y-4">
          <h1 className="text-xl font-semibold">LedgerIQ</h1>
          <nav className="space-y-2 text-sm">
            <div><Link href="/">Dashboard</Link></div>
            <div><Link href="/accounts">Accounts</Link></div>
            <div><Link href="/transactions">Transactions</Link></div>
            <div><Link href="/budgets">Budgets</Link></div>
            <div><Link href="/import">Import</Link></div>
            <div><Link href="/settings">Settings</Link></div>
          </nav>
          <div className="mt-8 text-xs text-gray-600">{user?.email}</div>
          <form action={signOut}>
            <button className="text-sm underline" type="submit">Sign out</button>
          </form>
        </aside>
        <main className="p-6">{children}</main>
      </div>
    </QueryProvider>
  )
}