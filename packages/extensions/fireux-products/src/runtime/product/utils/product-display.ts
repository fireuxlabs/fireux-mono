import type { ProductPrice } from './product'

export function display(value: unknown): string {
  return typeof value === 'string' && value.trim() !== '' ? value : '!'
}

export function displayTimestamp(value: unknown): string {
  if (!value) return '!'
  if (typeof value === 'string') return display(value)
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'object' && value !== null) {
    const seconds = Number((value as { seconds?: unknown }).seconds ?? 0)
    const nanoseconds = Number(
      (value as { nanoseconds?: unknown }).nanoseconds ?? 0
    )
    if (seconds > 0) {
      return new Date(
        seconds * 1000 + Math.floor(nanoseconds / 1_000_000)
      ).toISOString()
    }
  }
  return '!'
}

export function formatMoney(unitAmount: number, currency?: string): string {
  const iso = (currency || 'EUR').toUpperCase()
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: iso,
  }).format(Number(unitAmount ?? 0) / 100)
}

export function formatDefaultPrice(
  price?: Partial<ProductPrice> | null
): string {
  if (!price) return ''
  const base = formatMoney(Number(price.unit_amount || 0), price.currency)
  return price.interval ? `${base}/${price.interval}` : base
}

export function priceLabel(price?: Partial<ProductPrice> | null): string {
  return price?.interval ? 'From' : 'Price'
}
