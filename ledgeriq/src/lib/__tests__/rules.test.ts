import { describe, it, expect } from 'vitest'
import { matchRule, type RuleRow } from '@/lib/rules'

describe('rules matcher', () => {
  const tx = { merchant: 'Starbucks Coffee', memo: 'morning latte' }
  const r = (over: Partial<RuleRow>): RuleRow => ({ match_field: 'merchant', operator: 'contains', value: 'starbucks', category_id: 'c', ...over })
  it('matches contains', () => {
    expect(matchRule(r({}), tx)).toBe(true)
  })
  it('matches equals', () => {
    expect(matchRule(r({ operator: 'equals', value: 'Starbucks Coffee' }), tx)).toBe(true)
  })
  it('regex support', () => {
    expect(matchRule(r({ operator: 'regex', value: 'Star.*Coffee' }), tx)).toBe(true)
  })
})