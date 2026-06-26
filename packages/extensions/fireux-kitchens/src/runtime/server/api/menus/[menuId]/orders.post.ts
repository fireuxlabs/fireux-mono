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
  checkMenuDeliveryPlaceId,
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
const numberValue = (value: unknown) => {
  const number = Number(value)

  return Number.isFinite(number) ? number : 0
}
const money = (value: number) =>
  new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
  }).format(value)
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
  if (orderType === 'delivery') return 'held'
  if (orderType === 'pre_order') return 'held'
  if (orderType === 'dine_in') return 'fired'
  return 'ready_to_fire'
}
const statusForOrderType = (orderType: KitchenOrderType) =>
  orderType === 'delivery' ? 'pending_acceptance' : 'open'
const readCustomer = (value: unknown): KitchenOrderCustomer => {
  const source = value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
  const customer = {
    name: text(source.name),
    phone: text(source.phone),
    address: text(source.address),
    address_place_id: text(source.address_place_id),
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
    const zones = orderTypeConfig?.fulfilment?.delivery_zones || []
    deliveryAddressResult = customer.address_place_id
      ? await checkMenuDeliveryPlaceId(customer.address_place_id, zones)
      : await checkMenuDeliveryAddress(customer.address || '', zones)
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
    const addOnsTotal = addOns.reduce(
      (sum, addOn) => sum + numberValue(addOn.price),
      0
    )
    const basePrice = variant
      ? numberValue(variant.price)
      : numberValue(item.price)
    const unitPrice = basePrice + addOnsTotal
    const labelParts = [
      item.name,
      variant?.label,
    ].filter(Boolean)

    return {
      id: `item-${index + 1}`,
      dish_id: item.dish_id,
      label: labelParts.join(' · '),
      quantity: requestedItem.quantity,
      unit_price: unitPrice,
      ...(addOns.length ? { add_ons: addOns } : {}),
      ...(variant
        ? {
            variant_id: text(variant.id),
            variant_label: variant.label,
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
  const subtotal = orderItems.reduce(
    (sum, item) =>
      sum + numberValue(item.unit_price) * Math.max(1, Number(item.quantity || 1) || 1),
    0
  )
  const deliveryMinimum = numberValue(
    deliveryAddressResult?.zone?.min_order_chf
  )
  if (
    orderType === 'delivery' &&
    deliveryAddressResult?.zone &&
    deliveryMinimum > 0 &&
    subtotal < deliveryMinimum
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: `Minimum order is ${money(deliveryMinimum)} for this delivery area.`,
    })
  }

  const db = getRuntimeFirestore()
  const id = orderId()
  const number = orderNumber()
  const fireState = fireStateForOrderType(orderType)
  const status = statusForOrderType(orderType)
  const receiptCreatedAt = new Date().toISOString()
  const now = FieldValue.serverTimestamp()
  const deliveryFee = numberValue(deliveryAddressResult?.zone?.fee_chf)
  const total = subtotal + deliveryFee
  const receiptItems = orderItems.map((item) => ({
    id: item.id,
    label: item.label,
    quantity: item.quantity,
    unit_price_chf: numberValue(item.unit_price),
    total_chf:
      numberValue(item.unit_price) * Math.max(1, Number(item.quantity || 1) || 1),
    ...(item.add_ons?.length ? { add_ons: item.add_ons } : {}),
    ...(item.variant_label ? { variant_label: item.variant_label } : {}),
  }))
  const payload = {
    id,
    kitchen_id: context.kitchenId,
    menu_id: context.menuId,
    order_number: number,
    status,
    order_type: orderType,
    requested_for: requestedFor,
    estimated_ready_minutes: 0,
    estimated_ready_at: '',
    fire_state: fireState,
    ...(Object.keys(customer).length ? { customer } : {}),
    ...(deliveryAddressResult?.zone
      ? {
          fulfilment_match: {
            type: 'delivery_zone',
            zone: deliveryAddressResult.zone,
            address: deliveryAddressResult.address,
            subtotal_chf: subtotal,
            fee_chf: numberValue(deliveryAddressResult.zone.fee_chf),
            min_order_chf: deliveryMinimum,
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
    status,
    order_type: orderType,
    fire_state: fireState,
    receipt: {
      id,
      order_number: number,
      order_type: orderType,
      status,
      created_at: receiptCreatedAt,
      ...(requestedFor ? { requested_for: requestedFor } : {}),
      currency: 'CHF',
      subtotal_chf: subtotal,
      ...(deliveryFee ? { delivery_fee_chf: deliveryFee } : {}),
      total_chf: total,
      ...(Object.keys(customer).length ? { customer } : {}),
      items: receiptItems,
      kitchen: {
        id: context.kitchenId,
      },
      menu: {
        id: context.menuId,
      },
    },
  }
})
