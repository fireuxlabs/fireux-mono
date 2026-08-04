// Concurrent edit — 2026-07-19 17:02 CEST — Delivery pass: accept customer amend/cancel responses for every Menu order surface.
// Concurrent edit — 2026-07-20 15:37 CEST — Anonymous Order capability pass: permit secure same-device amend/cancel without requiring sign-in.
import {
  createError,
  defineEventHandler,
  getQuery,
  getRouterParam,
  readBody,
} from 'h3'
import { FieldValue } from 'firebase-admin/firestore'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { setCorsHeaders } from 'fireux-core/runtime/server/utils/http/cors'
import { readMenuOrderContext } from '../../../../../menu/ordering/context.ts'
import {
  readMenuOrderCustomerAccess,
  requireMenuOrderCustomerAccess,
} from '../../../../../menu/ordering/order-capability.ts'
import { MENU_ORDER_CAPABILITY_HEADER } from '../../../../../../utils/menu-order-capability.ts'

type CustomerOrderResponseBody = {
  action?: 'amend' | 'cancel'
}

const text = (value: unknown) => String(value ?? '').trim()

// 2026-07-19 17:10 CEST: This is the customer-owned half of the shared public
// Menu Order lifecycle; Kitchen send-back must never decide cancellation for the customer.
export default defineEventHandler(async (event) => {
  setCorsHeaders(event, {
    methods: ['POST', 'OPTIONS'],
    headers: ['content-type', 'authorization', MENU_ORDER_CAPABILITY_HEADER],
  })

  const menuId = text(getRouterParam(event, 'menuId'))
  const orderId = text(getRouterParam(event, 'orderId'))
  const kitchenSlug = text(getQuery(event).kitchenSlug)
  const body = (await readBody(event)) as CustomerOrderResponseBody | null
  const action = body?.action
  if (!menuId || !orderId) {
    throw createError({ statusCode: 400, statusMessage: 'Order path is required.' })
  }
  const context = await readMenuOrderContext(menuId, kitchenSlug)
  const access = await readMenuOrderCustomerAccess(event)
  const db = getRuntimeFirestore()
  const orderRef = db.doc(
    `apps/${context.appId}/kitchens/${context.kitchenId}/orders/${orderId}`
  )
  const result = await db.runTransaction(async (transaction) => {
    const snap = await transaction.get(orderRef)
    if (!snap.exists) {
      throw createError({ statusCode: 404, statusMessage: 'Order not found.' })
    }

    const order = snap.data() || {}
    if (
      text(order.menu_id) !== context.menuId ||
      text(order.channel) !== 'menu'
    ) {
      throw createError({ statusCode: 404, statusMessage: 'Order not found.' })
    }
    const { actorId } = requireMenuOrderCustomerAccess(access, order)
    if (action !== 'amend' && action !== 'cancel') {
      throw createError({ statusCode: 400, statusMessage: 'Choose how to respond.' })
    }
    if (text(order.status) !== 'changes_requested') {
      throw createError({
        statusCode: 409,
        statusMessage: 'This order is no longer waiting for your response.',
      })
    }

    const now = FieldValue.serverTimestamp()
    const customerResponse = {
      action,
      at: now,
      by: actorId,
      ...(text(order.kitchen_note)
        ? { kitchen_note: text(order.kitchen_note) }
        : {}),
    }
    const patch = {
      status: 'cancelled' as const,
      customer_response: customerResponse,
    }

    transaction.set(orderRef, {
      ...patch,
      updated: { at: now, by: actorId },
    }, { merge: true })

    return {
      id: orderId,
      status: patch.status,
    }
  })

  return { ok: true, order: result }
})
