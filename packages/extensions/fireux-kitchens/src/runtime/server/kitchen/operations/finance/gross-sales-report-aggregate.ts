import type {
  KitchenFinanceTransactionSummary,
  KitchenGrossSalesReport,
} from '../../../../models/kitchen/finance-report.model.ts'
import {
  KITCHEN_GROSS_SALES_REPORT_MAX_LINES,
  KITCHEN_GROSS_SALES_REPORT_MAX_SALES,
  addCount,
  invariantError,
  limitError,
  money,
  requireReportMinorAmount,
  requiredId,
  type CurrencyAccumulator,
  type DailyAccumulator,
  type ReportRange,
  type ReportRow,
} from './gross-sales-report-common'
import {
  buildCurrencySummary,
  buildDailySummaries,
  createCurrencyAccumulator,
  addSaleToCurrency,
} from './gross-sales-report-accumulator'
import {
  formatLocalDate,
  localDateFormatter,
  requireCanonicalTimezone,
} from './gross-sales-report-range'
import { reconcileDailySummaries } from './gross-sales-report-reconcile'
import { validateSale } from './gross-sales-report-sale'

export function aggregateKitchenGrossSalesReport(input: {
  appId: string
  kitchenId: string
  range: ReportRange
  timezone: unknown
  rows: readonly ReportRow[]
  actorDisplayNames?: ReadonlyMap<string, string>
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
  const transactions: KitchenFinanceTransactionSummary[] = []
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
    const currency =
      totals.get(sale.currencyCode) ??
      createCurrencyAccumulator(sale.currencyCode)
    addSaleToCurrency(currency, sale, itemGroupCounter)
    totals.set(sale.currencyCode, currency)

    const date = formatLocalDate(sale.occurredAt, dateFormatter)
    const itemQuantity = sale.lines.reduce(
      (total, line) =>
        addCount(
          total,
          line.quantity,
          'Kitchen Finance transaction item quantity'
        ),
      0
    )
    const firstLine = sale.lines[0]
    transactions.push({
      source: {
        kind: 'kitchen_sale',
        id: sale.sourceId,
      },
      order_number: sale.orderNumber,
      occurred_at: sale.occurredAt.toISOString(),
      status: 'completed',
      order_type: sale.orderType,
      channel: sale.channel,
      closed_by: input.actorDisplayNames?.get(sale.closedById) ?? 'Team member',
      counterparty: 'Guest',
      summary:
        sale.lines.length === 1
          ? `${firstLine.label} · ${itemQuantity} item${itemQuantity === 1 ? '' : 's'}`
          : `${firstLine.label} + ${sale.lines.length - 1} · ${itemQuantity} items`,
      item_quantity: itemQuantity,
      signed_amount: money(sale.grossSalesMinor, sale.currencyCode),
      gross_sale: money(sale.grossSalesMinor, sale.currencyCode),
      items: sale.lines.map((line) => ({
        label: line.label,
        quantity: line.quantity,
        line_gross: money(line.lineGrossMinor, sale.currencyCode),
      })),
    })
    const day = daily.get(date) ?? {
      saleCount: 0,
      currencies: new Map(),
    }
    day.saleCount = addCount(
      day.saleCount,
      1,
      'Kitchen Finance daily Sale count'
    )
    const dailyCurrency =
      day.currencies.get(sale.currencyCode) ??
      createCurrencyAccumulator(sale.currencyCode)
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
  transactions.sort(
    (left, right) =>
      right.occurred_at.localeCompare(left.occurred_at) ||
      right.order_number.localeCompare(left.order_number)
  )
  const transactionTotals = new Map<string, number>()
  for (const transaction of transactions) {
    transactionTotals.set(
      transaction.gross_sale.currency_code,
      requireReportMinorAmount(
        (transactionTotals.get(transaction.gross_sale.currency_code) ?? 0) +
          transaction.gross_sale.amount_minor,
        'Kitchen Finance transaction total'
      )
    )
  }
  if (
    transactions.length !== input.rows.length ||
    transactionTotals.size !== currencies.length ||
    currencies.some(
      (currency) =>
        transactionTotals.get(currency.currency_code) !==
        currency.gross_sales.amount_minor
    )
  ) {
    return invariantError(
      'Kitchen Finance transactions do not reconcile to the report.'
    )
  }

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
    transactions,
    complete: true,
  }
}
