import { createError, type H3Event } from 'h3'
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
} from '../../utils/order.ts'
import {
  requireKitchenOperator,
  requireKitchenWriterAccount,
} from '../core/operator-access.ts'
import { buildKitchenOrderTransitionPatch } from './transition.ts'
import { publishAcceptedOrderCustomerNotification } from './customer-notification.ts'
import {
  buildCompletedKitchenOrderSale,
  KitchenSaleInvariantError,
} from './sale.ts'

export type KitchenOrderActionInput = {
  app_id?: string
  kitchen_id?: string
  order_id?: string
  transition?: string
  estimated_minutes?: number | null
  note?: string
}

export async function executeKitchenOrderAction(
  event: H3Event,
  body: KitchenOrderActionInput | null
) {
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
  const orders = serverKitchenOrdersTarget(kitchenId)
  const sales = serverKitchenSalesTarget(kitchenId)
  const financialFacts = serverAppFinancialFactsTarget(appId)
  const outcome = await runGuardedServerTransaction(
    { kind: 'runtime' },
    async (mutations) => {
      await requireKitchenWriterAccount({ appId, kitchenId }, uid, mutations)
      const order = await mutations.read<KitchenOrder>(orders, orderId)
      if (!order.exists) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Order not found.',
        })
      }

      // Guarded creates omit document identity from stored fields.
      const current = { ...order.data, id: orderId } as KitchenOrder
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
        paymentChoiceRequired:
          (patch.status || current.status) === 'awaiting_payment_choice',
        shouldNotify:
          current.payment?.flow !== 'confirmation_first' ||
          (patch.status || current.status) === 'awaiting_payment_choice',
      }
    }
  )

  if (transition === 'accept' && outcome.customerUid && outcome.shouldNotify) {
    try {
      await publishAcceptedOrderCustomerNotification({
        appId,
        kitchenId,
        orderId,
        orderNumber: outcome.orderNumber,
        orderType: outcome.orderType,
        customerUid: outcome.customerUid,
        paymentChoiceRequired: outcome.paymentChoiceRequired,
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
    app_id: appId,
    kitchen_id: kitchenId,
    order: {
      id: outcome.id,
      status: outcome.status,
    },
  }
}
