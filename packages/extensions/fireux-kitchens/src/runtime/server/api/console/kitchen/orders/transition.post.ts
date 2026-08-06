// Concurrent edit — 2026-07-20 15:27 CEST — Customer order notification pass: notify signed-in customers after accepted Order commits.
// Concurrent edit — 2026-07-21 16:16 CEST — FireUX Finance pass: atomically create immutable Sale and gross-sale facts on completion.
import { createError, defineEventHandler, readBody, type H3Event } from 'h3'
import { FieldValue } from 'firebase-admin/firestore'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requirePathSegment } from 'fireux-core/runtime/server/utils/ids/path'
import {
  serverAppFinancialFactsTarget,
  serverKitchenOrdersTarget,
  serverKitchenSalesTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  isKitchenOrderTransition,
  type KitchenOrder,
} from '../../../../../models/kitchen/order.model.ts'
import { requireKitchenOperator } from '../../../../../server/kitchen/operator-access.ts'
import { buildKitchenOrderTransitionPatch } from '../../../../../server/kitchen/order/transition.ts'
import { publishAcceptedOrderCustomerNotification } from '../../../../../server/kitchen/order/customer-notification.ts'
import {
  buildCompletedKitchenOrderSale,
  KitchenSaleInvariantError,
} from '../../../../../server/kitchen/order/sale.ts'

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
  const orders = serverKitchenOrdersTarget(appId, kitchenId)
  const sales = serverKitchenSalesTarget(appId, kitchenId)
  const financialFacts = serverAppFinancialFactsTarget(appId)
  const outcome = await runGuardedServerTransaction(
    { kind: 'runtime' },
    async (mutations) => {
      const order = await mutations.read<KitchenOrder>(orders, orderId)
      if (!order.exists) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Order not found.',
        })
      }

      const current = order.data as KitchenOrder
      const patch = buildKitchenOrderTransitionPatch(current, transition, {
        estimatedMinutes: body?.estimated_minutes,
        note: body?.note,
      })
      const now = FieldValue.serverTimestamp()
      if (transition === 'complete') {
        try {
          const completed = buildCompletedKitchenOrderSale({
            appId,
            kitchenId,
            orderId,
            order: current,
            actorId: uid,
            timestamp: now,
          })
          mutations.create(sales, completed.sale.id, completed.sale)
          mutations.create(
            financialFacts,
            completed.financialFact.id,
            completed.financialFact
          )
        } catch (error) {
          if (error instanceof KitchenSaleInvariantError) {
            throw createError({
              statusCode: 409,
              statusMessage: error.message,
            })
          }
          throw error
        }
      }
      mutations.update<Record<string, unknown>>(orders, orderId, {
        ...patch,
        updated: {
          at: now,
          by: uid,
        },
      })

      return {
        id: orderId,
        status: patch.status || current.status,
        customerUid: String(current.customer_uid ?? '').trim(),
        orderNumber: String(current.order_number ?? '').trim(),
        orderType: current.order_type,
      }
    }
  )

  if (transition === 'accept' && outcome.customerUid) {
    try {
      await publishAcceptedOrderCustomerNotification({
        appId,
        kitchenId,
        orderId,
        orderNumber: outcome.orderNumber,
        orderType: outcome.orderType,
        customerUid: outcome.customerUid,
      })
    } catch (error) {
      console.error('[Kitchen order] customer acceptance notification failed', {
        appId,
        kitchenId,
        orderId,
        error,
      })
    }
  }

  return {
    ok: true,
    order: {
      id: outcome.id,
      status: outcome.status,
    },
  }
})
