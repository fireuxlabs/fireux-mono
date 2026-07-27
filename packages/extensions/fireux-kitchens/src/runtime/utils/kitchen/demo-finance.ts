import type { KitchenFinanceReportPeriod } from '../../models/kitchen/finance-report.model'
import {
  financialCurrencyMinorUnitDigits,
  requireFinancialMinorAmount,
} from 'fireux-finance/runtime/utils/money.ts'
import {
  KitchenFinanceReportPeriodDays,
} from '../../models/kitchen/finance-report.model'

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

type KitchenDemoFinanceDayHighlight = {
  date: string
  saleCount: number
  grossSalesMinor: number
}

type SummableDay = {
  saleCount: number
  grossSalesMinor: number
  itemQuantity: number
  itemSalesMinor: number
  deliveryFeesMinor: number
}

const DAY_MS = 86_400_000
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const MAX_DAILY_ITEM_GROUPS = 100
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const

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

function requireKitchenDemoFinanceDays(
  finance: KitchenDemoFinanceSource,
  minimumDays: number
) {
  if (
    !ISO_DATE_PATTERN.test(finance.asOfDate)
    || !/^[A-Z]{3}$/.test(finance.currencyCode)
    || !validTimezone(finance.timezone)
    || !Array.isArray(finance.dailyGrossSales)
    || finance.dailyGrossSales.length < minimumDays
    || finance.dailyGrossSales.length > 366
  ) {
    throw new Error('Kitchen Demo Finance source is incomplete.')
  }
  financialCurrencyMinorUnitDigits(finance.currencyCode)

  const seenDates = new Set<string>()
  const daily = finance.dailyGrossSales.map((day, index) => {
    if (
      !ISO_DATE_PATTERN.test(day.date)
      || seenDates.has(day.date)
      || !Number.isSafeInteger(day.saleCount)
      || day.saleCount <= 0
    ) {
      throw new Error(`Kitchen Demo Finance day ${index + 1} is invalid.`)
    }
    requireFinancialMinorAmount(day.grossSalesMinor, {
      allowNegative: false,
      allowZero: false,
      label: `Kitchen Demo gross sales for ${day.date}`,
    })
    requireFinancialMinorAmount(day.itemSalesMinor, {
      allowNegative: false,
      allowZero: false,
      label: `Kitchen Demo item sales for ${day.date}`,
    })
    requireFinancialMinorAmount(day.deliveryFeesMinor, {
      allowNegative: false,
      label: `Kitchen Demo delivery fees for ${day.date}`,
    })
    if (
      !Number.isSafeInteger(day.itemQuantity)
      || day.itemQuantity <= 0
      || !Array.isArray(day.items)
      || day.items.length === 0
      || day.items.length > MAX_DAILY_ITEM_GROUPS
    ) {
      throw new Error(`Kitchen Demo Finance items for ${day.date} are invalid.`)
    }

    const itemKeys = new Set<string>()
    const itemSummary = day.items.reduce(
      (summary, item, itemIndex) => {
        const key = itemKey(item)
        if (
          !key
          || itemKeys.has(key)
          || !Number.isSafeInteger(item.quantity)
          || item.quantity <= 0
          || !Number.isSafeInteger(item.saleCount)
          || item.saleCount <= 0
          || item.saleCount > item.quantity
          || item.saleCount > day.saleCount
        ) {
          throw new Error(
            `Kitchen Demo Finance item ${itemIndex + 1} for ${day.date} is invalid.`
          )
        }
        requireFinancialMinorAmount(item.lineGrossMinor, {
          allowNegative: false,
          allowZero: false,
          label: `Kitchen Demo item sales for ${item.label}`,
        })
        itemKeys.add(key)
        return {
          quantity: summary.quantity + item.quantity,
          lineGrossMinor: requireFinancialMinorAmount(
            summary.lineGrossMinor + item.lineGrossMinor,
            {
              allowNegative: false,
              label: `Kitchen Demo item-sales total for ${day.date}`,
            }
          ),
        }
      },
      { quantity: 0, lineGrossMinor: 0 }
    )
    if (
      itemSummary.quantity !== day.itemQuantity
      || itemSummary.quantity < day.saleCount
      || itemSummary.lineGrossMinor !== day.itemSalesMinor
      || day.itemSalesMinor + day.deliveryFeesMinor !== day.grossSalesMinor
    ) {
      throw new Error(
        `Kitchen Demo Finance totals for ${day.date} do not reconcile.`
      )
    }
    seenDates.add(day.date)

    if (
      index > 0
      && day.date !== addIsoDays(finance.dailyGrossSales[index - 1].date, 1)
    ) {
      throw new Error('Kitchen Demo Finance days must be contiguous.')
    }
    return {
      ...day,
      items: day.items.map(item => ({ ...item })),
    }
  })

  if (daily[daily.length - 1].date !== finance.asOfDate) {
    throw new Error('Kitchen Demo Finance must end on its as-of date.')
  }
  return daily
}

function addIsoDays(date: string, days: number) {
  const timestamp = Date.parse(`${date}T00:00:00.000Z`)
  if (!Number.isFinite(timestamp)) {
    throw new Error(`Kitchen Demo Finance date is invalid: ${date}.`)
  }
  return new Date(timestamp + days * DAY_MS).toISOString().slice(0, 10)
}

function sumDays(days: readonly SummableDay[]) {
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

function groupTrend(
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

function changePercent(current: number, previous: number) {
  return Math.round(((current - previous) / previous) * 1_000) / 10
}

function itemKey(item: {
  menuId: string
  sourceItemId: string
  dishId: string
  label: string
  variantId?: string
  variantLabel?: string
}) {
  const parts = [
    item.menuId,
    item.sourceItemId,
    item.dishId,
    item.label,
    item.variantId ?? '',
    item.variantLabel ?? '',
  ].map(value => String(value ?? '').trim())
  return parts.slice(0, 4).every(Boolean) ? parts.join(':') : ''
}

function projectDay(
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

function pickDayHighlight(day: {
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

function groupItems(
  days: readonly KitchenDemoFinanceSource['dailyGrossSales'][number][]
): KitchenDemoFinanceItemRollup[] {
  const totals = new Map<
    string,
    Omit<KitchenDemoFinanceItemRollup, 'sharePercent'>
  >()
  for (const day of days) {
    for (const item of day.items) {
      const id = itemKey(item)
      const current = totals.get(id)
      totals.set(id, {
        id,
        menuId: item.menuId,
        sourceItemId: item.sourceItemId,
        dishId: item.dishId,
        label: item.label,
        ...(item.itemKind ? { itemKind: item.itemKind } : {}),
        ...(item.variantId ? { variantId: item.variantId } : {}),
        ...(item.variantLabel ? { variantLabel: item.variantLabel } : {}),
        quantity: (current?.quantity ?? 0) + item.quantity,
        saleCount: (current?.saleCount ?? 0) + item.saleCount,
        lineGrossMinor: requireFinancialMinorAmount(
          (current?.lineGrossMinor ?? 0) + item.lineGrossMinor,
          {
            allowNegative: false,
            label: `Kitchen Demo item total for ${item.label}`,
          }
        ),
      })
    }
  }
  const itemSalesMinor = days.reduce(
    (total, day) => total + day.itemSalesMinor,
    0
  )
  return [...totals.values()]
    .sort((left, right) =>
      right.lineGrossMinor - left.lineGrossMinor
      || left.label.localeCompare(right.label)
    )
    .map(item => ({
      ...item,
      sharePercent: Math.round(
        item.lineGrossMinor / itemSalesMinor * 1_000
      ) / 10,
    }))
}

function groupWeekdays(
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

function validTimezone(value: string) {
  try {
    new Intl.DateTimeFormat('en-GB', { timeZone: value }).format(new Date(0))
    return Boolean(value)
  } catch {
    return false
  }
}
