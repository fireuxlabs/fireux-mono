import {
  createError,
  defineEventHandler,
  getQuery,
  getRouterParam,
  readBody,
} from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { setCorsHeaders } from 'fireux-core/runtime/server/utils/http/cors.ts'
import {
  menuOrderIdempotencyRequest,
  prepareMenuOrderCommand,
  readMenuOrderSelection,
} from '../../../menu/ordering/order-command.ts'
import { resolveMenuOrderFulfilment } from '../../../menu/ordering/order-fulfilment.ts'
import {
  assembleMenuOrderRecord,
  createMenuOrderRecordIdentity,
} from '../../../menu/ordering/order-record.ts'
import { readMenuOrderContext } from '../../../menu/ordering/context.ts'
import { readMenuOrderingConfig } from '../../../menu/ordering/config.ts'
import {
  commitMenuOrderIdempotently,
  menuOrderReservationResponse,
  readMenuOrderIdempotentResponse,
  readMenuOrderIdempotencyKey,
} from '../../../menu/ordering/idempotency.ts'
import {
  readRequestedMenuOrderItems,
  type CreateMenuOrderBody,
} from '../../../menu/ordering/lines.ts'
import { requireKitchenOperator } from '../../../kitchen/operator-access.ts'
import { resolveMenuOrderItems } from '../../../menu/ordering/order-items.ts'
import { text } from '../../../menu/ordering/order-request.ts'

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
  const selection = readMenuOrderSelection(body, ordering)
  const actorId = selection.channel === 'staff_pos'
    ? await requireKitchenOperator(
        event,
        context,
        'Sign in before using Staff POS.'
      )
    : 'menu'
  const command = prepareMenuOrderCommand({
    actorId,
    body,
    currencyCode,
    requestedItems,
    selection,
  })
  const idempotencyRequest = menuOrderIdempotencyRequest(
    command,
    context.menuId
  )
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

  const pricing = await resolveMenuOrderItems(db, {
    context,
    orderType: command.orderType,
    requestedItems: command.requestedItems,
  })
  const fulfilment = await resolveMenuOrderFulfilment({
    command,
    context,
    currencyCode,
    ordering,
    subtotal: pricing.subtotal,
  })
  const assembled = assembleMenuOrderRecord({
    command,
    context,
    currencyCode,
    fulfilment,
    identity: createMenuOrderRecordIdentity(),
    items: pricing.items,
    subtotal: pricing.subtotal,
  })
  const reservationResponse = menuOrderReservationResponse(
    assembled.response
  )

  if (idempotencyKey) {
    const committed = await commitMenuOrderIdempotently(db, {
      appId: context.appId,
      kitchenId: context.kitchenId,
      menuId: context.menuId,
      key: idempotencyKey,
      request: idempotencyRequest,
      orderId: assembled.id,
      orderPath: assembled.path,
      payload: assembled.payload,
      response: assembled.response,
      reservationResponse,
    })

    return committed.response
  }

  await db.doc(assembled.path).set(assembled.payload)

  return assembled.response
})
