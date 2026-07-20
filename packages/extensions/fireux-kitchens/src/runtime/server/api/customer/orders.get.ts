// Concurrent edit — 2026-07-19 17:02 CEST — Delivery pass: expose canonical Delivery address and timing in customer projection.
// Concurrent edit — 2026-07-20 15:37 CEST — Anonymous Order capability pass: recover source item identity for signed-in amend resubmission.
// Concurrent edit — 2026-07-20 22:37 CEST — Place-root authority pass: join the concrete Place runtime model and omit absent customer Order values.
import { defineEventHandler, getQuery } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { PlaceStorage } from 'fireux-places/runtime/models/place.model.ts'
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
import { menuKitchenIdentity } from '../../menu/ownership/kitchen-scope.ts'

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
  const kitchens = await customerKitchenHydration(
    db,
    candidates.map(candidate => candidate.link)
  )
  const items = candidates.flatMap((candidate, index) => {
    const orderSnap = orderSnaps[index]
    if (!orderSnap?.exists) return []

    const summary = customerOrderSummary(
      uid,
      candidate.linkId,
      candidate.link,
      orderSnap.data(),
      kitchens.get(kitchenKey(candidate.link))
    )
    return summary ? [summary] : []
  })

  return {
    items,
    nextCursor: page.size === PAGE_SIZE
      ? page.docs.at(-1)?.id || null
      : null,
    ...(import.meta.dev
      ? {
          debug: {
            customer_uid: uid,
            link_count: page.size,
            candidate_count: candidates.length,
            resolved_order_count: orderSnaps.filter(snapshot => snapshot.exists).length,
            visible_order_count: items.length,
            omitted_count: page.size - items.length,
            statuses: items.map(item => ({
              id: item.id,
              status: item.status,
              order_type: item.order_type,
            })),
          },
        }
      : {}),
  }
})

function customerOrderSummary(
  customerUid: string,
  id: string,
  link: Record<string, unknown>,
  order: Record<string, unknown> | undefined,
  kitchen?: CustomerKitchenHydration
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
  const customer = record(order.customer)
  const fulfilmentMatch = record(order.fulfilment_match)
  const deliveryZone = record(fulfilmentMatch.zone)
  const payment = record(order.payment)
  const method = paymentMethods.has(payment.method as KitchenOrderPaymentMethod)
    ? payment.method as KitchenOrderPaymentMethod
    : undefined
  const paymentStatus = paymentStatuses.has(payment.status as KitchenOrderPaymentStatus)
    ? payment.status as KitchenOrderPaymentStatus
    : 'not_required'
  const collectionMode = collection.mode === 'scheduled' ? 'scheduled' : 'queue'
  // 2026-07-19 15:40 CEST: Project the owning customer's canonical Order lines so a Kitchen send-back can restore review state without browser basket persistence.
  const items = array(order.items).flatMap((value, index) => {
    const item = record(value)
    const name = orderItemName(item)
    const quantity = Math.max(1, number(item.quantity))
    const unitPrice = number(item.unit_price)
    if (!name || !unitPrice) return []

    const variantId = text(item.variant_id)
    const variantLabel = text(item.variant_label)
    return [{
      id: text(item.source_item_id) || text(item.id) || `item-${index + 1}`,
      menu_id: text(item.menu_id),
      name,
      quantity,
      unit_price: unitPrice,
      ...(variantId || variantLabel
        ? { variant: { id: variantId || variantLabel, label: variantLabel || variantId } }
        : {}),
      add_ons: array(item.add_ons).flatMap((value) => {
        const addOn = record(value)
        const id = text(addOn.id)
        const label = text(addOn.label)
        const price = number(addOn.price)

        return id && label ? [{ id, label, price }] : []
      }),
    }]
  })
  const orderNumber = text(order.order_number) || (
    number(order.service_number) > 0 ? String(number(order.service_number)) : ''
  )
  const createdAt = iso(order.created_at) || iso(record(order.created).at)
  const estimatedReadyMinutes = number(order.estimated_ready_minutes)
  const estimatedReadyAt = iso(order.estimated_ready_at)

  return {
    id,
    ...(orderNumber ? { order_number: orderNumber } : {}),
    status: order.status,
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
    item_count: items.reduce(
      (total, item) => total + item.quantity,
      0
    ),
    items,
    kitchen: {
      id: text(link.kitchen_id),
      name: kitchen?.name || text(link.kitchen_name) || 'Kitchen',
      ...(kitchen?.path ? { path: kitchen.path } : {}),
      ...(kitchen?.logoImageUrl
        ? { logo_image_url: kitchen.logoImageUrl }
        : {}),
      ...(kitchen?.imageUrl ? { image_url: kitchen.imageUrl } : {}),
      ...(kitchen?.imageShade
        ? { image_shade: kitchen.imageShade }
        : {}),
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

type CustomerKitchenHydration = {
  name: string
  path: string
  logoImageUrl: string
  imageUrl: string
  imageShade?: 'light' | 'dark' | 'none'
}

async function customerKitchenHydration(
  db: ReturnType<typeof getRuntimeFirestore>,
  links: Record<string, unknown>[]
) {
  const references = new Map<string, ReturnType<typeof db.doc>>()

  for (const link of links) {
    const kitchenId = text(link.kitchen_id)
    const appId = text(link.app_id)
    if (!kitchenId) continue

    const rootRef = db.doc(`kitchens/${kitchenId}`)
    references.set(rootRef.path, rootRef)
    if (appId) {
      const appRef = db.doc(`apps/${appId}/kitchens/${kitchenId}`)
      references.set(appRef.path, appRef)
    }
  }

  if (!references.size) return new Map<string, CustomerKitchenHydration>()

  const snapshots = await db.getAll(...references.values())
  const dataByPath = new Map(
    snapshots.map(snapshot => [
      snapshot.ref.path,
      snapshot.exists ? snapshot.data() || {} : {},
    ])
  )
  const placeReferences = new Map<string, ReturnType<typeof db.doc>>()
  for (const link of links) {
    const kitchenId = text(link.kitchen_id)
    if (!kitchenId) continue
    const rootData = dataByPath.get(`kitchens/${kitchenId}`) || {}
    const placeId = text(rootData.place_id)
    if (!placeId) continue
    const placeRef = db.doc(`${PlaceStorage.collection}/${placeId}`)
    placeReferences.set(placeRef.path, placeRef)
  }
  if (placeReferences.size) {
    const placeSnapshots = await db.getAll(...placeReferences.values())
    for (const snapshot of placeSnapshots) {
      dataByPath.set(
        snapshot.ref.path,
        snapshot.exists ? snapshot.data() || {} : {}
      )
    }
  }

  return new Map(
    links.flatMap((link) => {
      const kitchenId = text(link.kitchen_id)
      if (!kitchenId) return []

      const appId = text(link.app_id)
      const rootData = dataByPath.get(`kitchens/${kitchenId}`) || {}
      const appData = appId
        ? dataByPath.get(`apps/${appId}/kitchens/${kitchenId}`) || {}
        : {}
      const placeId = text(rootData.place_id)
      const placeData = placeId
        ? dataByPath.get(`${PlaceStorage.collection}/${placeId}`) || {}
        : {}
      const identity = menuKitchenIdentity(rootData, appData, placeData)
      const slug = text(rootData.slug) || text(appData.slug)

      return [[
        kitchenKey(link),
        {
          name: identity.name,
          path: safeKitchenPath(slug),
          logoImageUrl: identity.logoImageUrl,
          imageUrl: identity.imageUrl,
          imageShade: identity.imageShade,
        },
      ] as const]
    })
  )
}

function kitchenKey(link: Record<string, unknown>) {
  return `${text(link.app_id)}/${text(link.kitchen_id)}`
}

function safeKitchenPath(slug: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
    ? `/kitchens/${slug}`
    : ''
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
