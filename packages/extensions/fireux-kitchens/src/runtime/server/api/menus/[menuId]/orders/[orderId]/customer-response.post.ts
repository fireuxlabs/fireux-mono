import {
  createError,
  defineEventHandler,
  getQuery,
  getRouterParam,
  readBody,
} from 'h3'
import { FieldValue } from 'firebase-admin/firestore'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { setCorsHeaders } from 'fireux-core/runtime/server/utils/http/cors.ts'
import { readMenuOrderingConfig } from '../../../../../menu/ordering/config.ts'
import { readMenuOrderContext } from '../../../../../menu/ordering/context.ts'
import { validateMenuOrderSchedule } from '../../../../../menu/ordering/schedule.ts'

type CustomerOrderResponseBody = {
  action?: 'cancel' | 'reschedule'
  collection?: {
    mode?: 'queue' | 'scheduled'
    requested_for?: string
  }
}

const text = (value: unknown) => String(value ?? '').trim()

// 2026-07-19 15:28 CEST: This is the customer-owned half of the shared Order lifecycle; Kitchen send-back must never decide cancellation for the customer.
export default defineEventHandler(async (event) => {
  setCorsHeaders(event, {
    methods: ['POST', 'OPTIONS'],
    headers: ['content-type', 'authorization'],
  })

  const { uid } = await requireFirebaseBearerUser(event)
  const menuId = text(getRouterParam(event, 'menuId'))
  const orderId = text(getRouterParam(event, 'orderId'))
  const kitchenSlug = text(getQuery(event).kitchenSlug)
  const body = (await readBody(event)) as CustomerOrderResponseBody | null
  const action = body?.action
  if (!menuId || !orderId) {
    throw createError({ statusCode: 400, statusMessage: 'Order path is required.' })
  }
  if (action !== 'cancel' && action !== 'reschedule') {
    throw createError({ statusCode: 400, statusMessage: 'Choose how to respond.' })
  }

  const context = await readMenuOrderContext(menuId, kitchenSlug)
  const ordering = readMenuOrderingConfig(
    context.menuData,
    context.fulfilment,
    context.operationHours
  )
  const collectionConfig = ordering.order_types.find(type =>
    type.type === 'collection'
  )
  const collection = action === 'reschedule'
    ? readCollection(body?.collection)
    : null
  if (action === 'reschedule') {
    if (!collectionConfig || !collection) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Choose another collection time.',
      })
    }
    validateMenuOrderSchedule({
      collection,
      hours: collectionConfig.service_hours?.operation_hours,
      noticeHours: collectionConfig.notice_hours,
      orderType: 'collection',
      requestedFor: collection.requested_for || '',
    })
  }

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
      text(order.order_type) !== 'collection' ||
      text(order.customer_uid) !== uid
    ) {
      throw createError({ statusCode: 404, statusMessage: 'Order not found.' })
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
      by: uid,
      ...(text(order.kitchen_note)
        ? { kitchen_note: text(order.kitchen_note) }
        : {}),
    }
    const patch = action === 'cancel'
      ? {
          status: 'cancelled',
          customer_response: customerResponse,
        }
      : {
          status: 'pending_acceptance',
          collection,
          requested_for: collection?.mode === 'scheduled'
            ? collection.requested_for
            : FieldValue.delete(),
          kitchen_note: FieldValue.delete(),
          estimated_ready_minutes: 0,
          estimated_ready_at: '',
          customer_response: customerResponse,
        }

    transaction.set(orderRef, {
      ...patch,
      updated: { at: now, by: uid },
    }, { merge: true })

    return {
      id: orderId,
      status: patch.status,
    }
  })

  return { ok: true, order: result }
})

function readCollection(value: CustomerOrderResponseBody['collection']) {
  const mode = value?.mode
  const requestedFor = text(value?.requested_for)
  if (mode === 'queue') return { mode: 'queue' as const }
  if (mode === 'scheduled' && requestedFor) {
    return {
      mode: 'scheduled' as const,
      requested_for: requestedFor,
    }
  }

  return null
}
