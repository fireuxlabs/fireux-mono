// Concurrent edit — 2026-07-21 17:05 CEST — Kitchen Finance surface: define the bounded gross-sales report projection.
import type { FinancialMoney } from 'fireux-finance/runtime/models/money.model.ts'

export const KitchenFinanceReportPeriodDays = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
} as const

export type KitchenFinanceReportPeriod =
  keyof typeof KitchenFinanceReportPeriodDays

export type KitchenFinanceCurrencySummary = {
  currency_code: string
  sale_count: number
  gross_sales: FinancialMoney
  average_sale: FinancialMoney
}

/**
 * Aggregate-only projection of immutable Kitchen Sales.
 * This is a report DTO, not an entity or independently stored record.
 */
export type KitchenGrossSalesReport = {
  app_id: string
  kitchen_id: string
  period: {
    from: string
    to: string
  }
  generated_at: string
  sale_count: number
  currencies: KitchenFinanceCurrencySummary[]
  complete: true
}
