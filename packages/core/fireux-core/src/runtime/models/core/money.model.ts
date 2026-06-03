/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Model support
 * Storage: shared runtime model support, not a persisted entity
 * Used by: stored models that need simple currency display preferences
 *
 * Decision note:
 * - Currency display format is a shared primitive.
 * - TODO: graduate Kitchen currency display into a shared price-display
 *   settings seam when more public/product surfaces need show/hide currency.
 * - Domain models may compose it, but should not own one-off copies.
 */
export type CurrencyDisplayFormat = 'none' | 'dash' | 'symbol' | 'code'

export type CurrencyAmountFormatOptions = {
  currencyCode?: string
  format?: CurrencyDisplayFormat
  locale?: string
}

const cleanCurrencyCode = (value: unknown) =>
  String(value ?? '').trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3)

const cleanNumber = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(2)

export const formatCurrencyAmount = (
  amount: number,
  options: CurrencyAmountFormatOptions = {}
) => {
  const value = Number(amount || 0)
  if (!Number.isFinite(value) || value <= 0) return ''

  const currencyCode = cleanCurrencyCode(options.currencyCode) || 'CHF'
  const format = options.format ?? 'dash'

  if (format === 'none') return cleanNumber(value)
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
