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
import { readKitchenMenuSections } from '../../../menu/manifest/sections.ts'
import {
  checkMenuDeliveryAddress,
  checkMenuDeliveryPlaceId,
  type MenuDeliveryAddressResult,
} from '../../../menu/ordering/delivery-address.ts'
import {
  currentMenuOrderAppId,
  readMenuOrderContext,
} from '../../../menu/ordering/context.ts'
import {
  isMenuOrderingEnabled,
  readMenuOrderingConfig,
} from '../../../menu/ordering/config.ts'
import {
  resolveMenuOrderPayment,
} from '../../../menu/ordering/payment.ts'
import {
  readRequestedMenuOrderItems,
  resolveMenuOrderAddOns,
  resolveMenuOrderVariant,
  type CreateMenuOrderBody,
} from '../../../menu/ordering/lines.ts'
import {
  money,
  normalizeOrderType,
  normalizePaymentMethod,
  numberValue,
  orderId,
  orderNumber,
  readCollection,
  readCustomer,
  statusForOrderType,
  text,
} from '../../../menu/ordering/order-request.ts'

const safeSegment = (value: string) =>
  Boolean(value && !value.includes('/') && value !== '.' && value !== '..')

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
  const currencyCode = text(context.currencyCode)
  if (!currencyCode) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Kitchen currency code is required before creating orders.',
    })
  }
  const ordering = readMenuOrderingConfig(context.menuData, context.fulfilment)
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
  const paymentMethod = normalizePaymentMethod(body?.payment_method, [
    'online_card',
  ])
  const requestedFor = text(body?.requested_for)
  const collection = readCollection(body?.collection, orderType)
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
  const sourceMenuIds = Array.from(new Set(
    requestedItems.map((item) => text(item.menuId) || context.menuId)
  ))
  if (!sourceMenuIds.every(safeSegment)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Menu item source is invalid.',
    })
  }

  const db = getRuntimeFirestore()
  const rowsByMenuId = new Map(
    await Promise.all(sourceMenuIds.map(async (sourceMenuId) => {
      const rows = await readKitchenMenuSections(db, {
        appId: context.appId,
        kitchenId: context.kitchenId,
        menuId: sourceMenuId,
      })

      return [
        sourceMenuId,
        new Map(
          rows.flatMap((section) =>
            section.items.map((item) => [item.id, item])
          )
        ),
      ] as const
    }))
  )
  const orderItems = requestedItems.map((requestedItem, index) => {
    const sourceMenuId = text(requestedItem.menuId) || context.menuId
    const item = rowsByMenuId.get(sourceMenuId)?.get(requestedItem.itemId)
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
      menu_id: sourceMenuId,
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
      statusMessage: `Minimum order is ${money(deliveryMinimum, currencyCode)} for this delivery area.`,
    })
  }

  const id = orderId()
  const number = orderNumber()
  const status = statusForOrderType(orderType)
  const receiptCreatedAt = new Date().toISOString()
  const now = FieldValue.serverTimestamp()
  const deliveryFee = numberValue(deliveryAddressResult?.zone?.fee_chf)
  const total = subtotal + deliveryFee
  const path = `apps/${context.appId}/kitchens/${context.kitchenId}/orders/${id}`
  const payment = resolveMenuOrderPayment({
    orderType,
    orderTypeConfig,
    customer,
    currencyCode,
    paymentMethod,
    subtotalChf: subtotal,
    totalChf: total,
  })
  const paymentRequired = payment.required && payment.status !== 'paid'
  const nextStatus = paymentRequired
    ? statusForOrderType(orderType, true)
    : status
  const receiptItems = orderItems.map((item) => ({
    id: item.id,
    menu_id: item.menu_id,
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
    status: nextStatus,
    order_type: orderType,
    ...(orderType !== 'collection' && requestedFor
      ? { requested_for: requestedFor }
      : {}),
    ...(collection ? { collection } : {}),
    estimated_ready_minutes: 0,
    estimated_ready_at: '',
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
    payment,
    created_at: now,
    updated_at: now,
    created: {
      at: now,
      by: 'menu',
      app_id: currentMenuOrderAppId(),
    },
    updated: {
      at: now,
      by: 'menu',
    },
  }

  await db.doc(path).set(payload)

  return {
    id,
    path,
    order_number: number,
    status: nextStatus,
    order_type: orderType,
    ...(collection ? { collection } : {}),
    receipt: {
      id,
      order_number: number,
      order_type: orderType,
      status: nextStatus,
      created_at: receiptCreatedAt,
      ...(orderType !== 'collection' && requestedFor
        ? { requested_for: requestedFor }
        : {}),
      ...(collection ? { collection } : {}),
      currency: currencyCode,
      subtotal_chf: subtotal,
      ...(deliveryFee ? { delivery_fee_chf: deliveryFee } : {}),
      total_chf: total,
      payment,
      ...(Object.keys(customer).length ? { customer } : {}),
      items: receiptItems,
      kitchen: {
        id: context.kitchenId,
      },
      menu: {
        id: context.menuId,
      },
    },
    payment,
  }
})
