import {
  createError,
  defineEventHandler,
  readBody,
  type H3Event,
} from 'h3'
import { FieldValue } from 'firebase-admin/firestore'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { requirePathSegment } from 'fireux-core/runtime/server/utils/ids/path.ts'
import {
  isKitchenOrderTransition,
  type KitchenOrder,
} from '../../../../../models/kitchen/order.model.ts'
import { requireKitchenOperator } from '../../../../../server/kitchen/operator-access.ts'
import { buildKitchenOrderTransitionPatch } from '../../../../../server/kitchen/order/transition.ts'

type TransitionKitchenOrderBody = {
  app_id?: string
  kitchen_id?: string
  order_id?: string
  transition?: string
  estimated_minutes?: number | null
  note?: string
}

export default defineEventHandler(async (event: H3Event) => {
  const body = (await readBody(event)) as TransitionKitchenOrderBody | null
  const appId = requirePathSegment(body?.app_id, 'App id')
  const kitchenId = requirePathSegment(body?.kitchen_id, 'Kitchen id')
  const orderId = requirePathSegment(body?.order_id, 'Order id')
  const transition = String(body?.transition ?? '').trim()
  if (!isKitchenOrderTransition(transition)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Order transition is invalid.',
    })
  }

  const uid = await requireKitchenOperator(event, { appId, kitchenId })
  const db = getRuntimeFirestore()
  const orderRef = db.doc(`apps/${appId}/kitchens/${kitchenId}/orders/${orderId}`)
  const order = await db.runTransaction(async (transaction) => {
    const snap = await transaction.get(orderRef)
    if (!snap.exists) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Order not found.',
      })
    }

    const current = snap.data() as KitchenOrder
    const patch = buildKitchenOrderTransitionPatch(current, transition, {
      estimatedMinutes: body?.estimated_minutes,
      note: body?.note,
    })
    const now = FieldValue.serverTimestamp()
    transaction.set(
      orderRef,
      {
        ...patch,
        updated: {
          at: now,
          by: uid,
        },
      },
      { merge: true }
    )

    return {
      id: orderId,
      status: patch.status || current.status,
    }
  })

  return { ok: true, order }
})
