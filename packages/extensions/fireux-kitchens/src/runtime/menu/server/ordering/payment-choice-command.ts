import { createError, type H3Event } from 'h3'
import { FieldValue } from 'firebase-admin/firestore'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverKitchenOrdersTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import type {
  KitchenOrder,
  KitchenOrderPaymentMethod,
} from '../../../kitchen/utils/order'
import { readMenuOrderContext } from './context'
import {
  readMenuOrderCustomerAccess,
  requireMenuOrderCustomerAccess,
} from './order-capability'
import { buildOrderPaymentChoice, orderPaymentChoices } from './payment-choice'
import { getMenuStripe, menuOnlinePaymentAvailable } from './stripe'

/** Customer payment orchestration; authentication retains the existing H3 adapter. */
export async function executeMenuOrderPaymentChoice(
  event: H3Event,
  input: {
    menuId: string
    orderId: string
    kitchenSlug: string
    method: unknown
  }
) {
  const { menuId, orderId, kitchenSlug, method } = input
  const context = await readMenuOrderContext(menuId, kitchenSlug)
  const access = await readMenuOrderCustomerAccess(event)
  const authorize = (order: KitchenOrder) => {
    if (
      order.menu_id !== context.menuId ||
      order.kitchen_id !== context.kitchenId ||
      order.created?.app_id !== context.appId
    )
      throw createError({ statusCode: 404, statusMessage: 'Order not found.' })
    return requireMenuOrderCustomerAccess(
      access,
      order as unknown as Record<string, unknown>
    )
  }
  const snapshot = await getRuntimeFirestore()
    .doc(`kitchens/${context.kitchenId}/orders/${orderId}`)
    .get()
  if (!snapshot.exists)
    throw createError({ statusCode: 404, statusMessage: 'Order not found.' })
  const initial = snapshot.data() as KitchenOrder
  authorize(initial)
  if (
    initial.payment?.method !== method &&
    !orderPaymentChoices(initial, menuOnlinePaymentAvailable()).includes(
      method as KitchenOrderPaymentMethod
    )
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Choose an available payment method.',
    })
  const sessionId = initial.payment?.stripe_checkout_session_id
  let expiredSession = ''
  if (sessionId && initial.payment.method !== method) {
    // Expiry is verified by Stripe before a second method can become eligible.
    if (
      initial.payment.flow !== 'confirmation_first' ||
      initial.status !== 'pending_payment' ||
      initial.payment.status === 'paid'
    )
      throw createError({
        statusCode: 409,
        statusMessage: 'This payment choice cannot be changed.',
      })
    const stripe = getMenuStripe()
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.status === 'complete' || session.payment_status === 'paid')
      throw createError({
        statusCode: 409,
        statusMessage: 'Payment is completing. Wait for the order to update.',
      })
    const expired =
      session.status === 'expired'
        ? session
        : await stripe.checkout.sessions.expire(sessionId)
    if (expired.status !== 'expired')
      throw createError({
        statusCode: 409,
        statusMessage: 'The current payment attempt could not be closed.',
      })
    expiredSession = sessionId
  }
  const orders = serverKitchenOrdersTarget(context.kitchenId)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const latest = await mutations.read<KitchenOrder>(orders, orderId)
    if (!latest.exists)
      throw createError({ statusCode: 404, statusMessage: 'Order not found.' })
    const order = latest.data as KitchenOrder
    const { actorId } = authorize(order)
    if (expiredSession) {
      if (
        order.payment.stripe_checkout_session_id !== expiredSession ||
        order.payment.status === 'paid'
      )
        throw createError({
          statusCode: 409,
          statusMessage: 'Payment changed. Refresh the order.',
        })
      order.payment = { ...order.payment }
      delete order.payment.stripe_checkout_session_id
    }
    const patch = buildOrderPaymentChoice(
      order,
      method,
      menuOnlinePaymentAvailable()
    )
    if (Object.keys(patch).length)
      mutations.update<Record<string, unknown>>(orders, orderId, {
        ...patch,
        updated: { at: FieldValue.serverTimestamp(), by: actorId },
      })
    return {
      ok: true,
      status: patch.status || order.status,
      payment: patch.payment || order.payment,
    }
  })
}
