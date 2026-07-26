import type { KitchenFinanceReportPeriod } from '../../models/kitchen/finance-report.model'

export type KitchenDemoGrossSalesSummary = {
  currencyCode: string
  saleCount: number
  grossSalesMinor: number
}

export type KitchenDemoFinance = {
  grossSales: Record<
    KitchenFinanceReportPeriod,
    KitchenDemoGrossSalesSummary
  >
}

/**
 * Deterministic, aggregate-only sales for the fictional Deanos Demo Kitchen.
 *
 * These values are read-only presentation fixtures. They are not KitchenSale
 * records, FinancialFacts, Firestore documents, or Test-environment data.
 */
export const deanosKitchenDemoFinance: KitchenDemoFinance = {
  grossSales: {
    '7d': {
      currencyCode: 'CHF',
      saleCount: 318,
      grossSalesMinor: 835_420,
    },
    '30d': {
      currencyCode: 'CHF',
      saleCount: 1_368,
      grossSalesMinor: 3_598_420,
    },
    '90d': {
      currencyCode: 'CHF',
      saleCount: 4_116,
      grossSalesMinor: 10_848_750,
    },
  },
}
