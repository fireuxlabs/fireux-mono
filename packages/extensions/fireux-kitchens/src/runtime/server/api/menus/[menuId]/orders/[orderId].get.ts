import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { createError, getQuery, getRouterParam } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { setCorsHeaders } from 'fireux-core/runtime/server/utils/http/cors'
import { readMenuOrderContext } from '../../../../../menu/server/ordering/context.ts'
import {
  readMenuOrderCustomerAccess,
  requireMenuOrderCustomerAccess,
} from '../../../../../menu/server/ordering/order-capability.ts'
import {
  isKitchenOrderStatus,
  isKitchenOrderType,
} from '../../../../../kitchen/utils/order.ts'
import { MENU_ORDER_CAPABILITY_HEADER } from '../../../../../menu/utils/menu-order-capability.ts'

// Concurrent edit — 2026-07-20 15:37 CEST — Anonymous Order capability pass: make status private to the customer UID or opaque same-device capability.

const text = (value: unknown) => String(value ?? '').trim()
const numberValue = (value: unknown) => {
  const number = Number(value)

  return Number.isFinite(number) ? number : 0
}
const timestampIso = (value: unknown) => {
  const source = value as { toDate?: () => Date; seconds?: number } | null
  if (typeof source?.toDate === 'function') return source.toDate().toISOString()

  const seconds = Number(source?.seconds)
  if (Number.isFinite(seconds) && seconds > 0) {
    return new Date(seconds * 1000).toISOString()
  }

  const parsed = Date.parse(text(value))
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : ''
}
const fulfilmentMatch = (value: unknown) => {
  const source =
    value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {}
  const type = text(source.type)
  const reference = text(source.reference)
  const handoff = text(source.handoff)

  if (!type || !reference || !handoff) return undefined

  return { type, reference, handoff }
}
const collectionState = (value: unknown) => {
  const source =
    value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {}
  const mode = text(source.mode)
  if (mode !== 'queue' && mode !== 'scheduled') return undefined

  const requestedFor = timestampIso(source.requested_for)
  return {
    mode,
    ...(requestedFor ? { requested_for: requestedFor } : {}),
  }
}

export default defineLiveReadHandler(async (event) => {
  setCorsHeaders(event, {
    methods: ['GET', 'OPTIONS'],
    headers: ['authorization', MENU_ORDER_CAPABILITY_HEADER],
  })

  const menuId = text(getRouterParam(event, 'menuId'))
  const orderId = text(getRouterParam(event, 'orderId'))
  const kitchenSlug = text(getQuery(event).kitchenSlug)
  if (!menuId || !orderId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Order path is required.',
    })
  }

  const context = await readMenuOrderContext(menuId, kitchenSlug)
  const access = await readMenuOrderCustomerAccess(event)
  const snap = await getRuntimeFirestore()
    .collection(`kitchens/${context.kitchenId}/orders`)
    .doc(orderId)
    .get()
  if (!snap.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Order not found.',
    })
  }

  const data = snap.data() || {}
  if (text(data.menu_id) !== context.menuId) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Order not found.',
    })
  }
  requireMenuOrderCustomerAccess(access, data)
  const driverResponses =
    data.driver_responses && typeof data.driver_responses === 'object'
      ? (data.driver_responses as Record<string, { status?: unknown }>)
      : {}
  const match = fulfilmentMatch(data.fulfilment_match)
  const collection = collectionState(data.collection)
  const status = text(data.status)
  const orderType = text(data.order_type)
  if (!isKitchenOrderStatus(status) || !isKitchenOrderType(orderType)) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Order lifecycle is invalid.',
    })
  }

  return {
    id: orderId,
    order_number: text(data.order_number),
    status,
    ...(text(data.kitchen_service_id)
      ? {
          kitchen_service_id: text(data.kitchen_service_id),
          kitchen_service_name: text(data.kitchen_service_name),
        }
      : {}),
    order_type: orderType,
    ...(match ? { fulfilment_match: match } : {}),
    ...(collection ? { collection } : {}),
    ...(text(data.kitchen_note)
      ? { kitchen_note: text(data.kitchen_note) }
      : {}),
    estimated_ready_minutes: numberValue(data.estimated_ready_minutes),
    estimated_ready_at: timestampIso(data.estimated_ready_at),
    driver_watching_count: Object.values(driverResponses).filter(
      (response) => text(response?.status) === 'watching'
    ).length,
  }
})
