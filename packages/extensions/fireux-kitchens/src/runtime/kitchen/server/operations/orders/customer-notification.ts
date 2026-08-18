// Concurrent edit — 2026-07-20 15:27 CEST — Customer order notification pass: publish accepted Kitchen Orders to canonical User notifications.
import { createHash } from 'node:crypto'
import { Timestamp } from 'firebase-admin/firestore'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverIdentityUserNotificationsTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import type { KitchenOrderType } from '../../../models/order.model.ts'

type AcceptedOrderCustomerNotificationInput = {
  appId: string
  kitchenId: string
  orderId: string
  orderNumber?: string
  orderType: KitchenOrderType
  customerUid: string
}

function notificationId(input: AcceptedOrderCustomerNotificationInput) {
  const digest = createHash('sha256')
    .update(`${input.appId}\u0000${input.kitchenId}\u0000${input.orderId}`)
    .digest('hex')
  return `kitchen-order-accepted-${digest}`
}

function notificationMessage(
  orderNumber: string | undefined,
  orderType: KitchenOrderType
) {
  const number = String(orderNumber ?? '')
    .trim()
    .slice(0, 64)
  if (orderType === 'pre_order') {
    return number
      ? `Your pre-order ${number} has been confirmed by the Kitchen.`
      : 'Your pre-order has been confirmed by the Kitchen.'
  }

  return number
    ? `Your order ${number} has been accepted by the Kitchen.`
    : 'Your order has been accepted by the Kitchen.'
}

export async function publishAcceptedOrderCustomerNotification(
  input: AcceptedOrderCustomerNotificationInput
) {
  const notifications = serverIdentityUserNotificationsTarget(input.customerUid)
  const id = notificationId(input)
  return await runGuardedServerTransaction(
    { kind: 'identity' },
    async (mutations) => {
      const existing = await mutations.read(notifications, id)
      if (existing.exists) return false

      mutations.create(notifications, id, {
        message: notificationMessage(input.orderNumber, input.orderType),
        scope: 'app',
        created: {
          at: Timestamp.now(),
          app_id: input.appId,
        },
        read: false,
      })
      return true
    }
  )
}
