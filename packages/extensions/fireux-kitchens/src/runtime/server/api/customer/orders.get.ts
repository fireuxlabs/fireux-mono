import { defineEventHandler, getQuery } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import {
  isKitchenOrderStatus,
  isKitchenOrderType,
  type KitchenOrderPaymentMethod,
  type KitchenOrderPaymentStatus,
} from '../../../models/kitchen/order.model.ts'
import type {
  CustomerOrderPage,
  CustomerOrderSummary,
} from '../../../models/customer/order.model.ts'

const PAGE_SIZE = 24
const ORDER_PATH = /^apps\/([^/]+)\/kitchens\/([^/]+)\/orders\/([^/]+)$/
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

export default defineEventHandler(async (event): Promise<CustomerOrderPage> => {
  const { uid } = await requireFirebaseBearerUser(event)
  const db = getRuntimeFirestore()
  const links = db.collection(`customers/${uid}/orders`)
  const cursor = text(getQuery(event).cursor)
  let query = links.orderBy('created_at', 'desc').limit(PAGE_SIZE)

  if (cursor) {
    const cursorSnap = await links.doc(cursor).get()
    if (cursorSnap.exists) query = query.startAfter(cursorSnap)
  }

  const page = await query.get()
  const candidates = page.docs.flatMap((linkSnap) => {
    const link = linkSnap.data()
    const orderPath = text(link.order_path)
    const match = orderPath.match(ORDER_PATH)
    if (!match || match[3] !== linkSnap.id) return []

    return [{
      linkId: linkSnap.id,
      link,
      orderRef: db.doc(orderPath),
    }]
  })
  const orderSnaps = candidates.length
    ? await db.getAll(...candidates.map(candidate => candidate.orderRef))
    : []
  const items = candidates.flatMap((candidate, index) => {
    const orderSnap = orderSnaps[index]
    if (!orderSnap?.exists) return []

    const summary = customerOrderSummary(uid, candidate.linkId, candidate.link, orderSnap.data())
    return summary ? [summary] : []
  })

  return {
    items,
    nextCursor: page.size === PAGE_SIZE
      ? page.docs.at(-1)?.id || null
      : null,
  }
})

function customerOrderSummary(
  customerUid: string,
  id: string,
  link: Record<string, unknown>,
  order: Record<string, unknown> | undefined
): CustomerOrderSummary | null {
  if (
    !order
    || text(order.customer_uid) !== customerUid
    || !isKitchenOrderStatus(order.status)
    || !isKitchenOrderType(order.order_type)
  ) {
    return null
  }
  if (order.status === 'trashed') return null

  const collection = record(order.collection)
  const payment = record(order.payment)
  const method = paymentMethods.has(payment.method as KitchenOrderPaymentMethod)
    ? payment.method as KitchenOrderPaymentMethod
    : undefined
  const paymentStatus = paymentStatuses.has(payment.status as KitchenOrderPaymentStatus)
    ? payment.status as KitchenOrderPaymentStatus
    : 'not_required'
  const collectionMode = collection.mode === 'scheduled' ? 'scheduled' : 'queue'

  return {
    id,
    order_number: text(order.order_number) || String(number(order.service_number)),
    status: order.status,
    order_type: order.order_type,
    created_at: iso(order.created_at) || iso(record(order.created).at),
    estimated_ready_minutes: number(order.estimated_ready_minutes),
    estimated_ready_at: iso(order.estimated_ready_at),
    item_count: array(order.items).reduce(
      (total, item) => total + Math.max(1, number(record(item).quantity)),
      0
    ),
    kitchen: {
      id: text(link.kitchen_id),
      name: text(link.kitchen_name) || 'Kitchen',
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
    payment: {
      ...(method ? { method } : {}),
      status: paymentStatus,
    },
  }
}

function safeMenuPath(value: unknown) {
  const path = text(value)
  const valid = /^\/(?:menus\/[^/?#]+|kitchens\/[^/?#]+\/menus\/[^/?#]+|[^/?#]+)$/
  return valid.test(path) ? path : '/menus'
}

function iso(value: unknown) {
  if (!value) return ''
  if (typeof value === 'string') {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? '' : date.toISOString()
  }
  const source = value as { toDate?: () => Date }
  return typeof source.toDate === 'function' ? source.toDate().toISOString() : ''
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
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
