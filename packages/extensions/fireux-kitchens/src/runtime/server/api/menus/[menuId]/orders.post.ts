import {
  createError,
  defineEventHandler,
  getQuery,
  getRouterParam,
  readBody,
} from 'h3'
import { useRuntimeConfig } from '#imports'
import { FieldValue } from 'firebase-admin/firestore'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { setCorsHeaders } from 'fireux-core/runtime/server/utils/http/cors.ts'
import type {
  KitchenOrderFireState,
  KitchenOrderType,
} from '../../../../models/order.model'
import { readKitchenMenuPublicRows } from '../../../utils/kitchen-menu-public-rows.ts'
import {
  readMenuKitchenBySlug,
  readRootMenuKitchenScope,
  resolveSourceAppId,
} from '../../../utils/menu-kitchen-scope.ts'
import {
  isMenuOrderingEnabled,
  readMenuOrderingConfig,
} from '../../../utils/menu-ordering.ts'

type CreateMenuOrderBody = {
  itemId?: string
  quantity?: number
  addOns?: MenuOrderVariantInput[]
  add_ons?: MenuOrderVariantInput[]
  variant?: MenuOrderVariantInput
  items?: Array<{
    itemId?: string
    quantity?: number
    addOns?: MenuOrderVariantInput[]
    add_ons?: MenuOrderVariantInput[]
    variant?: MenuOrderVariantInput
  }>
  order_type?: string
  requested_for?: string
}

type MenuOrderVariantInput = {
  id?: string
  label?: string
  price?: number
  priceLabel?: string
}

type MenuOrderContext = {
  appId: string
  kitchenId: string
  menuId: string
  menuData: Record<string, unknown>
}

const orderTypes = new Set<KitchenOrderType>([
  'dine_in',
  'collection',
  'delivery',
  'pre_order',
  'room_service',
])
const text = (value: unknown) => String(value ?? '').trim()
const currentAppId = () => {
  const fireux = (useRuntimeConfig().public?.fireux ?? {}) as Record<string, unknown>
  return text(fireux.id)
}
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
const quantity = (value: unknown) =>
  Math.max(1, Number(value || 1) || 1)
const variantKey = (value: unknown) =>
  text(value).toLowerCase().replace(/[^a-z0-9]+/g, '-')
const readVariant = (value: unknown): MenuOrderVariantInput | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null

  const source = value as Record<string, unknown>
  const id = text(source.id)
  const label = text(source.label)
  const price = Number(source.price)
  const priceLabel = text(source.priceLabel || source.price_label)
  if (!id && !label) return null

  return {
    id,
    label,
    ...(Number.isFinite(price) && price > 0 ? { price } : {}),
    ...(priceLabel ? { priceLabel } : {}),
  }
}
const readAddOns = (value: unknown) =>
  (Array.isArray(value) ? value : [])
    .map(readVariant)
    .filter((addOn): addOn is MenuOrderVariantInput => Boolean(addOn))
const readRequestedItems = (body: CreateMenuOrderBody | null) => {
  const items = Array.isArray(body?.items)
    ? body.items
    : [{
        itemId: body?.itemId,
        quantity: body?.quantity,
        addOns: body?.addOns || body?.add_ons,
        variant: body?.variant,
      }]

  return items
    .map((item) => ({
      itemId: text(item.itemId),
      quantity: quantity(item.quantity),
      addOns: readAddOns(item.addOns || item.add_ons),
      variant: readVariant(item.variant),
    }))
    .filter((item) => item.itemId)
}
const resolveVariant = (
  options: Array<{ id?: string, label: string, price: number, priceLabel?: string }>,
  requested: MenuOrderVariantInput | null
) => {
  if (!options.length) {
    return requested?.label
      ? {
          id: requested.id,
          label: requested.label,
          price: Number(requested.price || 0) || 0,
          priceLabel: requested.priceLabel,
        }
      : null
  }
  if (!requested && options.length === 1) return options[0]
  if (!requested) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Choose an item variant.',
    })
  }

  const requestedKeys = [
    variantKey(requested.id),
    variantKey(requested.label),
  ].filter(Boolean)
  const match = options.find((option, optionIndex) => {
    const optionKeys = [
      variantKey(option.id),
      variantKey(option.label),
      `option-${optionIndex + 1}`,
    ].filter(Boolean)

    return optionKeys.some((key) => requestedKeys.includes(key))
  })
  if (!match) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Selected item variant is not available.',
    })
  }

  return match
}
const resolveAddOns = (
  options: Array<{ id?: string, label: string, price: number }>,
  requested: MenuOrderVariantInput[]
) => {
  if (!requested.length) return []
  if (!options.length) {
    return requested
      .filter((addOn) => text(addOn.label))
      .map((addOn) => ({
        id: text(addOn.id) || variantKey(addOn.label),
        label: text(addOn.label),
        price: Number(addOn.price || 0) || 0,
      }))
  }

  return requested.map((requestedAddOn) => {
    const requestedKeys = [
      variantKey(requestedAddOn.id),
      variantKey(requestedAddOn.label),
    ].filter(Boolean)
    const match = options.find((option) =>
      [
        variantKey(option.id),
        variantKey(option.label),
      ].filter(Boolean).some((key) => requestedKeys.includes(key))
    )
    if (!match) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Selected item add-on is not available.',
      })
    }

    return match
  })
}
const readMenuDoc = async (
  appId: string,
  kitchenId: string,
  menuId: string
) => {
  const db = getRuntimeFirestore()
  const snap = await db
    .collection(`apps/${appId}/kitchens/${kitchenId}/menus`)
    .doc(menuId)
    .get()

  if (!snap.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Menu not found.',
    })
  }

  const menuData = snap.data() || {}
  if (readRecordString(menuData, 'status') !== 'published') {
    throw createError({
      statusCode: 404,
      statusMessage: 'Menu not found.',
    })
  }

  return menuData
}
const readContext = async (
  menuId: string,
  kitchenSlug: string
): Promise<MenuOrderContext> => {
  if (kitchenSlug) {
    const kitchen = await readMenuKitchenBySlug(kitchenSlug)
    if (!kitchen) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Kitchen not found.',
      })
    }

    const appId = resolveSourceAppId(kitchen.data, currentAppId())
    const menuData = await readMenuDoc(appId, kitchen.id, menuId)

    return {
      appId,
      kitchenId: kitchen.id,
      menuId,
      menuData,
    }
  }

  const db = getRuntimeFirestore()
  const rootSnap = await db.collection('menus').doc(menuId).get()
  if (!rootSnap.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Menu not found.',
    })
  }

  const rootData = rootSnap.data() || {}
  const scope = await readRootMenuKitchenScope(rootData, currentAppId())
  const appId = text(scope.kitchenAppId)
  const kitchenId = text(scope.kitchenId)
  const scopedMenuId = text(scope.kitchenMenuId) || menuId
  if (!appId || !kitchenId || !scopedMenuId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'This menu cannot accept orders yet.',
    })
  }

  return {
    appId,
    kitchenId,
    menuId: scopedMenuId,
    menuData: await readMenuDoc(appId, kitchenId, scopedMenuId),
  }
}

export default defineEventHandler(async (event) => {
  setCorsHeaders(event, {
    methods: ['POST', 'OPTIONS'],
  })

  const menuId = text(getRouterParam(event, 'menuId'))
  const kitchenSlug = text(getQuery(event).kitchenSlug)
  const body = (await readBody(event)) as CreateMenuOrderBody | null
  const requestedItems = readRequestedItems(body)
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

  const context = await readContext(menuId, kitchenSlug)
  const ordering = readMenuOrderingConfig(context.menuData)
  const allowedOrderTypes = ordering.order_types.map((type) => type.type)
  if (!isMenuOrderingEnabled(ordering)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'This menu is not accepting orders yet.',
    })
  }

  const orderType = normalizeOrderType(body?.order_type, allowedOrderTypes)
  const requestedFor = text(body?.requested_for)
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
    const variant = resolveVariant(item.priceOptions, requestedItem.variant)
    const addOns = resolveAddOns(item.addOns || [], requestedItem.addOns)
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
    channel: 'menu',
    items: orderItems,
    created_at: now,
    updated_at: now,
    created: {
      at: now,
      by: 'public-menu',
      app_id: currentAppId(),
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
