// Concurrent edit — 2026-07-21 17:11 CEST — Kitchen Finance surface: aggregate bounded immutable Sales without exposing raw records.
import {
  Timestamp,
  type DocumentData,
  type Firestore,
} from 'firebase-admin/firestore'
import {
  requireFinancialMinorAmount,
  requireFinancialMoney,
} from 'fireux-finance/runtime/utils/money.ts'
import type { KitchenGrossSalesReport } from '../../../models/kitchen/finance-report.model'
import { KitchenSaleSchemaVersion } from '../../../models/kitchen/sale.model'

export const KITCHEN_GROSS_SALES_REPORT_MAX_DAYS = 93
export const KITCHEN_GROSS_SALES_REPORT_MAX_SALES = 5_000

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

export class KitchenGrossSalesReportInputError extends Error {}
export class KitchenGrossSalesReportInvariantError extends Error {}
export class KitchenGrossSalesReportLimitError extends Error {}

function inputError(message: string): never {
  throw new KitchenGrossSalesReportInputError(message)
}

function invariantError(message: string): never {
  throw new KitchenGrossSalesReportInvariantError(message)
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

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
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
}) {
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

  try {
    return requireFinancialMoney(record(sale.pricing).total, {
      allowNegative: false,
      label: 'Kitchen Sale total',
    })
  } catch {
    return invariantError('A stored Kitchen Sale has an invalid total.')
  }
}

export function aggregateKitchenGrossSalesReport(input: {
  appId: string
  kitchenId: string
  range: ReportRange
  rows: readonly ReportRow[]
  generatedAt?: Date
}): KitchenGrossSalesReport {
  if (input.rows.length > KITCHEN_GROSS_SALES_REPORT_MAX_SALES) {
    throw new KitchenGrossSalesReportLimitError(
      `This period contains more than ${KITCHEN_GROSS_SALES_REPORT_MAX_SALES} Sales. Choose a shorter period.`
    )
  }
  const totals = new Map<string, { amountMinor: number; saleCount: number }>()

  for (const row of input.rows) {
    const money = validateSale({
      row,
      appId: input.appId,
      kitchenId: input.kitchenId,
      range: input.range,
    })
    const current = totals.get(money.currency_code) ?? {
      amountMinor: 0,
      saleCount: 0,
    }
    const amountMinor = requireReportMinorAmount(
      current.amountMinor + money.amount_minor,
      'Kitchen gross-sales total'
    )
    totals.set(money.currency_code, {
      amountMinor,
      saleCount: current.saleCount + 1,
    })
  }

  const generatedAt = input.generatedAt ?? new Date()
  if (!Number.isFinite(generatedAt.getTime())) {
    return invariantError('The report generation time is invalid.')
  }

  return {
    app_id: input.appId,
    kitchen_id: input.kitchenId,
    period: {
      from: input.range.from,
      to: input.range.to,
    },
    generated_at: generatedAt.toISOString(),
    sale_count: input.rows.length,
    currencies: [...totals.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([currencyCode, summary]) => ({
        currency_code: currencyCode,
        sale_count: summary.saleCount,
        gross_sales: {
          amount_minor: summary.amountMinor,
          currency_code: currencyCode,
        },
        average_sale: {
          amount_minor: requireReportMinorAmount(
            Math.round(summary.amountMinor / summary.saleCount),
            'Average Kitchen Sale'
          ),
          currency_code: currencyCode,
        },
      })),
    complete: true,
  }
}

export async function readKitchenGrossSalesReport(input: {
  db: Firestore
  appId: string
  kitchenId: string
  from: unknown
  to: unknown
}): Promise<KitchenGrossSalesReport> {
  const range = requireKitchenGrossSalesReportRange({
    from: input.from,
    to: input.to,
  })
  const snapshot = await input.db
    .collection(`apps/${input.appId}/kitchens/${input.kitchenId}/sales`)
    .where('occurred_at', '>=', range.fromTimestamp)
    .where('occurred_at', '<', range.toTimestamp)
    .orderBy('occurred_at', 'asc')
    .limit(KITCHEN_GROSS_SALES_REPORT_MAX_SALES + 1)
    .get()

  return aggregateKitchenGrossSalesReport({
    appId: input.appId,
    kitchenId: input.kitchenId,
    range,
    rows: snapshot.docs,
  })
}
