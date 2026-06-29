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
const orderId = () => `ping-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`
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
  const payload = {
    id,
    kitchen_id: context.kitchenId,
    menu_id: context.menuId,
    order_number: orderNumber(),
    status: 'pending_acceptance',
    order_type: 'delivery',
    fire_state: 'held',
    items,
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

  await db
    .collection(`apps/${context.appId}/kitchens/${context.kitchenId}/orders`)
    .doc(id)
    .set(payload)

  return {
    ok: true,
    id,
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
          id: 'ping',
          dish_id: '',
          label: 'ping',
          quantity: 1,
          checked: false,
        },
      ]
}
