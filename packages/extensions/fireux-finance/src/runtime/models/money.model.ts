// Concurrent edit — 2026-07-21 16:16 CEST — FireUX Finance pass: define product-neutral minor-unit money.

/**
 * Money is a value primitive, not an entity or stored record by itself.
 * `amount_minor` is always an integer in the ISO currency's minor unit.
 */
export type FinancialMoney = {
  amount_minor: number
  currency_code: string
}
