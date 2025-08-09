import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
const userId = process.env.SEED_USER_ID

if (!url || !key) throw new Error('Missing Supabase envs')
if (!userId) throw new Error('Set SEED_USER_ID to a valid auth user id')

const supabase = createClient(url, key)

async function main() {
  await supabase.from('accounts').insert([
    { user_id: userId, name: 'Checking', type: 'checking' },
    { user_id: userId, name: 'Cash', type: 'cash' },
  ])

  const { data: cats } = await supabase.from('categories').select('id,name').eq('user_id', userId)
  const unc = cats?.find((c) => c.name === 'Uncategorized')

  const { data: accts } = await supabase.from('accounts').select('id,name').eq('user_id', userId)
  const checking = accts?.find((a) => a.name === 'Checking')

  if (checking) {
    await supabase.from('transactions').insert([
      { user_id: userId, account_id: checking.id, occurred_at: new Date().toISOString().slice(0,10), amount_cents: '-1234', merchant: 'Starbucks', memo: 'coffee', category_id: unc?.id },
      { user_id: userId, account_id: checking.id, occurred_at: new Date().toISOString().slice(0,10), amount_cents: '250000', merchant: 'Acme Corp', memo: 'paycheck' },
    ])
  }

  console.log('Seed complete')
}

main().catch((e) => { console.error(e); process.exit(1) })