import {
  createError,
  defineEventHandler,
  getHeader,
  readRawBody,
  type H3Event,
} from 'h3'
import { FieldValue } from 'firebase-admin/firestore'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import {
  isKitchenOrderPostPaymentStatus,
  isKitchenOrderStatus,
  isKitchenOrderType,
} from '../../../../models/kitchen/order.model.ts'
import { statusAfterPayment } from '../../../menu/ordering/payment.ts'
import {
  allowUnsignedStripeWebhook,
  getMenuStripe,
} from '../../../menu/ordering/stripe.ts'
import { dispatchPreOrderWhatsApp } from '../../../menu/ordering/whatsapp.ts'

// Concurrent edit — 2026-07-19 21:10 CEST — Pre-order WhatsApp pass: release the pending alert only after verified Pay-now completion.
// Concurrent edit — 2026-07-21 16:41 CEST — FireUX Finance pass: make verified payment settlement transactional, non-regressive, and retryable.

const text = (value: unknown) => String(value ?? '').trim()
const safeSegment = (value: string) =>
  Boolean(value && !value.includes('/') && value !== '.' && value !== '..')
const amountMinor = (value: unknown) => {
  const amount = Number(value)

  return Number.isFinite(amount) && amount > 0
    ? Math.round(amount * 100)
    : 0
}

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
  const receivedAmount = Number(session?.amount_total)
  const receivedCurrency = text(session?.currency).toLowerCase()
  const paymentStatus = text(session?.payment_status).toLowerCase()
  const outcome = await db.runTransaction(async (transaction) => {
    const orderSnap = await transaction.get(orderRef)
    if (!orderSnap.exists) return { verified: false, notifyPreOrder: false }

    const order = orderSnap.data() || {}
    const payment = (order.payment && typeof order.payment === 'object')
      ? order.payment as Record<string, unknown>
      : {}
    const expectedSessionId = text(payment.stripe_checkout_session_id)
    const expectedAmount = amountMinor(payment.amount_chf)
    const expectedCurrency = text(payment.currency_code).toLowerCase()
    if (
      text(order.menu_id) !== metadata.menuId ||
      paymentStatus !== 'paid' ||
      !expectedSessionId ||
      expectedSessionId !== metadata.checkoutSessionId ||
      expectedAmount <= 0 ||
      receivedAmount !== expectedAmount ||
      !expectedCurrency ||
      receivedCurrency !== expectedCurrency
    ) {
      console.warn('[fireux-kitchens] Ignoring unverified Stripe payment completion', {
        orderId: metadata.orderId,
        paymentStatus,
        sessionMatches: expectedSessionId === metadata.checkoutSessionId,
        amountMatches: receivedAmount === expectedAmount,
        currencyMatches: receivedCurrency === expectedCurrency,
        menuMatches: text(order.menu_id) === metadata.menuId,
      })
      return { verified: false, notifyPreOrder: false }
    }

    const orderType = text(order.order_type)
    const currentStatus = text(order.status).toLowerCase()
    if (!isKitchenOrderType(orderType) || !isKitchenOrderStatus(currentStatus)) {
      console.warn('[fireux-kitchens] Ignoring Stripe payment with invalid Order lifecycle', {
        orderId: metadata.orderId,
        orderType,
        currentStatus,
      })
      return { verified: false, notifyPreOrder: false }
    }

    const resumeStatus = text(payment.resume_status)
    if (resumeStatus && !isKitchenOrderPostPaymentStatus(resumeStatus)) {
      console.warn('[fireux-kitchens] Ignoring Stripe payment with invalid resume state', {
        orderId: metadata.orderId,
        resumeStatus,
      })
      return { verified: false, notifyPreOrder: false }
    }

    if (text(payment.status).toLowerCase() === 'paid') {
      return {
        verified: true,
        notifyPreOrder: orderType === 'pre_order',
      }
    }

    const paidStatus = currentStatus === 'pending_payment'
      ? isKitchenOrderPostPaymentStatus(resumeStatus)
        ? resumeStatus
        : statusAfterPayment(orderType)
      : currentStatus
    const now = FieldValue.serverTimestamp()
    transaction.set(
      orderRef,
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
        updated: {
          at: now,
          by: 'stripe-webhook',
        },
      },
      { merge: true }
    )

    return {
      verified: true,
      notifyPreOrder:
        orderType === 'pre_order' && currentStatus === 'pending_payment',
    }
  })

  if (outcome.notifyPreOrder) {
    await dispatchPreOrderWhatsApp(db, {
      appId: metadata.appId,
      kitchenId: metadata.kitchenId,
      orderId: metadata.orderId,
    })
  }

  return { received: true }
})
