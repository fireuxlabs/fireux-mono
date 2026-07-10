import {
  createError,
  defineEventHandler,
  getQuery,
  getRouterParam,
} from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { setCorsHeaders } from 'fireux-core/runtime/server/utils/http/cors.ts'
import { readMenuOrderContext } from '../../../../menu/ordering/context.ts'

const text = (value: unknown) => String(value ?? '').trim()
const numberValue = (value: unknown) => {
  const number = Number(value)

  return Number.isFinite(number) ? number : 0
}
const timestampIso = (value: unknown) => {
  const source = value as { toDate?: () => Date, seconds?: number } | null
  if (typeof source?.toDate === 'function') return source.toDate().toISOString()

  const seconds = Number(source?.seconds)
  if (Number.isFinite(seconds) && seconds > 0) {
    return new Date(seconds * 1000).toISOString()
  }

  const parsed = Date.parse(text(value))
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : ''
}
const fulfilmentMatch = (value: unknown) => {
  const source = value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
  const type = text(source.type)
  const reference = text(source.reference)
  const handoff = text(source.handoff)

  if (!type || !reference || !handoff) return undefined

  return { type, reference, handoff }
}

export default defineEventHandler(async (event) => {
  setCorsHeaders(event, {
    methods: ['GET', 'OPTIONS'],
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
  const snap = await getRuntimeFirestore()
    .collection(`apps/${context.appId}/kitchens/${context.kitchenId}/orders`)
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
  const driverResponses = data.driver_responses && typeof data.driver_responses === 'object'
    ? data.driver_responses as Record<string, { status?: unknown }>
    : {}
  const match = fulfilmentMatch(data.fulfilment_match)

  return {
    id: orderId,
    order_number: text(data.order_number),
    status: text(data.status),
    order_type: text(data.order_type),
    ...(match ? { fulfilment_match: match } : {}),
    fire_state: text(data.fire_state),
    estimated_ready_minutes: numberValue(data.estimated_ready_minutes),
    estimated_ready_at: timestampIso(data.estimated_ready_at),
    driver_watching_count: Object.values(driverResponses)
      .filter((response) => text(response?.status) === 'watching')
      .length,
  }
})
