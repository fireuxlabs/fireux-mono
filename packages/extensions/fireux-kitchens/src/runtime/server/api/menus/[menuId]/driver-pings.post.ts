import { createHash } from 'node:crypto'
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

type DeliveryPingBody = {
  delivery?: {
    ready?: unknown
    address?: {
      formatted?: unknown
      input?: unknown
      place_id?: unknown
      postal_code?: unknown
      lat?: unknown
      lng?: unknown
    }
    zone?: unknown
  }
  basket?: {
    quantity?: unknown
    items?: Array<{
      id?: unknown
      name?: unknown
      quantity?: unknown
      unitPrice?: unknown
    }>
  }
  customer?: {
    name?: unknown
    avatar?: unknown
    avatar_url?: unknown
  }
}

const text = (value: unknown) => String(value ?? '').trim()
const numberValue = (value: unknown) => {
  const number = Number(value)

  return Number.isFinite(number) ? number : 0
}
const coordinateValue = (value: unknown) => {
  const number = Number(value)

  return Number.isFinite(number) ? number : null
}
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
const array = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : []

export default defineEventHandler(async (event) => {
  setCorsHeaders(event, {
    methods: ['POST', 'OPTIONS'],
  })

  const menuId = text(getRouterParam(event, 'menuId'))
  const kitchenSlug = text(getQuery(event).kitchenSlug)
  const body = (await readBody(event)) as DeliveryPingBody | null
  if (!menuId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Menu path is required.',
    })
  }

  const destination = readDestination(body)
  if (!destination) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Checked delivery address is required.',
    })
  }

  const context = await readMenuOrderContext(menuId, kitchenSlug)
  const db = getRuntimeFirestore()
  const basket = readBasket(body)
  const customer = readCustomer(body)
  const pickup = await readPickup(db, context.kitchenId)
  const now = FieldValue.serverTimestamp()
  const id = pingId({
    menuId: context.menuId,
    kitchenId: context.kitchenId,
    destination,
    basket,
  })

  await db.collection('driver-pings').doc(id).set(
    {
      id,
      kind: 'weak_delivery_ping',
      status: 'open',
      message: 'hello world',
      app_id: currentMenuOrderAppId(),
      source_app_id: context.appId,
      kitchen_id: context.kitchenId,
      kitchen_slug: context.kitchenSlug || kitchenSlug,
      kitchen_name: context.kitchenName || '',
      menu_id: context.menuId,
      ...(pickup ? { pickup } : {}),
      destination,
      basket,
      ...(Object.keys(customer).length ? { customer } : {}),
      created_at: now,
      updated_at: now,
    },
    { merge: true }
  )

  return {
    ok: true,
    ping_count: 1,
    ping_id: id,
  }
})

function pingId(input: {
  menuId: string
  kitchenId: string
  destination: Record<string, unknown>
  basket: Record<string, unknown>
}) {
  const digest = createHash('sha1')
    .update(JSON.stringify(input))
    .digest('hex')
    .slice(0, 24)

  return `weak-${digest}`
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
  if (!point) return null

  return {
    label: text(
      data.display_name ||
      data.name ||
      placeData?.short_name ||
      placeData?.name ||
      data.slug ||
      'Kitchen'
    ),
    ...point,
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

function readDestination(body: DeliveryPingBody | null) {
  const address = record(body?.delivery?.address)
  const lat = coordinateValue(address.lat)
  const lng = coordinateValue(address.lng)
  if (lat === null || lng === null) {
    return null
  }

  return {
    formatted: text(address.formatted || address.input),
    place_id: text(address.place_id),
    postal_code: text(address.postal_code),
    lat,
    lng,
  }
}

function readBasket(body: DeliveryPingBody | null) {
  const basket = record(body?.basket)
  const items = array(basket.items)
    .map((item) => {
      const source = record(item)

      return {
        id: text(source.id),
        name: text(source.name),
        quantity: Math.max(1, Math.floor(numberValue(source.quantity) || 1)),
        unit_price_chf: numberValue(source.unitPrice),
      }
    })
    .filter((item) => item.id)

  return {
    quantity: Math.max(0, Math.floor(numberValue(basket.quantity))),
    items,
  }
}

function readCustomer(body: DeliveryPingBody | null) {
  const customer = record(body?.customer)
  const snapshot = {
    name: text(customer.name),
    avatar: text(customer.avatar),
    avatar_url: text(customer.avatar_url || customer.avatar),
  }

  return Object.fromEntries(
    Object.entries(snapshot).filter(([, value]) => value)
  )
}
