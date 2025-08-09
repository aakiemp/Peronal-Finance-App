export type RuleRow = {
  match_field: 'merchant' | 'memo'
  operator: 'contains' | 'equals' | 'starts_with' | 'ends_with' | 'regex'
  value: string
  category_id: string
}

export function matchRule(rule: RuleRow, tx: { merchant?: string; memo?: string }): boolean {
  const hay = (rule.match_field === 'merchant' ? tx.merchant : tx.memo) || ''
  const val = rule.value || ''
  switch (rule.operator) {
    case 'contains': return hay.toLowerCase().includes(val.toLowerCase())
    case 'equals': return hay.toLowerCase() === val.toLowerCase()
    case 'starts_with': return hay.toLowerCase().startsWith(val.toLowerCase())
    case 'ends_with': return hay.toLowerCase().endsWith(val.toLowerCase())
    case 'regex': try { return new RegExp(val).test(hay) } catch { return false }
    default: return false
  }
}