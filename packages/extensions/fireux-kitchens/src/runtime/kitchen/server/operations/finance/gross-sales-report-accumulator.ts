import type {
  KitchenFinanceCurrencySummary,
  KitchenFinanceDailySummary,
  KitchenFinanceItemSummary,
} from '../../../models/finance-report.model.ts'
import {
  KITCHEN_GROSS_SALES_REPORT_MAX_ITEM_GROUPS,
  addCount,
  invariantError,
  limitError,
  money,
  requireReportMinorAmount,
  type CurrencyAccumulator,
  type DailyAccumulator,
  type ItemGroupCounter,
  type ValidatedReportLine,
  type ValidatedReportSale,
} from './gross-sales-report-common'

export function createCurrencyAccumulator(
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

export function addItemGroup(
  summary: CurrencyAccumulator,
  line: ValidatedReportLine,
  saleItemKeys: Set<string>,
  itemGroupCounter: ItemGroupCounter
) {
  let item = summary.items.get(line.key)
  if (!item) {
    itemGroupCounter.value += 1
    if (itemGroupCounter.value > KITCHEN_GROSS_SALES_REPORT_MAX_ITEM_GROUPS) {
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

export function addSaleToCurrency(
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

export function buildCurrencySummary(
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
    .sort(
      (left, right) =>
        right.lineGrossMinor - left.lineGrossMinor ||
        left.label.localeCompare(right.label) ||
        left.key.localeCompare(right.key)
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
    (total, item) =>
      addCount(
        total,
        item.quantity,
        'Kitchen Finance reconciled item quantity'
      ),
    0
  )
  const itemSalesMinor = items.reduce(
    (total, item) =>
      requireReportMinorAmount(
        total + item.line_gross.amount_minor,
        'Kitchen Finance reconciled item sales'
      ),
    0
  )
  if (
    itemQuantity !== summary.itemQuantity ||
    itemSalesMinor !== summary.itemSalesMinor
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

export function buildDailySummaries(
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
        (total, currency) =>
          addCount(
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
