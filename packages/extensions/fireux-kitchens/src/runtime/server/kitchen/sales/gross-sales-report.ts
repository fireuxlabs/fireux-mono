// Concurrent edit — 2026-07-21 17:11 CEST — Kitchen Finance surface: aggregate bounded immutable Sales without exposing raw records.
import {
  Timestamp,
  type DocumentData,
  type Firestore,
} from 'firebase-admin/firestore'
import {
  multiplyFinancialMoney,
  requireFinancialMinorAmount,
  requireFinancialMoney,
} from 'fireux-finance/runtime/utils/money.ts'
import type { FinancialMoney } from 'fireux-finance/runtime/models/money.model.ts'
import type {
  KitchenFinanceCurrencySummary,
  KitchenFinanceDailySummary,
  KitchenFinanceItemSummary,
  KitchenFinanceReportPeriod,
  KitchenGrossSalesReport,
} from '../../../models/kitchen/finance-report.model.ts'
import {
  KitchenFinanceReportPeriodDays,
} from '../../../models/kitchen/finance-report.model.ts'
import {
  isKitchenOrderChannel,
  isKitchenOrderType,
} from '../../../models/kitchen/order.model.ts'
import { KitchenSaleSchemaVersion } from '../../../models/kitchen/sale.model.ts'
import { requireKitchenOrderPricing } from '../order/pricing.ts'

export const KITCHEN_GROSS_SALES_REPORT_MAX_DAYS = 93
export const KITCHEN_GROSS_SALES_REPORT_MAX_SALES = 5_000
export const KITCHEN_GROSS_SALES_REPORT_MAX_ITEM_GROUPS = 10_000
export const KITCHEN_GROSS_SALES_REPORT_MAX_LINES_PER_SALE = 250
export const KITCHEN_GROSS_SALES_REPORT_MAX_LINES = 25_000

const MAX_PERIOD_MS =
  KITCHEN_GROSS_SALES_REPORT_MAX_DAYS * 24 * 60 * 60 * 1_000
const RFC3339_PATTERN =
  /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):([0-5]\d):([0-5]\d)(?:\.(\d{1,3}))?(Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/

type ReportRow = {
  id: string
  data: () => DocumentData
}

type ReportRange = {
  from: string
  to: string
  fromDate: Date
  toDate: Date
  fromTimestamp: Timestamp
  toTimestamp: Timestamp
}

type ValidatedReportLine = Omit<
  KitchenFinanceItemSummary,
  'quantity' | 'sale_count' | 'line_gross'
> & {
  key: string
  quantity: number
  lineGrossMinor: number
}

type ValidatedReportSale = {
  currencyCode: string
  occurredAt: Date
  grossSalesMinor: number
  itemSalesMinor: number
  deliveryFeesMinor: number
  lines: ValidatedReportLine[]
}

type ItemAccumulator = Omit<
  KitchenFinanceItemSummary,
  'quantity' | 'sale_count' | 'line_gross'
> & {
  key: string
  quantity: number
  saleCount: number
  lineGrossMinor: number
}

type CurrencyAccumulator = {
  currencyCode: string
  saleCount: number
  itemQuantity: number
  grossSalesMinor: number
  itemSalesMinor: number
  deliveryFeesMinor: number
  items: Map<string, ItemAccumulator>
}

type DailyAccumulator = {
  saleCount: number
  currencies: Map<string, CurrencyAccumulator>
}

type ItemGroupCounter = {
  value: number
}

export class KitchenGrossSalesReportInputError extends Error {}
export class KitchenGrossSalesReportInvariantError extends Error {}
export class KitchenGrossSalesReportLimitError extends Error {}

function inputError(message: string): never {
  throw new KitchenGrossSalesReportInputError(message)
}

function invariantError(message: string): never {
  throw new KitchenGrossSalesReportInvariantError(message)
}

function limitError(message: string): never {
  throw new KitchenGrossSalesReportLimitError(message)
}

function requireReportMinorAmount(value: unknown, label: string): number {
  try {
    return requireFinancialMinorAmount(value, {
      allowNegative: false,
      label,
    })
  } catch {
    return invariantError(`${label} is not a safe non-negative integer.`)
  }
}

function requirePositiveSafeInteger(value: unknown, label: string): number {
  if (!Number.isSafeInteger(value) || Number(value) <= 0) {
    return invariantError(`${label} must be a positive safe integer.`)
  }
  return Number(value)
}

function addCount(left: number, right: number, label: string): number {
  const value = left + right
  if (!Number.isSafeInteger(value) || value < 0) {
    return invariantError(`${label} exceeds the supported safe-integer range.`)
  }
  return value
}

function requiredText(
  value: unknown,
  label: string,
  maxLength = 512
): string {
  if (
    typeof value !== 'string'
    || !value.trim()
    || value.length > maxLength
  ) {
    return invariantError(`${label} is missing or invalid.`)
  }
  return value
}

function requiredId(value: unknown, label: string): string {
  const id = requiredText(value, label)
  if (id === '.' || id === '..' || id.includes('/')) {
    return invariantError(`${label} is not a valid document id.`)
  }
  return id
}

function optionalText(
  value: unknown,
  label: string,
  maxLength = 512
): string | undefined {
  if (value == null || value === '') return undefined
  return requiredText(value, label, maxLength)
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function requireCanonicalTimezone(value: unknown): string {
  if (
    typeof value !== 'string'
    || !value
    || value !== value.trim()
    || value.length > 100
  ) {
    return invariantError(
      'Kitchen operation hours require a valid IANA timezone.'
    )
  }

  try {
    return new Intl.DateTimeFormat('en', {
      timeZone: value,
    }).resolvedOptions().timeZone
  } catch {
    return invariantError(
      'Kitchen operation hours require a valid IANA timezone.'
    )
  }
}

function localDateFormatter(timezone: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function formatLocalDate(
  date: Date,
  formatter: Intl.DateTimeFormat
): string {
  const parts = formatter.formatToParts(date)
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find(candidate => candidate.type === type)?.value ?? ''
  const year = part('year')
  const month = part('month')
  const day = part('day')
  const value = `${year}-${month}-${day}`
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return invariantError('A Kitchen Sale could not be assigned a local date.')
  }
  return value
}

function requireReportPeriod(value: unknown): KitchenFinanceReportPeriod {
  if (
    typeof value !== 'string'
    || !Object.hasOwn(KitchenFinanceReportPeriodDays, value)
  ) {
    return inputError('Report period must be 7d, 30d or 90d.')
  }
  return value as KitchenFinanceReportPeriod
}

function addLocalDateDays(value: string, days: number): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match || !Number.isSafeInteger(days)) {
    return invariantError('Kitchen Finance local-date arithmetic is invalid.')
  }
  const date = new Date(Date.UTC(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]) + days
  ))
  if (!Number.isFinite(date.getTime())) {
    return invariantError('Kitchen Finance local date is outside range.')
  }
  return date.toISOString().slice(0, 10)
}

function startOfLocalDate(
  value: string,
  formatter: Intl.DateTimeFormat
): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) {
    return invariantError('Kitchen Finance local date is invalid.')
  }
  const anchor = Date.UTC(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3])
  )
  let before = anchor - 48 * 60 * 60 * 1_000
  let atOrAfter = anchor + 48 * 60 * 60 * 1_000
  if (
    formatLocalDate(new Date(before), formatter) >= value
    || formatLocalDate(new Date(atOrAfter), formatter) < value
  ) {
    return invariantError('Kitchen Finance local date could not be bounded.')
  }

  while (atOrAfter - before > 1) {
    const middle = before + Math.floor((atOrAfter - before) / 2)
    if (formatLocalDate(new Date(middle), formatter) < value) {
      before = middle
    } else {
      atOrAfter = middle
    }
  }
  const result = new Date(atOrAfter)
  if (formatLocalDate(result, formatter) !== value) {
    return invariantError(
      'Kitchen Finance local midnight does not exist in this timezone.'
    )
  }
  return result
}

export function requireKitchenGrossSalesReportPeriodRange(input: {
  period: unknown
  timezone: unknown
  now?: Date
}) {
  const period = requireReportPeriod(input.period)
  const timezone = requireCanonicalTimezone(input.timezone)
  const now = input.now ?? new Date()
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) {
    return invariantError('Kitchen Finance current time is invalid.')
  }
  const formatter = localDateFormatter(timezone)
  const periodToDate = formatLocalDate(now, formatter)
  const periodFromDate = addLocalDateDays(
    periodToDate,
    -KitchenFinanceReportPeriodDays[period]
  )
  const fromDate = startOfLocalDate(periodFromDate, formatter)
  const toDate = startOfLocalDate(periodToDate, formatter)
  const range = requireKitchenGrossSalesReportRange({
    from: fromDate.toISOString(),
    to: toDate.toISOString(),
  })

  return {
    period,
    timezone,
    now,
    range,
  }
}

function money(amountMinor: number, currencyCode: string): FinancialMoney {
  return {
    amount_minor: requireReportMinorAmount(
      amountMinor,
      'Kitchen Finance amount'
    ),
    currency_code: currencyCode,
  }
}

function itemKey(
  item: Omit<
    KitchenFinanceItemSummary,
    'quantity' | 'sale_count' | 'line_gross'
  >
): string {
  return JSON.stringify([
    item.menu_id,
    item.source_item_id,
    item.dish_id,
    item.item_kind ?? null,
    item.variant_id ?? null,
    item.label,
    item.variant_label ?? null,
  ])
}

function parseRfc3339(value: unknown, label: string): Date {
  if (typeof value !== 'string') {
    return inputError(`${label} must be a timezone-qualified RFC3339 value.`)
  }
  const match = RFC3339_PATTERN.exec(value)
  if (!match) {
    return inputError(`${label} must be a timezone-qualified RFC3339 value.`)
  }

  const [, year, month, day, hour, minute, second, fraction = ''] = match
  const millisecond = Number(fraction.padEnd(3, '0'))
  const calendar = new Date(Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
    millisecond
  ))
  if (
    calendar.getUTCFullYear() !== Number(year) ||
    calendar.getUTCMonth() !== Number(month) - 1 ||
    calendar.getUTCDate() !== Number(day) ||
    calendar.getUTCHours() !== Number(hour) ||
    calendar.getUTCMinutes() !== Number(minute) ||
    calendar.getUTCSeconds() !== Number(second)
  ) {
    return inputError(`${label} is not a valid calendar date.`)
  }

  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) {
    return inputError(`${label} is not a valid date.`)
  }
  return date
}

export function requireKitchenGrossSalesReportRange(input: {
  from: unknown
  to: unknown
}): ReportRange {
  const fromDate = parseRfc3339(input.from, 'Report start')
  const toDate = parseRfc3339(input.to, 'Report end')
  const duration = toDate.getTime() - fromDate.getTime()
  if (duration <= 0) {
    return inputError('Report end must be after report start.')
  }
  if (duration > MAX_PERIOD_MS) {
    return inputError(
      `Report period must not exceed ${KITCHEN_GROSS_SALES_REPORT_MAX_DAYS} days.`
    )
  }

  try {
    return {
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
      fromDate,
      toDate,
      fromTimestamp: Timestamp.fromDate(fromDate),
      toTimestamp: Timestamp.fromDate(toDate),
    }
  } catch {
    return inputError('Report period is outside the supported timestamp range.')
  }
}

function validateSale(input: {
  row: ReportRow
  appId: string
  kitchenId: string
  range: ReportRange
}): ValidatedReportSale {
  if (
    !input.row
    || typeof input.row.id !== 'string'
    || typeof input.row.data !== 'function'
  ) {
    return invariantError('A stored Kitchen Sale row is invalid.')
  }
  const sale = input.row.data()
  if (
    sale.id !== input.row.id ||
    sale.order_id !== input.row.id ||
    sale.schema_version !== KitchenSaleSchemaVersion ||
    sale.app_id !== input.appId ||
    sale.kitchen_id !== input.kitchenId
  ) {
    return invariantError('A stored Kitchen Sale has invalid identity or scope.')
  }
  requiredId(sale.menu_id, 'Kitchen Sale Menu id')
  if (
    !isKitchenOrderType(sale.order_type)
    || !isKitchenOrderChannel(sale.channel)
  ) {
    return invariantError('A stored Kitchen Sale has invalid fulfilment data.')
  }

  const occurredAt = sale.occurred_at
  if (!(occurredAt instanceof Timestamp)) {
    return invariantError('A stored Kitchen Sale has an invalid occurrence time.')
  }
  const occurredAtMs = occurredAt.toMillis()
  if (
    occurredAtMs < input.range.fromDate.getTime() ||
    occurredAtMs >= input.range.toDate.getTime()
  ) {
    return invariantError('A stored Kitchen Sale falls outside the report period.')
  }

  let pricing
  try {
    pricing = requireKitchenOrderPricing(sale.pricing)
  } catch {
    return invariantError('A stored Kitchen Sale has invalid pricing.')
  }

  if (!Array.isArray(sale.lines) || sale.lines.length === 0) {
    return invariantError('A stored Kitchen Sale requires line snapshots.')
  }
  if (
    sale.lines.length
    > KITCHEN_GROSS_SALES_REPORT_MAX_LINES_PER_SALE
  ) {
    return limitError(
      `A Kitchen Sale contains more than ${KITCHEN_GROSS_SALES_REPORT_MAX_LINES_PER_SALE} line snapshots.`
    )
  }
  let lineSubtotalMinor = 0
  const lines = sale.lines.map((value: unknown, index: number) => {
    const line = record(value)
    requiredId(line.id, `Kitchen Sale line ${index + 1} id`)
    const itemKind = optionalText(
      line.item_kind,
      `Kitchen Sale line ${index + 1} item kind`,
      64
    )
    const variantId = optionalText(
      line.variant_id,
      `Kitchen Sale line ${index + 1} variant id`
    )
    const variantLabel = optionalText(
      line.variant_label,
      `Kitchen Sale line ${index + 1} variant label`,
      240
    )
    const identity = {
      menu_id: requiredId(
        line.menu_id,
        `Kitchen Sale line ${index + 1} Menu id`
      ),
      source_item_id: requiredId(
        line.source_item_id,
        `Kitchen Sale line ${index + 1} source item id`
      ),
      dish_id: requiredId(
        line.dish_id,
        `Kitchen Sale line ${index + 1} Dish id`
      ),
      label: requiredText(
        line.label,
        `Kitchen Sale line ${index + 1} label`,
        500
      ),
      ...(itemKind ? { item_kind: itemKind } : {}),
      ...(variantId ? { variant_id: variantId } : {}),
      ...(variantLabel ? { variant_label: variantLabel } : {}),
    }
    const quantity = requirePositiveSafeInteger(
      line.quantity,
      `Kitchen Sale line ${index + 1} quantity`
    )
    let unitPrice: FinancialMoney
    let lineTotal: FinancialMoney
    try {
      unitPrice = requireFinancialMoney(line.unit_price, {
        allowNegative: false,
        label: `Kitchen Sale line ${index + 1} unit price`,
      })
      lineTotal = requireFinancialMoney(line.line_total, {
        allowNegative: false,
        label: `Kitchen Sale line ${index + 1} total`,
      })
      const expectedLineTotal = multiplyFinancialMoney(
        unitPrice,
        quantity,
        `Kitchen Sale line ${index + 1} expected total`
      )
      if (
        expectedLineTotal.currency_code !== lineTotal.currency_code
        || expectedLineTotal.amount_minor !== lineTotal.amount_minor
      ) {
        return invariantError(
          `Kitchen Sale line ${index + 1} total does not match its unit price and quantity.`
        )
      }
    } catch (error) {
      if (error instanceof KitchenGrossSalesReportInvariantError) throw error
      return invariantError(
        `Kitchen Sale line ${index + 1} has invalid money.`
      )
    }
    if (
      lineTotal.currency_code !== pricing.subtotal.currency_code
      || unitPrice.currency_code !== pricing.subtotal.currency_code
    ) {
      return invariantError(
        `Kitchen Sale line ${index + 1} currency does not match its pricing.`
      )
    }
    lineSubtotalMinor = requireReportMinorAmount(
      lineSubtotalMinor + lineTotal.amount_minor,
      'Kitchen Sale line subtotal'
    )

    return {
      ...identity,
      key: itemKey(identity),
      quantity,
      lineGrossMinor: lineTotal.amount_minor,
    }
  })
  if (lineSubtotalMinor !== pricing.subtotal.amount_minor) {
    return invariantError(
      'A stored Kitchen Sale line subtotal does not match its pricing.'
    )
  }

  return {
    currencyCode: pricing.total.currency_code,
    occurredAt: new Date(occurredAtMs),
    grossSalesMinor: pricing.total.amount_minor,
    itemSalesMinor: pricing.subtotal.amount_minor,
    deliveryFeesMinor: pricing.delivery_fee.amount_minor,
    lines,
  }
}

function createCurrencyAccumulator(
  currencyCode: string
): CurrencyAccumulator {
  return {
    currencyCode,
    saleCount: 0,
    itemQuantity: 0,
    grossSalesMinor: 0,
    itemSalesMinor: 0,
    deliveryFeesMinor: 0,
    items: new Map(),
  }
}

function addItemGroup(
  summary: CurrencyAccumulator,
  line: ValidatedReportLine,
  saleItemKeys: Set<string>,
  itemGroupCounter: ItemGroupCounter
) {
  let item = summary.items.get(line.key)
  if (!item) {
    itemGroupCounter.value += 1
    if (
      itemGroupCounter.value
      > KITCHEN_GROSS_SALES_REPORT_MAX_ITEM_GROUPS
    ) {
      return limitError(
        `This period contains more than ${KITCHEN_GROSS_SALES_REPORT_MAX_ITEM_GROUPS} aggregate item groups. Choose a shorter period.`
      )
    }
    item = {
      key: line.key,
      menu_id: line.menu_id,
      source_item_id: line.source_item_id,
      dish_id: line.dish_id,
      label: line.label,
      ...(line.item_kind ? { item_kind: line.item_kind } : {}),
      ...(line.variant_id ? { variant_id: line.variant_id } : {}),
      ...(line.variant_label ? { variant_label: line.variant_label } : {}),
      quantity: 0,
      saleCount: 0,
      lineGrossMinor: 0,
    }
    summary.items.set(line.key, item)
  }

  item.quantity = addCount(
    item.quantity,
    line.quantity,
    'Kitchen Finance item quantity'
  )
  item.lineGrossMinor = requireReportMinorAmount(
    item.lineGrossMinor + line.lineGrossMinor,
    'Kitchen Finance item line gross'
  )
  if (!saleItemKeys.has(line.key)) {
    item.saleCount = addCount(
      item.saleCount,
      1,
      'Kitchen Finance item Sale count'
    )
    saleItemKeys.add(line.key)
  }
}

function addSaleToCurrency(
  summary: CurrencyAccumulator,
  sale: ValidatedReportSale,
  itemGroupCounter: ItemGroupCounter
) {
  if (summary.currencyCode !== sale.currencyCode) {
    return invariantError('Kitchen Finance currency aggregation drifted.')
  }
  summary.saleCount = addCount(
    summary.saleCount,
    1,
    'Kitchen Finance Sale count'
  )
  summary.grossSalesMinor = requireReportMinorAmount(
    summary.grossSalesMinor + sale.grossSalesMinor,
    'Kitchen gross-sales total'
  )
  summary.itemSalesMinor = requireReportMinorAmount(
    summary.itemSalesMinor + sale.itemSalesMinor,
    'Kitchen item-sales total'
  )
  summary.deliveryFeesMinor = requireReportMinorAmount(
    summary.deliveryFeesMinor + sale.deliveryFeesMinor,
    'Kitchen delivery-fees total'
  )

  const saleItemKeys = new Set<string>()
  for (const line of sale.lines) {
    summary.itemQuantity = addCount(
      summary.itemQuantity,
      line.quantity,
      'Kitchen Finance item quantity'
    )
    addItemGroup(summary, line, saleItemKeys, itemGroupCounter)
  }
}

function buildCurrencySummary(
  summary: CurrencyAccumulator
): KitchenFinanceCurrencySummary {
  if (!summary.saleCount) {
    return invariantError('Kitchen Finance cannot expose an empty currency.')
  }
  const expectedGross = requireReportMinorAmount(
    summary.itemSalesMinor + summary.deliveryFeesMinor,
    'Kitchen item sales plus delivery fees'
  )
  if (expectedGross !== summary.grossSalesMinor) {
    return invariantError(
      'Kitchen Finance item sales plus delivery fees do not equal gross sales.'
    )
  }

  const items = [...summary.items.values()]
    .sort((left, right) =>
      right.lineGrossMinor - left.lineGrossMinor
      || left.label.localeCompare(right.label)
      || left.key.localeCompare(right.key)
    )
    .map<KitchenFinanceItemSummary>((item) => ({
      menu_id: item.menu_id,
      source_item_id: item.source_item_id,
      dish_id: item.dish_id,
      label: item.label,
      ...(item.item_kind ? { item_kind: item.item_kind } : {}),
      ...(item.variant_id ? { variant_id: item.variant_id } : {}),
      ...(item.variant_label ? { variant_label: item.variant_label } : {}),
      quantity: item.quantity,
      sale_count: item.saleCount,
      line_gross: money(item.lineGrossMinor, summary.currencyCode),
    }))
  const itemQuantity = items.reduce(
    (total, item) => addCount(
      total,
      item.quantity,
      'Kitchen Finance reconciled item quantity'
    ),
    0
  )
  const itemSalesMinor = items.reduce(
    (total, item) => requireReportMinorAmount(
      total + item.line_gross.amount_minor,
      'Kitchen Finance reconciled item sales'
    ),
    0
  )
  if (
    itemQuantity !== summary.itemQuantity
    || itemSalesMinor !== summary.itemSalesMinor
  ) {
    return invariantError(
      'Kitchen Finance item rollups do not reconcile to their currency summary.'
    )
  }

  return {
    currency_code: summary.currencyCode,
    sale_count: summary.saleCount,
    gross_sales: money(summary.grossSalesMinor, summary.currencyCode),
    average_sale: money(
      Math.round(summary.grossSalesMinor / summary.saleCount),
      summary.currencyCode
    ),
    item_quantity: summary.itemQuantity,
    item_sales: money(summary.itemSalesMinor, summary.currencyCode),
    delivery_fees: money(summary.deliveryFeesMinor, summary.currencyCode),
    items,
  }
}

function buildDailySummaries(
  daily: Map<string, DailyAccumulator>
): KitchenFinanceDailySummary[] {
  return [...daily.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, summary]) => {
      const currencies = [...summary.currencies.values()]
        .sort((left, right) =>
          left.currencyCode.localeCompare(right.currencyCode)
        )
        .map(buildCurrencySummary)
      const saleCount = currencies.reduce(
        (total, currency) => addCount(
          total,
          currency.sale_count,
          'Kitchen Finance daily Sale count'
        ),
        0
      )
      if (saleCount !== summary.saleCount) {
        return invariantError(
          'Kitchen Finance daily currency totals do not reconcile.'
        )
      }
      return {
        date,
        sale_count: summary.saleCount,
        currencies,
      }
    })
}

function reconcileDailySummaries(
  currencies: readonly KitchenFinanceCurrencySummary[],
  daily: readonly KitchenFinanceDailySummary[],
  expectedSaleCount: number
) {
  type ReconciledCurrency = {
    saleCount: number
    itemQuantity: number
    grossSalesMinor: number
    itemSalesMinor: number
    deliveryFeesMinor: number
    items: Map<string, {
      quantity: number
      saleCount: number
      lineGrossMinor: number
    }>
  }
  const reconciled = new Map<string, ReconciledCurrency>()
  let dailySaleCount = 0
  for (const day of daily) {
    dailySaleCount = addCount(
      dailySaleCount,
      day.sale_count,
      'Kitchen Finance report daily Sale count'
    )
    for (const summary of day.currencies) {
      const currency = reconciled.get(summary.currency_code) ?? {
        saleCount: 0,
        itemQuantity: 0,
        grossSalesMinor: 0,
        itemSalesMinor: 0,
        deliveryFeesMinor: 0,
        items: new Map(),
      }
      currency.saleCount = addCount(
        currency.saleCount,
        summary.sale_count,
        'Kitchen Finance reconciled Sale count'
      )
      currency.itemQuantity = addCount(
        currency.itemQuantity,
        summary.item_quantity,
        'Kitchen Finance reconciled item quantity'
      )
      currency.grossSalesMinor = requireReportMinorAmount(
        currency.grossSalesMinor + summary.gross_sales.amount_minor,
        'Kitchen Finance reconciled gross sales'
      )
      currency.itemSalesMinor = requireReportMinorAmount(
        currency.itemSalesMinor + summary.item_sales.amount_minor,
        'Kitchen Finance reconciled item sales'
      )
      currency.deliveryFeesMinor = requireReportMinorAmount(
        currency.deliveryFeesMinor + summary.delivery_fees.amount_minor,
        'Kitchen Finance reconciled delivery fees'
      )
      for (const item of summary.items) {
        const key = itemKey(item)
        const current = currency.items.get(key) ?? {
          quantity: 0,
          saleCount: 0,
          lineGrossMinor: 0,
        }
        current.quantity = addCount(
          current.quantity,
          item.quantity,
          'Kitchen Finance reconciled item quantity'
        )
        current.saleCount = addCount(
          current.saleCount,
          item.sale_count,
          'Kitchen Finance reconciled item Sale count'
        )
        current.lineGrossMinor = requireReportMinorAmount(
          current.lineGrossMinor + item.line_gross.amount_minor,
          'Kitchen Finance reconciled item line gross'
        )
        currency.items.set(key, current)
      }
      reconciled.set(summary.currency_code, currency)
    }
  }

  if (
    dailySaleCount !== expectedSaleCount
    || reconciled.size !== currencies.length
  ) {
    return invariantError(
      'Kitchen Finance daily summaries do not reconcile to the report.'
    )
  }
  for (const summary of currencies) {
    const current = reconciled.get(summary.currency_code)
    if (
      !current
      || current.saleCount !== summary.sale_count
      || current.itemQuantity !== summary.item_quantity
      || current.grossSalesMinor !== summary.gross_sales.amount_minor
      || current.itemSalesMinor !== summary.item_sales.amount_minor
      || current.deliveryFeesMinor !== summary.delivery_fees.amount_minor
      || current.items.size !== summary.items.length
    ) {
      return invariantError(
        'Kitchen Finance daily currency summaries do not reconcile.'
      )
    }
    for (const item of summary.items) {
      const reconciledItem = current.items.get(itemKey(item))
      if (
        !reconciledItem
        || reconciledItem.quantity !== item.quantity
        || reconciledItem.saleCount !== item.sale_count
        || reconciledItem.lineGrossMinor !== item.line_gross.amount_minor
      ) {
        return invariantError(
          'Kitchen Finance daily item rollups do not reconcile.'
        )
      }
    }
  }
}

export function aggregateKitchenGrossSalesReport(input: {
  appId: string
  kitchenId: string
  range: ReportRange
  timezone: unknown
  rows: readonly ReportRow[]
  generatedAt?: Date
}): KitchenGrossSalesReport {
  const appId = requiredId(input.appId, 'Kitchen Finance App id')
  const kitchenId = requiredId(input.kitchenId, 'Kitchen Finance Kitchen id')
  const timezone = requireCanonicalTimezone(input.timezone)
  if (!Array.isArray(input.rows)) {
    return invariantError('Kitchen Finance Sales must be a bounded array.')
  }
  if (input.rows.length > KITCHEN_GROSS_SALES_REPORT_MAX_SALES) {
    return limitError(
      `This period contains more than ${KITCHEN_GROSS_SALES_REPORT_MAX_SALES} Sales. Choose a shorter period.`
    )
  }
  const totals = new Map<string, CurrencyAccumulator>()
  const daily = new Map<string, DailyAccumulator>()
  const itemGroupCounter = { value: 0 }
  const seenRows = new Set<string>()
  const dateFormatter = localDateFormatter(timezone)
  let lineSnapshotCount = 0

  for (const row of input.rows) {
    if (!row || typeof row.id !== 'string') {
      return invariantError('A stored Kitchen Sale row is invalid.')
    }
    if (seenRows.has(row.id)) {
      return invariantError('Kitchen Finance received a duplicate Sale row.')
    }
    seenRows.add(row.id)
    const sale = validateSale({
      row,
      appId,
      kitchenId,
      range: input.range,
    })
    lineSnapshotCount = addCount(
      lineSnapshotCount,
      sale.lines.length,
      'Kitchen Finance line-snapshot count'
    )
    if (lineSnapshotCount > KITCHEN_GROSS_SALES_REPORT_MAX_LINES) {
      return limitError(
        `This period contains more than ${KITCHEN_GROSS_SALES_REPORT_MAX_LINES} line snapshots. Choose a shorter period.`
      )
    }
    const currency = totals.get(sale.currencyCode)
      ?? createCurrencyAccumulator(sale.currencyCode)
    addSaleToCurrency(currency, sale, itemGroupCounter)
    totals.set(sale.currencyCode, currency)

    const date = formatLocalDate(sale.occurredAt, dateFormatter)
    const day = daily.get(date) ?? {
      saleCount: 0,
      currencies: new Map(),
    }
    day.saleCount = addCount(
      day.saleCount,
      1,
      'Kitchen Finance daily Sale count'
    )
    const dailyCurrency = day.currencies.get(sale.currencyCode)
      ?? createCurrencyAccumulator(sale.currencyCode)
    addSaleToCurrency(dailyCurrency, sale, itemGroupCounter)
    day.currencies.set(sale.currencyCode, dailyCurrency)
    daily.set(date, day)
  }

  const generatedAt = input.generatedAt ?? new Date()
  if (!Number.isFinite(generatedAt.getTime())) {
    return invariantError('The report generation time is invalid.')
  }
  const currencies = [...totals.values()]
    .sort((left, right) => left.currencyCode.localeCompare(right.currencyCode))
    .map(buildCurrencySummary)
  const dailySummaries = buildDailySummaries(daily)
  reconcileDailySummaries(currencies, dailySummaries, input.rows.length)

  return {
    app_id: appId,
    kitchen_id: kitchenId,
    period: {
      from: input.range.from,
      to: input.range.to,
    },
    timezone,
    generated_at: generatedAt.toISOString(),
    sale_count: input.rows.length,
    currencies,
    daily: dailySummaries,
    complete: true,
  }
}

export async function readKitchenGrossSalesReport(input: {
  db: Firestore
  appId: string
  kitchenId: string
  period: unknown
  timezone: unknown
  now?: Date
}): Promise<KitchenGrossSalesReport> {
  const appId = requiredId(input.appId, 'Kitchen Finance App id')
  const kitchenId = requiredId(input.kitchenId, 'Kitchen Finance Kitchen id')
  const selection = requireKitchenGrossSalesReportPeriodRange({
    period: input.period,
    timezone: input.timezone,
    ...(input.now ? { now: input.now } : {}),
  })
  const snapshot = await input.db
    .collection(`apps/${appId}/kitchens/${kitchenId}/sales`)
    .where('occurred_at', '>=', selection.range.fromTimestamp)
    .where('occurred_at', '<', selection.range.toTimestamp)
    .orderBy('occurred_at', 'asc')
    .limit(KITCHEN_GROSS_SALES_REPORT_MAX_SALES + 1)
    .get()

  return aggregateKitchenGrossSalesReport({
    appId,
    kitchenId,
    range: selection.range,
    timezone: selection.timezone,
    rows: snapshot.docs,
    generatedAt: selection.now,
  })
}
