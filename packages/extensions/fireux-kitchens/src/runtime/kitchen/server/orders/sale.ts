// Concurrent edit — 2026-07-21 16:27 CEST — FireUX Finance pass: derive a source-resolvable immutable Sale and gross-sale fact from Order completion.
// Concurrent edit — 2026-07-21 17:04 CEST — Misebox Nitro finance import fix: use explicit TypeScript server and model imports.
import type { FinancialFact } from 'fireux-finance/runtime/models/financial-fact.model'
import {
  buildFinancialFact,
  financialFactPath,
} from 'fireux-finance/runtime/server/finance/financial-fact'
import {
  addFinancialMoney,
  financialMoneyFromDecimal,
  multiplyFinancialMoney,
} from 'fireux-finance/runtime/utils/money'
import {
  isKitchenOrderChannel,
  isKitchenOrderType,
  type KitchenOrder,
} from '../../utils/order.ts'
import {
  KitchenSaleSchemaVersion,
  kitchenSalePath,
  type KitchenSale,
  type KitchenSaleLine,
} from '../../utils/sale.ts'
import { requireKitchenOrderPricing } from './pricing.ts'

export class KitchenSaleInvariantError extends Error {
  override name = 'KitchenSaleInvariantError'
}

function invariant(message: string): never {
  throw new KitchenSaleInvariantError(message)
}

function requiredText(value: unknown, label: string, max = 512): string {
  if (typeof value !== 'string' || !value || value.length > max) {
    return invariant(`${label} is missing or invalid.`)
  }
  return value
}

function requiredId(value: unknown, label: string): string {
  const id = requiredText(value, label)
  if (id === '.' || id === '../operations' || id.includes('/')) {
    return invariant(`${label} is not a valid document id.`)
  }
  return id
}

function optionalText(
  value: unknown,
  label: string,
  max = 512
): string | undefined {
  if (value == null || value === '') return undefined
  return requiredText(value, label, max)
}

function requireQuantity(value: unknown): number {
  if (!Number.isSafeInteger(value) || Number(value) <= 0) {
    return invariant('Sale line quantity must be a positive safe integer.')
  }
  return Number(value)
}

function buildSaleLine(
  item: KitchenOrder['items'][number],
  currencyCode: string,
  minorUnitDigits: number
): KitchenSaleLine {
  const quantity = requireQuantity(item.quantity)
  const unitPrice = financialMoneyFromDecimal({
    amount: item.unit_price as number,
    currencyCode,
    minorUnitDigits,
    allowNegative: false,
    label: 'Sale line unit price',
  })
  const lineTotal = multiplyFinancialMoney(
    unitPrice,
    quantity,
    'Sale line total'
  )
  const itemKind = optionalText(item.item_kind, 'Sale line item kind', 64)
  const variantId = optionalText(item.variant_id, 'Sale line variant id')
  const sellableId =
    item.sellable_id == null
      ? undefined
      : requiredId(item.sellable_id, 'Sale line sellable id')
  if (
    sellableId &&
    (!variantId ||
      !Number.isSafeInteger(item.sellable_revision) ||
      item.sellable_revision! < 1)
  )
    invariant('Canonical Sale line requires a variant and sellable revision.')
  const variantLabel = optionalText(
    item.variant_label,
    'Sale line variant label',
    240
  )

  return {
    id: requiredId(item.id, 'Sale line id'),
    source_item_id: requiredId(item.source_item_id, 'Sale source item id'),
    menu_id: requiredId(item.menu_id, 'Sale line Menu id'),
    dish_id: requiredId(item.dish_id, 'Sale line Dish id'),
    label: requiredText(item.label, 'Sale line label', 500),
    quantity,
    unit_price: unitPrice,
    line_total: lineTotal,
    ...(itemKind ? { item_kind: itemKind } : {}),
    ...(variantId ? { variant_id: variantId } : {}),
    ...(sellableId
      ? { sellable_id: sellableId, sellable_revision: item.sellable_revision }
      : {}),
    ...(variantLabel ? { variant_label: variantLabel } : {}),
  }
}

export function buildCompletedKitchenOrderSale<TTimestamp>(input: {
  appId: string
  kitchenId: string
  orderId: string
  order: KitchenOrder
  actorId: string
  timestamp: TTimestamp
}): {
  sale: KitchenSale<TTimestamp>
  salePath: string
  financialFact: FinancialFact<'gross_sale', TTimestamp>
  financialFactPath: string
} {
  try {
    const appId = requiredId(input.appId, 'Sale App id')
    const kitchenId = requiredId(input.kitchenId, 'Sale Kitchen id')
    const orderId = requiredId(input.orderId, 'Sale Order id')
    const actorId = requiredId(input.actorId, 'Sale actor id')
    if (input.timestamp == null) invariant('Sale timestamp is required.')
    if (input.order.status !== 'ready') {
      invariant('Only a ready Order can become a Sale.')
    }
    if (requiredId(input.order.id, 'Order id') !== orderId) {
      invariant('Order id does not match the Sale id.')
    }
    if (requiredId(input.order.kitchen_id, 'Order Kitchen id') !== kitchenId) {
      invariant('Order Kitchen id does not match the Sale Kitchen.')
    }
    if (requiredId(input.order.created.app_id, 'Order App id') !== appId) {
      invariant('Order App id does not match the Sale App.')
    }
    if (!isKitchenOrderType(input.order.order_type)) {
      invariant('Order type is invalid for Sale creation.')
    }
    if (!isKitchenOrderChannel(input.order.channel)) {
      invariant('Order channel is invalid for Sale creation.')
    }

    const pricing = requireKitchenOrderPricing(input.order.pricing)
    if (!input.order.items.length)
      invariant('Sale requires at least one Order line.')
    const lines = input.order.items.map((item) =>
      buildSaleLine(
        item,
        pricing.total.currency_code,
        pricing.minor_unit_digits
      )
    )
    const lineSubtotal = addFinancialMoney(
      lines.map((line) => line.line_total),
      'Sale line subtotal'
    )
    if (
      lineSubtotal.currency_code !== pricing.subtotal.currency_code ||
      lineSubtotal.amount_minor !== pricing.subtotal.amount_minor
    ) {
      invariant('Sale lines do not equal the canonical Order subtotal.')
    }

    const salePath = kitchenSalePath({ appId, kitchenId, saleId: orderId })
    const financialFact = buildFinancialFact({
      appId,
      kind: 'gross_sale' as const,
      subject: { kind: 'kitchen', id: kitchenId },
      source: { kind: 'kitchen_sale', id: orderId, path: salePath },
      money: pricing.total,
      occurredAt: input.timestamp,
      recordedAt: input.timestamp,
      actor: { kind: 'user', id: actorId },
    })
    const sale: KitchenSale<TTimestamp> = {
      id: orderId,
      schema_version: KitchenSaleSchemaVersion,
      app_id: appId,
      kitchen_id: kitchenId,
      menu_id: requiredId(input.order.menu_id, 'Sale Menu id'),
      order_id: orderId,
      order_path: `kitchens/${kitchenId}/orders/${orderId}`,
      order_number: requiredText(
        input.order.order_number,
        'Sale Order number',
        128
      ),
      order_type: input.order.order_type,
      channel: input.order.channel,
      lines,
      pricing,
      financial_fact_id: financialFact.id,
      occurred_at: input.timestamp,
      recorded_at: input.timestamp,
      actor: {
        kind: 'user',
        id: actorId,
      },
    }

    return {
      sale,
      salePath,
      financialFact,
      financialFactPath: financialFactPath(appId, financialFact.id),
    }
  } catch (error) {
    if (error instanceof KitchenSaleInvariantError) throw error
    throw new KitchenSaleInvariantError(
      error instanceof Error
        ? error.message
        : 'Order could not produce an immutable Sale.'
    )
  }
}
