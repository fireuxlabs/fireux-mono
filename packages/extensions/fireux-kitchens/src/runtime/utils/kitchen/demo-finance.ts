import {
  KitchenFinanceReportPeriodDays,
  type KitchenFinanceReportPeriod,
} from '../../models/kitchen/finance-report.model'
import { financialCurrencyMinorUnitDigits } from 'fireux-finance/runtime/utils/money'
import { addIsoDays } from './demo-finance-date'
import { groupItems } from './demo-finance-items'
import {
  changePercent,
  groupTrend,
  groupWeekdays,
  pickDayHighlight,
  projectDay,
  sumDays,
} from './demo-finance-rollups'
import type {
  KitchenDemoFinanceReport,
  KitchenDemoFinanceSource,
  KitchenDemoFinanceSummary,
} from './demo-finance.types'
import { requireKitchenDemoFinanceDays } from './demo-finance-validation'

export type {
  KitchenDemoFinanceDay,
  KitchenDemoFinanceItemRollup,
  KitchenDemoFinanceReport,
  KitchenDemoFinanceSource,
  KitchenDemoFinanceSummary,
  KitchenDemoFinanceTrendPoint,
  KitchenDemoFinanceWeekday,
} from './demo-finance.types'

/**
 * Projects one period from owner-local daily Demo aggregates. Current totals,
 * prior-period comparison, calendar days, item rollups and trend points always
 * reconcile to the same bounded source.
 */
export function projectKitchenDemoFinanceReport(
  finance: KitchenDemoFinanceSource,
  period: KitchenFinanceReportPeriod
): KitchenDemoFinanceReport {
  const periodDays = KitchenFinanceReportPeriodDays[period]
  const daily = requireKitchenDemoFinanceDays(finance, periodDays * 2)
  const current = daily.slice(-periodDays)
  const previous = daily.slice(-periodDays * 2, -periodDays)
  const currentSummary = sumDays(current)
  const previousSummary = sumDays(previous)
  const intervalDays = period === '7d' ? 1 : period === '30d' ? 3 : 10
  const bestDay = current.reduce((best, day) =>
    day.grossSalesMinor >= best.grossSalesMinor ? day : best
  )
  const quietestDay = current.reduce((quietest, day) =>
    day.grossSalesMinor <= quietest.grossSalesMinor ? day : quietest
  )
  const currentAverageSaleMinor = Math.round(
    currentSummary.grossSalesMinor / currentSummary.saleCount
  )
  const previousAverageSaleMinor = Math.round(
    previousSummary.grossSalesMinor / previousSummary.saleCount
  )

  return {
    period,
    asOfDate: finance.asOfDate,
    timezone: finance.timezone,
    periodFrom: current[0].date,
    periodTo: addIsoDays(current[current.length - 1].date, 1),
    currencyCode: finance.currencyCode,
    minorUnitDigits: financialCurrencyMinorUnitDigits(finance.currencyCode),
    saleCount: currentSummary.saleCount,
    grossSalesMinor: currentSummary.grossSalesMinor,
    averageSaleMinor: currentAverageSaleMinor,
    averageDailyGrossSalesMinor: Math.round(
      currentSummary.grossSalesMinor / periodDays
    ),
    itemQuantity: currentSummary.itemQuantity,
    itemSalesMinor: currentSummary.itemSalesMinor,
    deliveryFeesMinor: currentSummary.deliveryFeesMinor,
    comparison: {
      previousGrossSalesMinor: previousSummary.grossSalesMinor,
      grossSalesChangePercent: changePercent(
        currentSummary.grossSalesMinor,
        previousSummary.grossSalesMinor
      ),
      previousSaleCount: previousSummary.saleCount,
      saleCountChangePercent: changePercent(
        currentSummary.saleCount,
        previousSummary.saleCount
      ),
      previousAverageSaleMinor,
      averageSaleChangePercent: changePercent(
        currentAverageSaleMinor,
        previousAverageSaleMinor
      ),
    },
    bestDay: pickDayHighlight(bestDay),
    quietestDay: pickDayHighlight(quietestDay),
    daily: current.map(projectDay),
    topItems: groupItems(current),
    weekdayBreakdown: groupWeekdays(current),
    intervalDays,
    previousTrend: groupTrend(previous, intervalDays),
    trend: groupTrend(current, intervalDays),
  }
}
export function projectKitchenDemoFinanceSummary(
  finance: KitchenDemoFinanceSource,
  period: KitchenFinanceReportPeriod
): KitchenDemoFinanceSummary {
  const report = projectKitchenDemoFinanceReport(finance, period)
  return {
    period: report.period,
    currencyCode: report.currencyCode,
    minorUnitDigits: report.minorUnitDigits,
    saleCount: report.saleCount,
    grossSalesMinor: report.grossSalesMinor,
    averageSaleMinor: report.averageSaleMinor,
  }
}
