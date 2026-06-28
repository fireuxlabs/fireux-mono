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
import { readMenuOrderContext } from '../../../../../utils/menu-order-context.ts'
import { getMenuStripe } from '../../../../../utils/menu-stripe.ts'

const text = (value: unknown) => String(value ?? '').trim()
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
  const payment = (order.payment && typeof order.payment === 'object')
    ? order.payment as Record<string, unknown>
    : {}
  if (payment.required !== true) {
    throw createError({
      statusCode: 400,
      statusMessage: 'This order does not require online payment.',
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

  const stripe = getMenuStripe()
  const baseUrl = baseUrlFromEvent(event)
  const menuPath = kitchenSlug
    ? `/kitchens/${encodeURIComponent(kitchenSlug)}/menus/${encodeURIComponent(menuId)}`
    : `/menus/${encodeURIComponent(menuId)}`
  const orderNumber = text(order.order_number) || orderId
  const reason = text(payment.reason) || 'Kitchen order payment'

  // Stripe Checkout dynamic-price spine mirrors fireux-products checkout.
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: text(payment.currency_code || 'CHF').toLowerCase(),
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
