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
import type {
  KitchenOrderCustomer,
  KitchenOrderFireState,
  KitchenOrderType,
} from '../../../../models/order.model'
import { readKitchenMenuPublicRows } from '../../../utils/kitchen-menu-public-rows.ts'
import {
  checkMenuDeliveryAddress,
  type MenuDeliveryAddressResult,
} from '../../../utils/menu-delivery-address.ts'
import {
  currentMenuOrderAppId,
  readMenuOrderContext,
} from '../../../utils/menu-order-context.ts'
import {
  isMenuOrderingEnabled,
  readMenuOrderingConfig,
} from '../../../utils/menu-ordering.ts'
import {
  readRequestedMenuOrderItems,
  resolveMenuOrderAddOns,
  resolveMenuOrderVariant,
  type CreateMenuOrderBody,
} from '../../../utils/menu-order-lines.ts'

const orderTypes = new Set<KitchenOrderType>([
  'dine_in',
  'collection',
  'delivery',
  'pre_order',
  'room_service',
])
const text = (value: unknown) => String(value ?? '').trim()
const orderId = () => {
  const now = Date.now()
  const rand = Math.random().toString(16).slice(2)
  return `order-${now}-${rand}`
}
const orderNumber = () => {
  const now = new Date()
  const y = String(now.getFullYear()).slice(-2)
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  return `${y}${m}${d}-${hh}${mm}`
}
const normalizeOrderType = (
  value: unknown,
  allowedModes: KitchenOrderType[]
): KitchenOrderType => {
  const requested = text(value) as KitchenOrderType
  if (orderTypes.has(requested) && allowedModes.includes(requested)) {
    return requested
  }

  return allowedModes[0] || 'dine_in'
}
const fireStateForOrderType = (
  orderType: KitchenOrderType
): KitchenOrderFireState => {
  if (orderType === 'pre_order') return 'held'
  if (orderType === 'dine_in') return 'fired'
  return 'ready_to_fire'
}
const readCustomer = (value: unknown): KitchenOrderCustomer => {
  const source = value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
  const customer = {
    name: text(source.name),
    phone: text(source.phone),
    address: text(source.address),
    allergy_note: text(source.allergy_note),
    notes: text(source.notes),
  }

  return Object.fromEntries(
    Object.entries(customer).filter(([, entry]) => entry)
  ) as KitchenOrderCustomer
}

export default defineEventHandler(async (event) => {
  setCorsHeaders(event, {
    methods: ['POST', 'OPTIONS'],
  })

  const menuId = text(getRouterParam(event, 'menuId'))
  const kitchenSlug = text(getQuery(event).kitchenSlug)
  const body = (await readBody(event)) as CreateMenuOrderBody | null
  const requestedItems = readRequestedMenuOrderItems(body)
  if (!menuId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Menu path is required.',
    })
  }
  if (!requestedItems.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Menu item is required.',
    })
  }

  const context = await readMenuOrderContext(menuId, kitchenSlug)
  const ordering = readMenuOrderingConfig(context.menuData)
  const allowedOrderTypes = ordering.order_types.map((type) => type.type)
  if (!isMenuOrderingEnabled(ordering)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'This menu is not accepting orders yet.',
    })
  }

  const orderType = normalizeOrderType(body?.order_type, allowedOrderTypes)
  const orderTypeConfig = ordering.order_types.find((type) =>
    type.type === orderType
  )
  const requestedFor = text(body?.requested_for)
  const customer = readCustomer(body?.customer)
  let deliveryAddressResult: MenuDeliveryAddressResult | null = null
  if (orderType === 'delivery') {
    deliveryAddressResult = await checkMenuDeliveryAddress(
      customer.address || '',
      orderTypeConfig?.fulfilment?.delivery_zones || []
    )
    if (!deliveryAddressResult.deliverable) {
      throw createError({
        statusCode: 400,
        statusMessage: deliveryAddressResult.reason || 'This address is outside the delivery area.',
      })
    }
  }
  const rows = await readKitchenMenuPublicRows(getRuntimeFirestore(), {
    appId: context.appId,
    kitchenId: context.kitchenId,
    menuId: context.menuId,
  })
  const rowsById = new Map(
    rows.flatMap((section) =>
      section.items.map((item) => [item.id, item])
    )
  )
  const orderItems = requestedItems.map((requestedItem, index) => {
    const item = rowsById.get(requestedItem.itemId)
    if (!item?.dish_id) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Menu item not found.',
      })
    }
    const variant = resolveMenuOrderVariant(item.priceOptions, requestedItem.variant)
    const addOns = resolveMenuOrderAddOns(item.addOns || [], requestedItem.addOns)
    const labelParts = [
      item.name,
      variant?.label,
    ].filter(Boolean)

    return {
      id: `item-${index + 1}`,
      dish_id: item.dish_id,
      label: labelParts.join(' · '),
      quantity: requestedItem.quantity,
      ...(addOns.length ? { add_ons: addOns } : {}),
      ...(variant
        ? {
            variant_id: text(variant.id),
            variant_label: variant.label,
            unit_price: variant.price,
          }
        : {}),
      checked: false,
    }
  })
  if (!orderItems.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Menu item is required.',
    })
  }

  const db = getRuntimeFirestore()
  const id = orderId()
  const number = orderNumber()
  const fireState = fireStateForOrderType(orderType)
  const now = FieldValue.serverTimestamp()
  const payload = {
    id,
    kitchen_id: context.kitchenId,
    menu_id: context.menuId,
    order_number: number,
    status: 'open',
    order_type: orderType,
    requested_for: requestedFor,
    fire_state: fireState,
    ...(Object.keys(customer).length ? { customer } : {}),
    ...(deliveryAddressResult?.zone
      ? {
          fulfilment_match: {
            type: 'delivery_zone',
            zone: deliveryAddressResult.zone,
            address: deliveryAddressResult.address,
          },
        }
      : {}),
    ...(orderTypeConfig
      ? {
          fulfilment_policy: {
            order_type: orderTypeConfig.type,
            ...(orderTypeConfig.notice_hours
              ? { notice_hours: orderTypeConfig.notice_hours }
              : {}),
            ...(orderTypeConfig.message
              ? { message: orderTypeConfig.message }
              : {}),
            ...(orderTypeConfig.fulfilment
              ? { ...orderTypeConfig.fulfilment }
              : {}),
          },
        }
      : {}),
    channel: 'menu',
    items: orderItems,
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
    id,
    order_number: number,
    order_type: orderType,
    fire_state: fireState,
  }
})
