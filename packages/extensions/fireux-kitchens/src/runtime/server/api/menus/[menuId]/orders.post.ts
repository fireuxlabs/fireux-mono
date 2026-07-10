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
  checkMenuDeliveryAddress,
  checkMenuDeliveryPlaceId,
  resolveMenuDeliveryOrigin,
  type MenuDeliveryAddressResult,
} from '../../../menu/ordering/delivery-address.ts'
import { readMenuOrderContext } from '../../../menu/ordering/context.ts'
import { isMenuOrderingEnabled, readMenuOrderingConfig } from '../../../menu/ordering/config.ts'
import {
  commitMenuOrderIdempotently,
  menuOrderReservationResponse,
  readMenuOrderIdempotentResponse,
  readMenuOrderIdempotencyKey,
} from '../../../menu/ordering/idempotency.ts'
import { resolveMenuOrderPayment } from '../../../menu/ordering/payment.ts'
import { requireMenuOrderOperator } from '../../../menu/ordering/operator-access.ts'
import { readRequestedMenuOrderItems, type CreateMenuOrderBody } from '../../../menu/ordering/lines.ts'
import { resolveMenuOrderItems } from '../../../menu/ordering/order-items.ts'
import { validateMenuOrderSchedule } from '../../../menu/ordering/schedule.ts'
import {
  money,
  normalizeOrderChannel,
  normalizeOrderType,
  normalizePaymentMethod,
  numberValue,
  orderId,
  orderNumber,
  readCollection,
  readCustomer,
  readOrderRoomService,
  readOrderTable,
  statusForOrderType,
  text,
} from '../../../menu/ordering/order-request.ts'

export default defineEventHandler(async (event) => {
  setCorsHeaders(event, {
    methods: ['POST', 'OPTIONS'],
    headers: ['content-type', 'authorization'],
  })

  const menuId = text(getRouterParam(event, 'menuId'))
  const kitchenSlug = text(getQuery(event).kitchenSlug)
  const body = (await readBody(event)) as CreateMenuOrderBody | null
  const requestedItems = readRequestedMenuOrderItems(body)
  const idempotencyKey = readMenuOrderIdempotencyKey(body?.idempotency_key)
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
  const ordering = readMenuOrderingConfig(
    context.menuData,
    context.fulfilment,
    context.operationHours
  )
  const allowedOrderTypes = ordering.order_types.map((type) => type.type)
  if (!isMenuOrderingEnabled(ordering)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'This menu is not accepting orders yet.',
    })
  }

  const orderType = normalizeOrderType(body?.order_type, allowedOrderTypes)
  const channel = normalizeOrderChannel(body?.channel, orderType)
  const actorId = channel === 'staff_pos'
    ? await requireMenuOrderOperator(event, context)
    : 'menu'
  const orderTypeConfig = ordering.order_types.find((type) =>
    type.type === orderType
  )
  const configuredPaymentMethods =
    orderTypeConfig?.fulfilment?.payment_methods || []
  const allowedPaymentMethods = orderTypeConfig?.fulfilment?.deposit
    ? ['deposit' as const]
    : configuredPaymentMethods
  const requestedPaymentMethod = normalizePaymentMethod(
    body?.payment_method,
    allowedPaymentMethods
  )
  const paymentMethod = requestedPaymentMethod ||
    (orderTypeConfig?.fulfilment?.deposit
      ? 'deposit'
      : allowedPaymentMethods.length === 1
        ? allowedPaymentMethods[0]
        : undefined)
  if (allowedPaymentMethods.length && !paymentMethod) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Choose a payment method.',
    })
  }
  const requestedFor = text(body?.requested_for)
  const collection = readCollection(body?.collection, orderType)
  let customer = readCustomer(body?.customer)
  const table = readOrderTable(body?.table, orderType)
  const roomService = readOrderRoomService(body?.room_service, orderType)
  const depositPolicy = orderTypeConfig?.fulfilment?.deposit
  const depositCurrencyCode = text(depositPolicy?.currency_code).toUpperCase()
  if (depositCurrencyCode && depositCurrencyCode !== currencyCode.toUpperCase()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Deposit currency must match the kitchen currency.',
    })
  }
  if (
    depositPolicy?.type === 'fixed_per_person' &&
    !Number(customer.party_size)
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Party size is required for this deposit.',
    })
  }
  const idempotencyRequest = {
    channel,
    ...(actorId !== 'menu' ? { creator_id: actorId } : {}),
    order_type: orderType,
    items: requestedItems.map((item) => ({
      item_id: item.itemId,
      menu_id: item.menuId || context.menuId,
      quantity: item.quantity,
      variant: item.variant
        ? {
            id: text(item.variant.id),
            label: text(item.variant.label),
          }
        : null,
      add_ons: item.addOns.map((addOn) => ({
        id: text(addOn.id),
        label: text(addOn.label),
      })),
    })),
    ...(collection ? { collection } : {}),
    ...(requestedFor ? { requested_for: requestedFor } : {}),
    ...(paymentMethod ? { payment_method: paymentMethod } : {}),
    ...(Object.keys(customer).length ? { customer } : {}),
    ...(table ? { table } : {}),
    ...(roomService ? { room_service: roomService } : {}),
  }
  const db = getRuntimeFirestore()
  if (idempotencyKey) {
    const replay = await readMenuOrderIdempotentResponse(db, {
      appId: context.appId,
      kitchenId: context.kitchenId,
      menuId: context.menuId,
      key: idempotencyKey,
      request: idempotencyRequest,
    })
    if (replay) return replay
  }
  validateMenuOrderSchedule({
    collection,
    hours: ordering.service_hours?.operation_hours,
    noticeHours: orderTypeConfig?.notice_hours,
    orderType,
    requestedFor,
  })
  let deliveryAddressResult: MenuDeliveryAddressResult | null = null
  if (orderType === 'delivery') {
    const zones = orderTypeConfig?.fulfilment?.delivery_zones || []
    const origin = await resolveMenuDeliveryOrigin(
      context.kitchenPlaceId || context.kitchenId,
      zones
    )
    deliveryAddressResult = customer.address_place_id
      ? await checkMenuDeliveryPlaceId(customer.address_place_id, zones, origin)
      : await checkMenuDeliveryAddress(customer.address || '', zones, origin)
    if (!deliveryAddressResult.deliverable) {
      throw createError({
        statusCode: 400,
        statusMessage: deliveryAddressResult.reason || 'This address is outside the delivery area.',
      })
    }

    const verifiedAddress = deliveryAddressResult.address
    if (verifiedAddress?.formatted) {
      customer = {
        ...customer,
        address: verifiedAddress.formatted,
        ...(verifiedAddress.place_id
          ? { address_place_id: verifiedAddress.place_id }
          : {}),
      }
      if (!verifiedAddress.place_id) delete customer.address_place_id
    }
  }
  const { items: orderItems, subtotal } = await resolveMenuOrderItems(db, {
    context,
    orderType,
    requestedItems,
  })
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
    ...(table ? { table } : {}),
    ...(roomService ? { room_service: roomService } : {}),
    estimated_ready_minutes: 0,
    estimated_ready_at: '',
    ...(Object.keys(customer).length ? { customer } : {}),
    ...(deliveryAddressResult?.zone
      ? {
          fulfilment_match: {
            type: 'delivery_zone',
            zone: deliveryAddressResult.zone,
            delivery_address: deliveryAddressResult.address,
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
    channel,
    ...(actorId !== 'menu' ? { creator_id: actorId } : {}),
    items: orderItems,
    payment,
    created_at: now,
    updated_at: now,
    created: {
      at: now,
      by: actorId,
      app_id: context.appId,
    },
    updated: {
      at: now,
      by: actorId,
    },
  }

  const response = {
    id,
    path,
    order_number: number,
    status: nextStatus,
    order_type: orderType,
    channel,
    ...(collection ? { collection } : {}),
    ...(table ? { table } : {}),
    ...(roomService ? { room_service: roomService } : {}),
    receipt: {
      id,
      order_number: number,
      order_type: orderType,
      channel,
      status: nextStatus,
      created_at: receiptCreatedAt,
      ...(orderType !== 'collection' && requestedFor
        ? { requested_for: requestedFor }
        : {}),
      ...(collection ? { collection } : {}),
      ...(table ? { table } : {}),
      ...(roomService ? { room_service: roomService } : {}),
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
  const reservationResponse = menuOrderReservationResponse(response)

  if (idempotencyKey) {
    const committed = await commitMenuOrderIdempotently(db, {
      appId: context.appId,
      kitchenId: context.kitchenId,
      menuId: context.menuId,
      key: idempotencyKey,
      request: idempotencyRequest,
      orderId: id,
      orderPath: path,
      payload,
      response,
      reservationResponse,
    })

    return committed.response
  }

  await db.doc(path).set(payload)

  return response
})
