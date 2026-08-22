// Concurrent edit — 2026-07-19 17:02 CEST — Delivery pass: isolate shared customer recovery projections and request helpers.
// Concurrent edit — 2026-07-20 15:37 CEST — Anonymous Order capability pass: reconstruct an amendable basket from the safe local receipt snapshot.
import type { CustomerOrderSummary } from '../../user/models/customer/order.model.ts'
import type { KitchenOrderStatus } from '../../kitchen/utils/order.ts'
import type { KitchenOrderType } from '../../kitchen/utils/order.ts'
import type { CreatedMenuOrder } from '../models/menu-ordering.model.ts'
import type { CreatedMenuOrderReceiptLine } from '../models/menu-ordering.model.ts'
import type { MenuOrderTrackingStatus } from '../composables/order/useMenuOrderTrackingSession'
import type { MenuOrderBasketLine } from '../composables/order/useMenuOrderBasket'

export function recoveredMenuOrderBasketLines(
  order: CustomerOrderSummary
): MenuOrderBasketLine[] {
  return order.items.map((item, index) => {
    const addOns = item.add_ons.map((addOn) => ({ ...addOn, priceLabel: '' }))
    const addOnTotal = addOns.reduce((sum, addOn) => sum + addOn.price, 0)
    const variant = item.variant
      ? {
          ...item.variant,
          price: Math.max(0, item.unit_price - addOnTotal),
          priceLabel: '',
        }
      : null
    const configurationKey = JSON.stringify([
      item.menu_id,
      item.id,
      variant?.id || 'base',
      ...addOns.map((addOn) => addOn.id),
    ])

    return {
      id: `${configurationKey}:${index + 1}`,
      configurationKey,
      itemId: item.id,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      variant,
      addOns,
    }
  })
}

export function createdMenuOrderBasketLines(
  items: CreatedMenuOrderReceiptLine[]
): MenuOrderBasketLine[] {
  return items.flatMap((item, index) => {
    const name = receiptItemName(item)
    const addOns = (item.add_ons || []).map((addOn) => ({
      id: addOn.id,
      label: addOn.label,
      price: Number(addOn.price) || 0,
      priceLabel: '',
    }))
    const addOnTotal = addOns.reduce((sum, addOn) => sum + addOn.price, 0)
    const basePrice = item.unit_price_chf - addOnTotal
    if (!name || !Number.isFinite(basePrice) || basePrice <= 0) return []

    const variantLabel = text(item.variant_label)
    const variant = variantLabel
      ? {
          id: text(item.variant_id) || variantLabel,
          label: variantLabel,
          price: basePrice,
          priceLabel: '',
        }
      : null
    const itemId = text(item.source_item_id) || item.id
    const configurationKey = JSON.stringify([
      text(item.menu_id),
      itemId,
      variant?.id || 'base',
      ...addOns.map((addOn) => addOn.id),
    ])

    return [
      {
        id: `${configurationKey}:${index + 1}`,
        configurationKey,
        itemId,
        name,
        quantity: item.quantity,
        unitPrice: item.unit_price_chf,
        variant,
        addOns,
      },
    ]
  })
}

export function menuOrderWaitingFor(status: KitchenOrderStatus | undefined) {
  if (status === 'pending_acceptance' || status === 'accepted') return 'kitchen'
  if (
    status === 'changes_requested' ||
    status === 'pending_payment' ||
    status === 'ready' ||
    status === 'cancelled' ||
    status === 'completed'
  )
    return 'customer'

  return ''
}

export function customerOrderRequestError(caught: unknown, fallback: string) {
  if (caught && typeof caught === 'object') {
    const source = caught as {
      data?: { statusMessage?: unknown }
      message?: unknown
      statusMessage?: unknown
    }

    return (
      text(source.data?.statusMessage) ||
      text(source.statusMessage) ||
      text(source.message) ||
      fallback
    )
  }

  return fallback
}

export function createMenuOrderRequestKey(orderType: KitchenOrderType) {
  if (import.meta.client && typeof crypto.randomUUID === 'function') {
    return `${orderType}-${crypto.randomUUID()}`
  }
  return `${orderType}-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function createdMenuOrderTrackingStatus(
  order: CreatedMenuOrder
): MenuOrderTrackingStatus {
  return {
    id: order.id,
    order_number: order.order_number,
    status: order.status,
    order_type: order.order_type,
    estimated_ready_minutes: 0,
    estimated_ready_at: '',
    ...(order.collection ? { collection: order.collection } : {}),
  }
}

export const isTerminalMenuOrderStatus = (status: KitchenOrderStatus) =>
  status === 'completed' || status === 'cancelled' || status === 'trashed'

export function isTransientCustomerOrderRequestFailure(caught: unknown) {
  const source =
    caught && typeof caught === 'object'
      ? (caught as { status?: unknown; statusCode?: unknown })
      : {}
  const status = Number(source.statusCode || source.status)

  return (
    !Number.isFinite(status) ||
    status === 0 ||
    status === 408 ||
    status === 429 ||
    status >= 500
  )
}

const text = (value: unknown) => String(value ?? '').trim()

function receiptItemName(item: CreatedMenuOrderReceiptLine) {
  const label = text(item.label)
  const variantLabel = text(item.variant_label)
  const suffix = variantLabel ? ` · ${variantLabel}` : ''

  return suffix && label.endsWith(suffix)
    ? label.slice(0, -suffix.length).trim()
    : label
}
