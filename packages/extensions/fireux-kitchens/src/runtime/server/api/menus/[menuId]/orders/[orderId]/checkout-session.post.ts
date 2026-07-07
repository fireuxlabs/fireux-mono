import {
  createError,
  defineEventHandler,
  getQuery,
  getRequestURL,
  getRouterParam,
  type H3Event,
} from 'h3'
import { FieldValue } from 'firebase-admin/firestore'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { setCorsHeaders } from 'fireux-core/runtime/server/utils/http/cors.ts'
import type { KitchenOrderType } from '../../../../../../models/kitchen/order.model.ts'
import { readMenuOrderContext } from '../../../../../menu/ordering/context.ts'
import { statusAfterPayment } from '../../../../../menu/ordering/payment.ts'
import { getMenuStripe } from '../../../../../menu/ordering/stripe.ts'

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
const numberValue = (value: unknown) => {
  const number = Number(value)

  return Number.isFinite(number) ? number : 0
}
const safeSegment = (value: string) =>
  Boolean(value && !value.includes('/') && value !== '.' && value !== '..')
const amountMinor = (value: unknown) =>
  Math.max(0, Math.round(Number(value || 0) * 100))
const baseUrlFromEvent = (event: H3Event) => {
  const configured = process.env.APP_DOMAIN?.trim()
  const url = getRequestURL(event)
  if (!configured) return `${url.protocol}//${url.host}`

  const normalized = configured.replace(/\/$/, '')
  return /^https?:\/\//i.test(normalized)
    ? normalized
    : `${url.protocol}//${normalized}`
}

export default defineEventHandler(async (event) => {
  setCorsHeaders(event, {
    methods: ['POST', 'OPTIONS'],
  })

  const menuId = text(getRouterParam(event, 'menuId'))
  const orderId = text(getRouterParam(event, 'orderId'))
  const kitchenSlug = text(getQuery(event).kitchenSlug)
  if (!safeSegment(menuId) || !safeSegment(orderId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Order path is required.',
    })
  }

  const context = await readMenuOrderContext(menuId, kitchenSlug)
  const currencyCode = text(context.currencyCode)
  if (!currencyCode) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Kitchen currency code is required before payment.',
    })
  }
  const db = getRuntimeFirestore()
  const orderRef = db.doc(`apps/${context.appId}/kitchens/${context.kitchenId}/orders/${orderId}`)
  const orderSnap = await orderRef.get()
  if (!orderSnap.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Order not found.',
    })
  }

  const order = orderSnap.data() || {}
  const orderType = text(order.order_type) as KitchenOrderType
  const payment = resolveCheckoutPayment(order, currencyCode)
  if (!payment.required) {
    throw createError({
      statusCode: 400,
      statusMessage: 'This order cannot be paid online.',
    })
  }
  if (text(payment.status) === 'paid') {
    throw createError({
      statusCode: 400,
      statusMessage: 'This order has already been paid.',
    })
  }

  const minor = amountMinor(payment.amount_chf)
  if (minor <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Payment amount is not valid.',
    })
  }

  const baseUrl = baseUrlFromEvent(event)
  const menuPath = kitchenSlug
    ? `/kitchens/${encodeURIComponent(kitchenSlug)}/menus/${encodeURIComponent(menuId)}`
    : `/menus/${encodeURIComponent(menuId)}`
  const orderNumber = text(order.order_number) || orderId
  const reason = text(payment.reason) || 'Kitchen order payment'
  const resumeStatus = text(payment.resume_status) ||
    statusAfterPayment(orderType)
  const paymentCurrencyCode = text(payment.currency_code).toLowerCase()
  if (!paymentCurrencyCode) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Order payment currency is required.',
    })
  }

  // Stripe Checkout dynamic-price spine mirrors fireux-products checkout.
  const stripe = getMenuStripe()
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: paymentCurrencyCode,
          product_data: {
            name: `${reason} · ${orderNumber}`,
            metadata: {
              appId: context.appId,
              kitchenId: context.kitchenId,
              menuId: context.menuId,
              orderId,
            },
          },
          unit_amount: minor,
        },
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/customers?order=${encodeURIComponent(orderId)}&payment=success`,
    cancel_url: `${baseUrl}${menuPath}?order=${encodeURIComponent(orderId)}&payment=cancelled`,
    metadata: {
      appId: context.appId,
      kitchenId: context.kitchenId,
      menuId: context.menuId,
      orderId,
      flow: 'kitchen_order_payment',
    },
  })

  await orderRef.set(
    {
      status: 'pending_payment',
      payment: {
        ...payment,
        status: 'pending',
        resume_status: resumeStatus,
        stripe_checkout_session_id: session.id,
      },
      updated_at: FieldValue.serverTimestamp(),
      updated: {
        at: FieldValue.serverTimestamp(),
        by: 'stripe-checkout',
      },
    },
    { merge: true }
  )

  return {
    success: true,
    id: session.id,
    url: session.url || '',
  }
})

function resolveCheckoutPayment(
  order: Record<string, unknown>,
  currencyCode: string
) {
  const current = record(order.payment)
  if (current.required === true) {
    return {
      ...current,
      resume_status: resumeStatusForOrder(order, current),
    }
  }

  const status = text(order.status)
  if (!['open', 'on_pass'].includes(status)) {
    return { required: false }
  }

  const amount = orderTotal(order)
  if (amount <= 0) return { required: false }

  return {
    required: true,
    status: 'requires_payment',
    method: 'online_card',
    amount_chf: amount,
    currency_code: currencyCode,
    reason: text(order.order_type) === 'delivery'
      ? 'Delivery order payment'
      : 'Order payment',
    resume_status: resumeStatusForOrder(order, current),
  }
}

function resumeStatusForOrder(
  order: Record<string, unknown>,
  payment: Record<string, unknown>
) {
  const stored = text(payment.resume_status)
  if (stored) return stored

  const status = text(order.status)
  if (status && status !== 'pending_payment') return status

  return statusAfterPayment(text(order.order_type) as KitchenOrderType)
}

function orderTotal(order: Record<string, unknown>) {
  const items = Array.isArray(order.items) ? order.items : []
  const subtotal = items.reduce((sum, item) => {
    const row = record(item)
    const unitPrice = numberValue(row.unit_price || row.unit_price_chf)
    const quantity = Math.max(1, Number(row.quantity || 1) || 1)

    return sum + unitPrice * quantity
  }, 0)
  const match = record(order.fulfilment_match)

  return Math.max(
    0,
    Math.round((subtotal + numberValue(match.fee_chf)) * 100) / 100
  )
}
