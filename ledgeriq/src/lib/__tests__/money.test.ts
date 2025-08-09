import { describe, it, expect } from 'vitest'
import { formatCentsToDollars, parseDollarsToCents } from '@/lib/money'

describe('money utils', () => {
  it('formats cents to dollars', () => {
    expect(formatCentsToDollars(0n)).toBe('$0.00')
    expect(formatCentsToDollars(1234n)).toBe('$12.34')
    expect(formatCentsToDollars(-505n)).toBe('-$5.05')
  })
  it('parses dollars to cents', () => {
    expect(parseDollarsToCents('0')).toBe(0n)
    expect(parseDollarsToCents('12.34')).toBe(1234n)
    expect(parseDollarsToCents('-5.05')).toBe(-505n)
    expect(parseDollarsToCents('$1,234.56')).toBe(123456n)
  })
})