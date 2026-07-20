import {
  createError,
  defineEventHandler,
  getQuery,
  getRequestURL,
  getRouterParam,
  type H3Event,
} from 'h3'
import { createHash } from 'node:crypto'
import { FieldValue } from 'firebase-admin/firestore'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { setCorsHeaders } from 'fireux-core/runtime/server/utils/http/cors.ts'
import {
  isKitchenOrderPostPaymentStatus,
  type KitchenOrderType,
} from '../../../../../../models/kitchen/order.model.ts'
import { readMenuOrderContext } from '../../../../../menu/ordering/context.ts'
import {
  readMenuOrderCustomerAccess,
  requireMenuOrderCustomerAccess,
} from '../../../../../menu/ordering/order-capability.ts'
import { statusAfterPayment } from '../../../../../menu/ordering/payment.ts'
import { getMenuStripe } from '../../../../../menu/ordering/stripe.ts'
import {
  menuChoiceContextForOrderType,
} from '../../../../../../utils/menu-context.ts'
import {
  menuRoutePath,
} from '../../../../../../utils/kitchen-menu-route.ts'
import { MENU_ORDER_CAPABILITY_HEADER } from '../../../../../../utils/menu-order-capability.ts'

// Concurrent edit — 2026-07-20 15:20 CEST — Anonymous Order capability pass: restrict checkout creation to the customer UID or opaque same-device capability.

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
const safeSegment = (value: string) =>
  Boolean(value && !value.includes('/') && value !== '.' && value !== '..')
const amountMinor = (value: unknown) => {
  const amount = Number(value)

  return Number.isFinite(amount) && amount > 0
    ? Math.round(amount * 100)
    : 0
}
const checkoutIdempotencyKey = (input: {
  appId: string
  kitchenId: string
  orderId: string
  amountMinor: number
  currencyCode: string
}) => `menu-order-checkout-${createHash('sha256')
  .update(JSON.stringify(input))
  .digest('hex')}`
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
    headers: ['authorization', MENU_ORDER_CAPABILITY_HEADER],
  })

  const menuId = text(getRouterParam(event, 'menuId'))
  const orderId = text(getRouterParam(event, 'orderId'))
  const query = getQuery(event)
  const kitchenSlug = text(query.kitchenSlug)
  if (!safeSegment(menuId) || !safeSegment(orderId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Order path is required.',
    })
  }

  const context = await readMenuOrderContext(menuId, kitchenSlug)
  const access = await readMenuOrderCustomerAccess(event)
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
  if (text(order.menu_id) !== context.menuId) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Order not found.',
    })
  }
  requireMenuOrderCustomerAccess(access, order)
  const orderType = text(order.order_type) as KitchenOrderType
  const payment = resolveCheckoutPayment(order)
  const orderStatus = text(order.status).toLowerCase()
  const paymentStatus = text(payment.status).toLowerCase()
  if (
    ['changes_requested', 'cancelled', 'completed', 'trashed'].includes(orderStatus) ||
    paymentStatus === 'refunded'
  ) {
    throw createError({
      statusCode: 409,
      statusMessage: 'This order can no longer be paid.',
    })
  }
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
  const menuPath = menuRoutePath({
    scope: context.routeScope,
    menuId: context.routeMenuId,
    context: menuChoiceContextForOrderType(orderType),
  })
  if (!menuPath) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Menu return path is unavailable.',
    })
  }
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
  const session = await stripe.checkout.sessions.create(
    {
      mode: 'payment',
      payment_method_types: ['card'],
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
      success_url: `${baseUrl}/dashboard/customer/profile?order=${encodeURIComponent(orderId)}&payment=success`,
      cancel_url: `${baseUrl}${menuPath}?order=${encodeURIComponent(orderId)}&payment=cancelled`,
      metadata: {
        appId: context.appId,
        kitchenId: context.kitchenId,
        menuId: context.menuId,
        orderId,
        flow: 'kitchen_order_payment',
      },
    },
    {
      idempotencyKey: checkoutIdempotencyKey({
        appId: context.appId,
        kitchenId: context.kitchenId,
        orderId,
        amountMinor: minor,
        currencyCode: paymentCurrencyCode,
      }),
    }
  )

  await orderRef.set(
    {
      status: 'pending_payment',
      payment: {
        ...payment,
        status: 'pending',
        resume_status: resumeStatus,
        stripe_checkout_session_id: session.id,
      },
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
  order: Record<string, unknown>
): Record<string, unknown> & { required: boolean } {
  const current = record(order.payment)
  if (current.required !== true || amountMinor(current.amount_chf) <= 0) {
    return { required: false }
  }

  return {
    ...current,
    required: true,
    resume_status: resumeStatusForOrder(order, current),
  }
}

function resumeStatusForOrder(
  order: Record<string, unknown>,
  payment: Record<string, unknown>
) {
  const stored = text(payment.resume_status)
  if (stored) {
    if (isKitchenOrderPostPaymentStatus(stored)) return stored
    throw createError({
      statusCode: 500,
      statusMessage: 'Order payment resume state is invalid.',
    })
  }

  const status = text(order.status)
  if (status && status !== 'pending_payment') {
    if (isKitchenOrderPostPaymentStatus(status)) return status
    throw createError({
      statusCode: 500,
      statusMessage: 'Order lifecycle is invalid.',
    })
  }

  return statusAfterPayment(text(order.order_type) as KitchenOrderType)
}
// Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: return paid customers to the authenticated Customer dashboard.
