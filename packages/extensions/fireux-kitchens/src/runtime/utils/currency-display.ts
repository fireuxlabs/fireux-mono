import type { CurrencyDisplayFormat } from '../models/shared/currency-display.model'

export type CurrencyAmountFormatOptions = {
  currencyCode?: string
  format?: CurrencyDisplayFormat
  showCurrency?: boolean
  locale?: string
}

const cleanCurrencyCode = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 3)

const cleanNumber = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(2)

export const formatCurrencyAmount = (
  amount: number,
  options: CurrencyAmountFormatOptions = {}
) => {
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0)
    return ''
  const value = amount

  const currencyCode = cleanCurrencyCode(options.currencyCode) || 'CHF'
  const format = options.format ?? 'dash'

  if (options.showCurrency === false) return cleanNumber(value)
  if (format === 'dash') {
    return Number.isInteger(value) ? `${value}.-` : cleanNumber(value)
  }
  if (format === 'code') return `${cleanNumber(value)} ${currencyCode}`

  return new Intl.NumberFormat(options.locale ?? 'de-CH', {
    style: 'currency',
    currency: currencyCode,
    currencyDisplay: 'symbol',
  }).format(value)
}
