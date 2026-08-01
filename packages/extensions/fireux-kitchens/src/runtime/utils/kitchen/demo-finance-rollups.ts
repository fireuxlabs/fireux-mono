import { requireFinancialMinorAmount } from 'fireux-finance/runtime/utils/money.ts'
import type {
  KitchenDemoFinanceDay,
  KitchenDemoFinanceDayHighlight,
  KitchenDemoFinanceSource,
  KitchenDemoFinanceTrendPoint,
  KitchenDemoFinanceWeekday,
  SummableDay,
} from './demo-finance.types'
import { itemKey } from './demo-finance-items'

const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const

export function sumDays(days: readonly SummableDay[]) {
  return days.reduce(
    (summary, day) => ({
      saleCount: summary.saleCount + day.saleCount,
      itemQuantity: summary.itemQuantity + day.itemQuantity,
      grossSalesMinor: requireFinancialMinorAmount(
        summary.grossSalesMinor + day.grossSalesMinor,
        {
          allowNegative: false,
          label: 'Kitchen Demo gross-sales total',
        }
      ),
      itemSalesMinor: requireFinancialMinorAmount(
        summary.itemSalesMinor + day.itemSalesMinor,
        {
          allowNegative: false,
          label: 'Kitchen Demo item-sales total',
        }
      ),
      deliveryFeesMinor: requireFinancialMinorAmount(
        summary.deliveryFeesMinor + day.deliveryFeesMinor,
        {
          allowNegative: false,
          label: 'Kitchen Demo delivery-fees total',
        }
      ),
    }),
    {
      saleCount: 0,
      itemQuantity: 0,
      grossSalesMinor: 0,
      itemSalesMinor: 0,
      deliveryFeesMinor: 0,
    }
  )
}

export function groupTrend(
  days: readonly (SummableDay & { date: string })[],
  intervalDays: number
): KitchenDemoFinanceTrendPoint[] {
  const points: KitchenDemoFinanceTrendPoint[] = []
  for (let index = 0; index < days.length; index += intervalDays) {
    const group = days.slice(index, index + intervalDays)
    const summary = sumDays(group)
    const fromDate = group[0].date
    const toDate = group[group.length - 1].date
    points.push({
      id: `${fromDate}:${toDate}`,
      fromDate,
      toDate,
      saleCount: summary.saleCount,
      grossSalesMinor: summary.grossSalesMinor,
    })
  }
  return points
}

export function changePercent(current: number, previous: number) {
  return Math.round(((current - previous) / previous) * 1_000) / 10
}

export function projectDay(
  day: KitchenDemoFinanceSource['dailyGrossSales'][number]
): KitchenDemoFinanceDay {
  return {
    date: day.date,
    saleCount: day.saleCount,
    grossSalesMinor: day.grossSalesMinor,
    averageSaleMinor: Math.round(day.grossSalesMinor / day.saleCount),
    itemQuantity: day.itemQuantity,
    itemSalesMinor: day.itemSalesMinor,
    deliveryFeesMinor: day.deliveryFeesMinor,
    items: day.items.map(item => ({
      id: itemKey(item),
      ...item,
      sharePercent: Math.round(
        item.lineGrossMinor / day.itemSalesMinor * 1_000
      ) / 10,
    })),
  }
}

export function pickDayHighlight(day: {
  date: string
  saleCount: number
  grossSalesMinor: number
}): KitchenDemoFinanceDayHighlight {
  return {
    date: day.date,
    saleCount: day.saleCount,
    grossSalesMinor: day.grossSalesMinor,
  }
}

export function groupWeekdays(
  days: readonly KitchenDemoFinanceSource['dailyGrossSales'][number][]
): KitchenDemoFinanceWeekday[] {
  return WEEKDAY_ORDER.map((weekday) => {
    const matching = days.filter(day =>
      new Date(`${day.date}T00:00:00.000Z`).getUTCDay() === weekday
    )
    const summary = sumDays(matching)
    return {
      id: String(weekday),
      weekday,
      dayCount: matching.length,
      saleCount: summary.saleCount,
      itemQuantity: summary.itemQuantity,
      grossSalesMinor: summary.grossSalesMinor,
      averageDailyGrossSalesMinor: Math.round(
        summary.grossSalesMinor / matching.length
      ),
    }
  })
}
