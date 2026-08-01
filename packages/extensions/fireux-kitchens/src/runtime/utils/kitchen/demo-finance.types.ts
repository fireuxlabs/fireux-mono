import type { KitchenFinanceReportPeriod } from '../../models/kitchen/finance-report.model'

export type KitchenDemoFinanceSource = {
  asOfDate: string
  currencyCode: string
  timezone: string
  dailyGrossSales: readonly {
    date: string
    saleCount: number
    grossSalesMinor: number
    itemQuantity: number
    itemSalesMinor: number
    deliveryFeesMinor: number
    items: readonly {
      menuId: string
      sourceItemId: string
      dishId: string
      label: string
      itemKind?: string
      variantId?: string
      variantLabel?: string
      quantity: number
      saleCount: number
      lineGrossMinor: number
    }[]
    transactions: readonly {
      source: {
        kind: 'completed_order'
        id: string
        serviceId: string
        serviceNumber: number
      }
      orderId: string
      orderNumber: string
      serviceId: string
      serviceNumber: number
      placedAt: string
      occurredAt: string
      orderType: 'eat_in' | 'takeaway' | 'collection'
      channel: 'kiosk' | 'menu'
      status: 'completed'
      closedByTeamMemberId: string
      closedBy: string
      signedAmountMinor: number
      counterparty: string
      summary: string
      itemQuantity: number
      grossSalesMinor: number
      items: readonly {
        label: string
        unitPriceMinor: number
        quantity: number
        lineGrossMinor: number
      }[]
    }[]
  }[]
}

export type KitchenDemoFinanceSummary = {
  period: KitchenFinanceReportPeriod
  currencyCode: string
  minorUnitDigits: number
  saleCount: number
  grossSalesMinor: number
  averageSaleMinor: number
}

export type KitchenDemoFinanceTrendPoint = {
  id: string
  fromDate: string
  toDate: string
  saleCount: number
  grossSalesMinor: number
}

export type KitchenDemoFinanceItemRollup = {
  id: string
  menuId: string
  sourceItemId: string
  dishId: string
  label: string
  itemKind?: string
  variantId?: string
  variantLabel?: string
  quantity: number
  saleCount: number
  lineGrossMinor: number
  sharePercent: number
}

export type KitchenDemoFinanceDay = {
  date: string
  saleCount: number
  grossSalesMinor: number
  averageSaleMinor: number
  itemQuantity: number
  itemSalesMinor: number
  deliveryFeesMinor: number
  items: KitchenDemoFinanceItemRollup[]
}

export type KitchenDemoFinanceWeekday = {
  id: string
  weekday: number
  dayCount: number
  saleCount: number
  itemQuantity: number
  grossSalesMinor: number
  averageDailyGrossSalesMinor: number
}

export type KitchenDemoFinanceReport = KitchenDemoFinanceSummary & {
  asOfDate: string
  timezone: string
  periodFrom: string
  periodTo: string
  intervalDays: number
  averageDailyGrossSalesMinor: number
  itemQuantity: number
  itemSalesMinor: number
  deliveryFeesMinor: number
  comparison: {
    previousGrossSalesMinor: number
    grossSalesChangePercent: number
    previousSaleCount: number
    saleCountChangePercent: number
    previousAverageSaleMinor: number
    averageSaleChangePercent: number
  }
  bestDay: KitchenDemoFinanceDayHighlight
  quietestDay: KitchenDemoFinanceDayHighlight
  daily: KitchenDemoFinanceDay[]
  topItems: KitchenDemoFinanceItemRollup[]
  weekdayBreakdown: KitchenDemoFinanceWeekday[]
  previousTrend: KitchenDemoFinanceTrendPoint[]
  trend: KitchenDemoFinanceTrendPoint[]
}

export type KitchenDemoFinanceDayHighlight = {
  date: string
  saleCount: number
  grossSalesMinor: number
}

export type SummableDay = {
  saleCount: number
  grossSalesMinor: number
  itemQuantity: number
  itemSalesMinor: number
  deliveryFeesMinor: number
}
