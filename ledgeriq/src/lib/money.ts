export function formatCentsToDollars(cents: bigint | number): string {
  const value = typeof cents === 'number' ? BigInt(Math.trunc(cents)) : cents
  const isNegative = value < 0
  const abs = isNegative ? -value : value
  const dollars = abs / 100n
  const centsPart = abs % 100n
  const formatted = `${dollars.toString()}.${centsPart.toString().padStart(2, '0')}`
  return isNegative ? `-$${formatted}` : `$${formatted}`
}

export function parseDollarsToCents(input: string): bigint {
  const normalized = input.replace(/[^0-9.-]/g, '')
  if (!normalized) return 0n
  const isNegative = normalized.includes('-')
  const [whole = '0', fraction = '0'] = normalized.replace('-', '').split('.')
  const fraction2 = (fraction + '00').slice(0, 2)
  const cents = BigInt(whole) * 100n + BigInt(fraction2)
  return isNegative ? -cents : cents
}