import { Timestamp } from 'firebase-admin/firestore'
import type { FinancialMoney } from 'fireux-finance/runtime/models/money.model'
import {
  multiplyFinancialMoney,
  requireFinancialMoney,
} from 'fireux-finance/runtime/utils/money'
import {
  isKitchenOrderChannel,
  isKitchenOrderType,
} from '../../../models/kitchen/order.model.ts'
import { KitchenSaleSchemaVersion } from '../../../models/kitchen/sale.model.ts'
import { requireKitchenOrderPricing } from '../order/pricing.ts'
import {
  KITCHEN_GROSS_SALES_REPORT_MAX_LINES_PER_SALE,
  KitchenGrossSalesReportInvariantError,
  invariantError,
  itemKey,
  limitError,
  optionalText,
  record,
  requirePositiveSafeInteger,
  requireReportMinorAmount,
  requiredId,
  requiredText,
  type ReportRange,
  type ReportRow,
  type ValidatedReportSale,
} from './gross-sales-report-common'

export function validateSale(input: {
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
    sourceId: input.row.id,
    closedById: requiredId(
      record(sale.actor).id,
      'Kitchen Sale closing user id'
    ),
    orderNumber: requiredText(sale.order_number, 'Kitchen Sale order number', 120),
    orderType: sale.order_type,
    channel: sale.channel,
    currencyCode: pricing.total.currency_code,
    occurredAt: new Date(occurredAtMs),
    grossSalesMinor: pricing.total.amount_minor,
    itemSalesMinor: pricing.subtotal.amount_minor,
    deliveryFeesMinor: pricing.delivery_fee.amount_minor,
    lines,
  }
}
