import {
  isKitchenOrderStatus,
  isKitchenOrderType,
  type KitchenOrderPaymentMethod,
  type KitchenOrderPaymentStatus,
} from '../../../../kitchen/utils/order.ts'
import type { CustomerOrderSummary } from '../../../models/customer/order.model.ts'
import type { CustomerOrderKitchenSummary } from './kitchens'

const paymentMethods = new Set<KitchenOrderPaymentMethod>([
  'online_card',
  'deposit',
  'pay_later',
  'cash',
  'card_at_pickup',
  'card_to_driver',
  'room_charge',
])
const paymentStatuses = new Set<KitchenOrderPaymentStatus>([
  'not_required',
  'requires_payment',
  'pending',
  'paid',
  'failed',
  'cancelled',
  'refunded',
])

export function projectCustomerOrderSummary(
  customerUid: string,
  id: string,
  link: Record<string, unknown>,
  order: Record<string, unknown> | undefined,
  kitchen?: CustomerOrderKitchenSummary
): CustomerOrderSummary | null {
  if (
    !order ||
    text(order.customer_uid) !== customerUid ||
    !isKitchenOrderStatus(order.status) ||
    !isKitchenOrderType(order.order_type) ||
    order.status === 'trashed'
  ) {
    return null
  }

  const collection = record(order.collection)
  const customer = record(order.customer)
  const fulfilmentMatch = record(order.fulfilment_match)
  const deliveryZone = record(fulfilmentMatch.zone)
  const payment = record(order.payment)
  const method = paymentMethods.has(payment.method as KitchenOrderPaymentMethod)
    ? (payment.method as KitchenOrderPaymentMethod)
    : undefined
  const paymentStatus = paymentStatuses.has(
    payment.status as KitchenOrderPaymentStatus
  )
    ? (payment.status as KitchenOrderPaymentStatus)
    : 'not_required'
  const collectionMode = collection.mode === 'scheduled' ? 'scheduled' : 'queue'
  const items = array(order.items).flatMap((value, index) => {
    const item = record(value)
    const name = orderItemName(item)
    const quantity = Math.max(1, number(item.quantity))
    const unitPrice = number(item.unit_price)
    if (!name || !unitPrice) return []
    const variantId = text(item.variant_id)
    const variantLabel = text(item.variant_label)
    return [
      {
        id: text(item.source_item_id) || text(item.id) || `item-${index + 1}`,
        menu_id: text(item.menu_id),
        name,
        quantity,
        unit_price: unitPrice,
        ...(variantId || variantLabel
          ? {
              variant: {
                id: variantId || variantLabel,
                label: variantLabel || variantId,
              },
            }
          : {}),
        add_ons: array(item.add_ons).flatMap((value) => {
          const addOn = record(value)
          const id = text(addOn.id)
          const label = text(addOn.label)
          const price = number(addOn.price)
          return id && label ? [{ id, label, price }] : []
        }),
      },
    ]
  })
  const orderNumber =
    text(order.order_number) ||
    (number(order.service_number) > 0
      ? String(number(order.service_number))
      : '')
  const createdAt = iso(order.created_at) || iso(record(order.created).at)
  const estimatedReadyMinutes = number(order.estimated_ready_minutes)
  const estimatedReadyAt = iso(order.estimated_ready_at)

  return {
    id,
    ...(orderNumber ? { order_number: orderNumber } : {}),
    status: order.status,
    ...(text(order.kitchen_service_id)
      ? {
          kitchen_service_id: text(order.kitchen_service_id),
          kitchen_service_name: text(order.kitchen_service_name),
        }
      : {}),
    order_type: order.order_type,
    ...(iso(order.requested_for)
      ? { requested_for: iso(order.requested_for) }
      : {}),
    ...(createdAt ? { created_at: createdAt } : {}),
    ...(estimatedReadyMinutes > 0
      ? { estimated_ready_minutes: estimatedReadyMinutes }
      : {}),
    ...(estimatedReadyAt ? { estimated_ready_at: estimatedReadyAt } : {}),
    ...(text(order.kitchen_note)
      ? { kitchen_note: text(order.kitchen_note) }
      : {}),
    item_count: items.reduce((total, item) => total + item.quantity, 0),
    items,
    kitchen: {
      id: text(link.kitchen_id),
      name: kitchen?.name || text(link.kitchen_name) || 'Kitchen',
      ...(kitchen?.path ? { path: kitchen.path } : {}),
      ...(kitchen?.logoImageUrl
        ? { logo_image_url: kitchen.logoImageUrl }
        : {}),
      ...(kitchen?.imageUrl ? { image_url: kitchen.imageUrl } : {}),
      ...(kitchen?.imageShade ? { image_shade: kitchen.imageShade } : {}),
    },
    menu: {
      id: text(link.menu_id),
      name: text(link.menu_name) || 'Menu',
      path: safeMenuPath(link.menu_path),
    },
    ...(order.order_type === 'collection'
      ? {
          collection: {
            mode: collectionMode,
            ...(iso(collection.requested_for)
              ? { requested_for: iso(collection.requested_for) }
              : {}),
          },
        }
      : {}),
    ...(order.order_type === 'delivery' && text(customer.address)
      ? {
          delivery: {
            address: text(customer.address),
            ...(text(deliveryZone.label)
              ? { zone_label: text(deliveryZone.label) }
              : {}),
            ...(number(fulfilmentMatch.fee_chf) > 0
              ? { fee_chf: number(fulfilmentMatch.fee_chf) }
              : {}),
          },
        }
      : {}),
    payment: {
      ...(method ? { method } : {}),
      status: paymentStatus,
    },
  }
}

function orderItemName(item: Record<string, unknown>) {
  const label = text(item.label)
  const variantLabel = text(item.variant_label)
  const suffix = variantLabel ? ` · ${variantLabel}` : ''
  return suffix && label.endsWith(suffix)
    ? label.slice(0, -suffix.length).trim()
    : label
}

function safeMenuPath(value: unknown) {
  const path = text(value)
  if (!path.startsWith('/') || path.startsWith('//')) return '/menus'
  const url = new URL(path, 'https://menu.invalid')
  const valid =
    /^\/(?:menus\/[^/?#]+|kitchens\/[^/?#]+\/menus\/[^/?#]+|[^/?#]+)$/
  if (
    url.origin !== 'https://menu.invalid' ||
    url.hash ||
    !valid.test(url.pathname) ||
    [...url.searchParams.keys()].some((key) => key !== 'service')
  )
    return '/menus'
  return url.pathname + url.search
}

function iso(value: unknown) {
  if (!value) return ''
  if (typeof value === 'string') {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? '' : date.toISOString()
  }
  const source = value as { toDate?: () => Date }
  return typeof source.toDate === 'function'
    ? source.toDate().toISOString()
    : ''
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function array(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function number(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function text(value: unknown) {
  return String(value ?? '').trim()
}
