// Concurrent edit — 2026-07-21 17:05 CEST — Kitchen Finance surface: define the bounded gross-sales report projection.
import type { FinancialMoney } from 'fireux-finance/runtime/models/money.model'
import type { KitchenOrderChannel, KitchenOrderType } from './offering-interaction-types.model.ts'

export const KitchenFinanceReportPeriodDays = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
} as const

export type KitchenFinanceReportPeriod =
  keyof typeof KitchenFinanceReportPeriodDays

export type KitchenFinanceItemSummary = {
  menu_id: string
  source_item_id: string
  dish_id: string
  item_kind?: string
  variant_id?: string
  label: string
  variant_label?: string
  quantity: number
  sale_count: number
  line_gross: FinancialMoney
}

export type KitchenFinanceCurrencySummary = {
  currency_code: string
  sale_count: number
  gross_sales: FinancialMoney
  average_sale: FinancialMoney
  item_quantity: number
  item_sales: FinancialMoney
  delivery_fees: FinancialMoney
  items: KitchenFinanceItemSummary[]
}

export type KitchenFinanceDailySummary = {
  date: string
  sale_count: number
  currencies: KitchenFinanceCurrencySummary[]
}

export type KitchenFinanceTransactionSummary = {
  source: {
    kind: 'completed_order' | 'kitchen_sale'
    id: string
    service_id?: string
    service_number?: number
  }
  order_number: string
  placed_at?: string
  occurred_at: string
  status: 'completed'
  order_type: KitchenOrderType
  channel: KitchenOrderChannel
  closed_by: string
  counterparty: string
  summary: string
  item_quantity: number
  signed_amount: FinancialMoney
  gross_sale: FinancialMoney
  items: {
    label: string
    quantity: number
    line_gross: FinancialMoney
  }[]
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
  timezone: string
  generated_at: string
  sale_count: number
  currencies: KitchenFinanceCurrencySummary[]
  daily: KitchenFinanceDailySummary[]
  transactions: KitchenFinanceTransactionSummary[]
  complete: true
}
