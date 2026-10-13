import type { MenuTarget } from '../ownership/target-types'
import type { GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { menuOrderReadSet, prepareMenuOrderContextGuard } from './commit-guard'
import { requireKitchenWriterAccount } from '../../../kitchen/server/core/operator-access'
import { validateMenuOrderSchedule } from './schedule'
import { createError, type H3Event } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { firebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import {
  menuOrderIdempotencyRequest,
  prepareMenuOrderCommand,
  readMenuOrderSelection,
} from './order-command.ts'
import { resolveMenuOrderFulfilment } from './order-fulfilment.ts'
import {
  assembleMenuOrderRecord,
  createMenuOrderRecordIdentity,
} from './order-record.ts'
import { readMenuOrderContext } from './context.ts'
import { readKitchenMenuOrdering } from './config.ts'
import {
  commitMenuOrderIdempotently,
  menuOrderReservationResponse,
  readMenuOrderIdempotentResponse,
  readMenuOrderIdempotencyKey,
} from './idempotency.ts'
import {
  readRequestedMenuOrderItems,
  type CreateMenuOrderBody,
} from './lines.ts'
import { requireKitchenOperator } from '../../../kitchen/server/core/operator-access.ts'
import { resolveMenuOrderItems } from './order-items.ts'
import { text } from './order-request.ts'
import { commitKitchenOrderWithNumbering } from '../../../kitchen/server/orders/order-numbering.ts'
import { dispatchPreOrderWhatsApp } from '../../../kitchen/server/ordering/whatsapp.ts'
import { requireKitchenKioskSession } from '../../../kitchen/server/kiosks/session.ts'
import { requireMenuOrderPaymentAvailability } from './payment-choice.ts'
import { menuOnlinePaymentAvailable } from './stripe.ts'

/** Menu ordering orchestration. Existing authentication adapters consume H3Event. */
export async function createMenuOrder(
  event: H3Event,
  input: {
    menuId: string
    kitchenSlug: string
    body: CreateMenuOrderBody | null
  }
) {
  const { menuId, kitchenSlug, body } = input
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

  let resolvedTarget: MenuTarget | undefined
  const context = await readMenuOrderContext(menuId, kitchenSlug, (target) => {
    resolvedTarget = target
  })
  const currencyCode = text(context.currencyCode)
  if (!currencyCode) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Kitchen currency code is required before creating orders.',
    })
  }
  const ordering = readKitchenMenuOrdering(
    context.kitchenOfferings,
    context.menuId,
    context.fulfilment,
    context.intake
  )
  const selection = readMenuOrderSelection(body, ordering)
  const kioskSession =
    selection.channel === 'kiosk'
      ? await requireKitchenKioskSession(event, {
          appId: context.appId,
          kitchenId: context.kitchenId,
          menuId: context.menuId,
          kitchenOfferingId: selection.kitchenOfferingId,
        })
      : null
  const customerUser =
    selection.channel === 'menu' ? await firebaseBearerUser(event) : null
  const actorId =
    selection.channel === 'staff_pos'
      ? await requireKitchenOperator(
          event,
          context,
          'Sign in before using Staff POS.'
        )
      : kioskSession
        ? `kiosk:${kioskSession.kioskId}`
        : 'menu'
  const command = prepareMenuOrderCommand({
    actorId,
    customerUid: customerUser?.uid,
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
    if (replay) {
      await dispatchOrderWhatsApp(context, replay)
      return replay
    }
  }

  if (!resolvedTarget) throw new Error('Menu ordering source was not resolved.')
  const validateContext = await prepareMenuOrderContextGuard(
    context,
    resolvedTarget
  )
  const pricingReads = menuOrderReadSet()
  const pricing = await resolveMenuOrderItems(db, {
    observe: pricingReads.observer,
    context,
    kitchenOfferingId: command.kitchenOfferingId,
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
  requireMenuOrderPaymentAvailability(
    fulfilment.policySnapshot,
    menuOnlinePaymentAvailable()
  )
  const assembled = assembleMenuOrderRecord({
    command,
    context,
    currencyCode,
    fulfilment,
    identity: createMenuOrderRecordIdentity(),
    items: pricing.items,
    subtotal: pricing.subtotal,
  })
  const reservationResponse = menuOrderReservationResponse(assembled.response)
  const validateBeforeCreate = async (tx: GuardedServerTransaction) => {
    await validateContext(tx)
    await pricingReads.validate(tx)
    if (selection.channel === 'staff_pos')
      await requireKitchenWriterAccount(context, actorId, tx)
    if (selection.channel === 'kiosk')
      await requireKitchenKioskSession(
        event,
        {
          appId: context.appId,
          kitchenId: context.kitchenId,
          menuId: context.menuId,
          kitchenOfferingId: selection.kitchenOfferingId,
        },
        tx
      )
    requireMenuOrderPaymentAvailability(
      fulfilment.policySnapshot,
      menuOnlinePaymentAvailable()
    )
    validateMenuOrderSchedule({
      collection: command.collection,
      hours: command.orderTypeConfig?.offering_hours?.operation_hours,
      noticeHours: command.orderTypeConfig?.notice_hours,
      slotIntervalMinutes: command.orderTypeConfig?.slot_interval_minutes,
      scheduleHorizonDays: command.orderTypeConfig?.schedule_horizon_days,
      asapEnabled: command.orderTypeConfig?.asap_enabled,
      orderType: command.orderType,
      requestedFor: command.requestedFor,
    })
  }

  if (idempotencyKey) {
    const committed = await commitMenuOrderIdempotently({
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
      linkedRecord: assembled.customerOrderLink,
      validateBeforeCreate,
    })

    await dispatchOrderWhatsApp(context, committed.response)
    return committed.response
  }

  const committed = await commitKitchenOrderWithNumbering({
    appId: context.appId,
    kitchenId: context.kitchenId,
    orderId: assembled.id,
    payload: assembled.payload,
    response: assembled.response,
    linkedRecord: assembled.customerOrderLink,
    validateBeforeCreate,
  })
  await dispatchOrderWhatsApp(context, committed)
  return committed
}

async function dispatchOrderWhatsApp(
  context: Awaited<ReturnType<typeof readMenuOrderContext>>,
  response: Record<string, unknown>
) {
  if (text(response.order_type) !== 'pre_order') return

  try {
    await dispatchPreOrderWhatsApp({
      appId: context.appId,
      kitchenId: context.kitchenId,
      orderId: text(response.id),
    })
  } catch {
    // The order is already committed; notification failure must not invite a
    // second order or expose provider/customer details in the response/log.
    console.warn('[menu-order] Committed order notification dispatch failed.')
  }
}
