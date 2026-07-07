import {
  createError,
  defineEventHandler,
  getHeader,
  readRawBody,
  type H3Event,
} from 'h3'
import { FieldValue } from 'firebase-admin/firestore'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import type { KitchenOrderType } from '../../../../models/kitchen/order.model.ts'
import { statusAfterPayment } from '../../../menu/ordering/payment.ts'
import {
  allowUnsignedStripeWebhook,
  getMenuStripe,
} from '../../../menu/ordering/stripe.ts'

const text = (value: unknown) => String(value ?? '').trim()
const safeSegment = (value: string) =>
  Boolean(value && !value.includes('/') && value !== '.' && value !== '..')

function readKitchenOrderPaymentMetadata(session: any) {
  const metadata = session?.metadata || {}
  const appId = text(metadata.appId)
  const kitchenId = text(metadata.kitchenId)
  const menuId = text(metadata.menuId)
  const orderId = text(metadata.orderId)
  const flow = text(metadata.flow)
  const checkoutSessionId = text(session?.id)

  if (flow !== 'kitchen_order_payment') return null
  if (![appId, kitchenId, menuId, orderId, checkoutSessionId].every(safeSegment)) {
    console.warn('[fireux-kitchens] Ignoring Stripe payment webhook with invalid metadata', {
      appId,
      kitchenId,
      menuId,
      orderId,
      checkoutSessionId,
    })
    return null
  }

  return {
    appId,
    kitchenId,
    menuId,
    orderId,
    checkoutSessionId,
    paymentIntentId: text(session?.payment_intent),
  }
}

export default defineEventHandler(async (event: H3Event) => {
  const stripe = getMenuStripe()
  const rawBody = await readRawBody(event)
  if (!rawBody) {
    throw createError({ statusCode: 400, statusMessage: 'Missing webhook body' })
  }

  const signature = getHeader(event, 'stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim()
  let stripeEvent: any

  if (webhookSecret) {
    if (!signature) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing stripe-signature header',
      })
    }
    stripeEvent = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } else {
    if (!allowUnsignedStripeWebhook()) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Stripe webhook signature verification is not configured',
      })
    }

    stripeEvent = JSON.parse(rawBody)
  }

  if (stripeEvent?.type !== 'checkout.session.completed') {
    return { received: true }
  }

  const session = stripeEvent.data?.object
  const metadata = readKitchenOrderPaymentMetadata(session)
  if (!metadata) return { received: true }

  const db = getRuntimeFirestore()
  const orderRef = db.doc(
    `apps/${metadata.appId}/kitchens/${metadata.kitchenId}/orders/${metadata.orderId}`
  )
  const orderSnap = await orderRef.get()
  if (!orderSnap.exists) return { received: true }

  const order = orderSnap.data() || {}
  const payment = (order.payment && typeof order.payment === 'object')
    ? order.payment as Record<string, unknown>
    : {}
  const orderType = text(order.order_type) as KitchenOrderType
  const paidStatus = text(payment.resume_status) || statusAfterPayment(orderType)
  const now = FieldValue.serverTimestamp()

  await orderRef.set(
    {
      status: paidStatus,
      payment: {
        ...payment,
        required: true,
        status: 'paid',
        stripe_checkout_session_id: metadata.checkoutSessionId,
        ...(metadata.paymentIntentId
          ? { stripe_payment_intent_id: metadata.paymentIntentId }
          : {}),
        paid_at: now,
      },
      updated_at: now,
      updated: {
        at: now,
        by: 'stripe-webhook',
      },
    },
    { merge: true }
  )

  return { received: true }
})
