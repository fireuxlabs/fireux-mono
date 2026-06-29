import {
  createError,
  defineEventHandler,
  getQuery,
  getRouterParam,
  readBody,
} from 'h3'
import { FieldValue } from 'firebase-admin/firestore'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { setCorsHeaders } from 'fireux-core/runtime/server/utils/http/cors.ts'
import {
  currentMenuOrderAppId,
  readMenuOrderContext,
} from '../../../utils/menu/ordering/context.ts'

const text = (value: unknown) => String(value ?? '').trim()
const numberValue = (value: unknown) => {
  const number = Number(value)

  return Number.isFinite(number) ? number : 0
}
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
const array = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : []
const orderId = () => `order-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`
const orderNumber = () => {
  const now = new Date()
  const y = String(now.getFullYear()).slice(-2)
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')

  return `${y}${m}${d}-${hh}${mm}`
}

export default defineEventHandler(async (event) => {
  setCorsHeaders(event, {
    methods: ['POST', 'OPTIONS'],
  })

  const menuId = text(getRouterParam(event, 'menuId'))
  const kitchenSlug = text(getQuery(event).kitchenSlug)
  if (!menuId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Menu path is required.',
    })
  }

  const context = await readMenuOrderContext(menuId, kitchenSlug)
  const body = record(await readBody(event))
  const db = getRuntimeFirestore()
  const id = orderId()
  const now = FieldValue.serverTimestamp()
  const items = readBasketItems(body)
  const orderType = text(body.order_type) || 'delivery'
  const destination = readDestination(body)
  if (orderType === 'delivery' && !destination) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Checked delivery address is required.',
    })
  }

  const pickup = await readPickup(db, context.kitchenId)
  const orderPath = `apps/${context.appId}/kitchens/${context.kitchenId}/orders/${id}`
  const payload = {
    id,
    kitchen_id: context.kitchenId,
    kitchen_slug: context.kitchenSlug || kitchenSlug,
    kitchen_name: context.kitchenName || '',
    menu_id: context.menuId,
    order_number: orderNumber(),
    status: 'pending_acceptance',
    order_type: orderType,
    fire_state: 'held',
    items,
    ...(pickup ? { pickup } : {}),
    fulfilment_match: {
      ...(destination ? { delivery_address: destination } : {}),
      ...(Object.keys(record(record(body.delivery).zone)).length
        ? { delivery_zone: record(record(body.delivery).zone) }
        : {}),
    },
    customer: {
      ...(destination?.formatted ? { address: destination.formatted } : {}),
      ...(destination?.place_id ? { address_place_id: destination.place_id } : {}),
    },
    driver_responses: {},
    channel: 'menu',
    created_at: now,
    updated_at: now,
    created: {
      at: now,
      by: 'public-menu',
      app_id: currentMenuOrderAppId(),
    },
    updated: {
      at: now,
      by: 'public-menu',
    },
  }

  await db.doc(orderPath).set(payload)

  return {
    ok: true,
    id,
    order_id: id,
    order_path: orderPath,
    status: payload.status,
  }
})

function readBasketItems(body: Record<string, unknown>) {
  const items = array(record(body.basket).items)
    .map((item, index) => {
      const source = record(item)
      const id = text(source.lineId || source.id) || `item-${index + 1}`
      const label = text(source.name)

      return {
        id,
        dish_id: text(source.id),
        label,
        quantity: Math.max(1, Math.floor(numberValue(source.quantity) || 1)),
        unit_price: numberValue(source.unitPrice),
        checked: false,
      }
    })
    .filter((item) => item.label)

  return items.length
    ? items
    : [
        {
          id: 'order-started',
          dish_id: '',
          label: 'Order started',
          quantity: 1,
          checked: false,
        },
      ]
}

async function readPickup(
  db: ReturnType<typeof getRuntimeFirestore>,
  kitchenId: string
) {
  if (!kitchenId) return null

  const snap = await db.collection('kitchens').doc(kitchenId).get()
  const data = snap.data() || {}
  const placeData = await readLinkedPlace(db, data)
  const point = readPoint(data) || readPoint(placeData)

  return {
    label: text(
      data.display_name ||
      data.name ||
      placeData?.short_name ||
      placeData?.name ||
      data.slug ||
      'Kitchen'
    ),
    ...(point || {}),
  }
}

async function readLinkedPlace(
  db: ReturnType<typeof getRuntimeFirestore>,
  kitchenData: Record<string, unknown>
) {
  const placeId = text(kitchenData.place_id)
  if (!placeId) return null

  const snap = await db.collection('places').doc(placeId).get()
  return snap.exists ? snap.data() || {} : null
}

function readPoint(data: Record<string, unknown> | null) {
  const lat = coordinateValue(data?.lat)
  const lng = coordinateValue(data?.lng)
  if (lat === null || lng === null) return null

  return {
    lat,
    lng,
  }
}

function coordinateValue(value: unknown) {
  const number = Number(value)

  return Number.isFinite(number) ? number : null
}

function readDestination(body: Record<string, unknown>) {
  const address = record(record(body.delivery).address)
  const lat = coordinateValue(address.lat)
  const lng = coordinateValue(address.lng)
  if (lat === null || lng === null) return null

  return {
    formatted: text(address.formatted || address.input),
    place_id: text(address.place_id),
    postal_code: text(address.postal_code),
    lat,
    lng,
  }
}
