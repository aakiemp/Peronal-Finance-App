import { createSupabaseServerClient } from '@/lib/supabase/server'
import { parseDollarsToCents } from '@/lib/money'

type CsvTx = { occurred_at: string; amount_cents: bigint; merchant: string; memo: string; account_name: string; import_hash: string }

export default function ImportPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Import</h1>
      <UploadForm />
    </div>
  )
}

async function importCsvAction(formData: FormData) {
  'use server'
  const supabase = createSupabaseServerClient()
  const file = formData.get('file') as File | null
  if (!file) throw new Error('No file')
  const text = await file.text()
  const rows = text.trim().split(/\r?\n/)
  const [headerLine, ...dataLines] = rows
  const headers = headerLine.split(',').map((h) => h.trim().toLowerCase())
  const idxDate = headers.indexOf('date')
  const idxAmount = headers.indexOf('amount')
  const idxMerchant = headers.indexOf('merchant')
  const idxMemo = headers.indexOf('memo')
  const idxAccount = headers.indexOf('account')
  if (idxDate < 0 || idxAmount < 0 || idxAccount < 0) throw new Error('CSV must include date, amount, account columns')

  const txs: CsvTx[] = dataLines.map((line) => {
    const cols = line.split(',')
    const occurred_at = cols[idxDate]
    const amount_cents = parseDollarsToCents(cols[idxAmount])
    const merchant = idxMerchant >= 0 ? cols[idxMerchant] : ''
    const memo = idxMemo >= 0 ? cols[idxMemo] : ''
    const account_name = cols[idxAccount]
    const import_hash = `${occurred_at}|${amount_cents}|${merchant}|${memo}`
    return { occurred_at, amount_cents, merchant, memo, account_name, import_hash }
  })

  // Resolve account ids by name
  const accountNames = Array.from(new Set(txs.map((t) => t.account_name)))
  const { data: accounts } = await supabase.from('accounts').select('id,name').in('name', accountNames)
  const nameToId = new Map<string, string>((accounts as { id: string; name: string }[] || []).map((a) => [a.name, a.id]))

  const insertRows = txs
    .map((t) => ({
      account_id: nameToId.get(t.account_name),
      occurred_at: t.occurred_at,
      amount_cents: t.amount_cents.toString(),
      merchant: t.merchant || null,
      memo: t.memo || null,
      import_hash: t.import_hash,
    }))
    .filter((r) => !!r.account_id)

  if (insertRows.length === 0) return

  // Prevent duplicates: skip rows with same import_hash
  const hashes = insertRows.map((r) => r.import_hash!)
  const { data: existing } = await supabase.from('transactions').select('import_hash').in('import_hash', hashes)
  const existingSet = new Set<string>((existing as { import_hash: string }[] || []).map((e) => e.import_hash))
  const toInsert = insertRows.filter((r) => !existingSet.has(r.import_hash!))

  if (toInsert.length > 0) {
    const { error } = await supabase.from('transactions').insert(toInsert)
    if (error) throw new Error(error.message)
  }
}

function UploadForm() {
  return (
    <form action={importCsvAction} className="space-y-2" encType="multipart/form-data">
      <input name="file" type="file" accept=".csv,text/csv" className="block" required />
      <button className="bg-black text-white px-3 py-2 rounded" type="submit">Import CSV</button>
    </form>
  )
}