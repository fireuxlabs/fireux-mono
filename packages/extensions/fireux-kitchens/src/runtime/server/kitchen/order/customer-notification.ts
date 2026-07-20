// Concurrent edit — 2026-07-20 15:27 CEST — Customer order notification pass: publish accepted Kitchen Orders to canonical User notifications.
import { createHash } from 'node:crypto'
import { Timestamp } from 'firebase-admin/firestore'
import { getRuntimeIdentityFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import {
  UserNotificationStorage,
  UserStorage,
} from 'fireux-core/runtime/models/core/user.model.ts'
import type { KitchenOrderType } from '../../../models/kitchen/order.model.ts'

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
  const number = String(orderNumber ?? '').trim().slice(0, 64)
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
  const identityDb = getRuntimeIdentityFirestore()
  const ref = identityDb
    .collection(UserStorage.rootCollection)
    .doc(input.customerUid)
    .collection(UserNotificationStorage.collection)
    .doc(notificationId(input))

  return await identityDb.runTransaction(async (transaction) => {
    const existing = await transaction.get(ref)
    if (existing.exists) return false

    transaction.create(ref, {
      message: notificationMessage(input.orderNumber, input.orderType),
      scope: 'app',
      created: {
        at: Timestamp.now(),
        app_id: input.appId,
      },
      read: false,
    })
    return true
  })
}
