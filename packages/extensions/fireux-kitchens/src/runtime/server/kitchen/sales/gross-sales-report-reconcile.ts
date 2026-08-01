import type {
  KitchenFinanceCurrencySummary,
  KitchenFinanceDailySummary,
} from '../../../models/kitchen/finance-report.model.ts'
import {
  addCount,
  invariantError,
  itemKey,
  requireReportMinorAmount,
} from './gross-sales-report-common'

export function reconcileDailySummaries(
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
