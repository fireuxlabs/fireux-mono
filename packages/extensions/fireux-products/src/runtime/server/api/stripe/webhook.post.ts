import { createRequire } from 'node:module'
import {
  createError,
  defineEventHandler,
  getHeader,
  readRawBody,
  type H3Event,
} from 'h3'
import { getProductsAdmin } from '../../utils/getAdmin'
import { STRIPE_API_VERSION } from '../../stripe/version'

function normalizeEmailKey(email: string) {
  return email.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '_')
}

async function writeTemplateLicense(payload: {
  appId: string
  email: string
  checkoutSessionId: string
  productId: string
  productSlug: string
}) {
  const admin = getProductsAdmin()
  const db = admin.firestore()
  const key = normalizeEmailKey(payload.email)
  const ref = db.doc(`apps/${payload.appId}/licenses/${key}`)
  const now = admin.firestore.FieldValue.serverTimestamp()

  await ref.set(
    {
      appId: payload.appId,
      email: payload.email.trim().toLowerCase(),
      product_id: payload.productId,
      product_slug: payload.productSlug,
      checkout_session_id: payload.checkoutSessionId,
      delivery_status: 'pending',
      source: 'stripe_checkout',
      updated_at: now,
      created_at: now,
    },
    { merge: true }
  )
}

function allowsUnsignedStripeWebhook() {
  return import.meta.dev
}

export default defineEventHandler(async (event: H3Event) => {
  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) {
    throw createError({
      statusCode: 501,
      statusMessage: 'Stripe not configured (missing STRIPE_SECRET_KEY)',
    })
  }

  const require = createRequire(import.meta.url)
  let Stripe: any = null
  try {
    Stripe = require('stripe')
    if (Stripe?.default) Stripe = Stripe.default
  } catch {
    Stripe = null
  }

  if (!Stripe) {
    throw createError({
      statusCode: 501,
      statusMessage: 'Stripe SDK not installed',
    })
  }

  const stripe = new Stripe(secret, { apiVersion: STRIPE_API_VERSION })
  const rawBody = await readRawBody(event)
  if (!rawBody) {
    throw createError({ statusCode: 400, statusMessage: 'Missing webhook body' })
  }

  let stripeEvent: any
  const signature = getHeader(event, 'stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim()

  if (webhookSecret) {
    if (!signature) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing stripe-signature header',
      })
    }
    stripeEvent = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } else {
    if (!allowsUnsignedStripeWebhook()) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Stripe webhook signature verification is not configured',
      })
    }

    stripeEvent = JSON.parse(rawBody)
  }

  if (stripeEvent?.type === 'checkout.session.completed') {
    const session = stripeEvent.data?.object
    const email =
      String(
        session?.customer_details?.email || session?.customer_email || ''
      ).trim()
    const metadata = session?.metadata || {}
    const appId = String(metadata.appId || '').trim()
    const productId = String(metadata.productId || '').trim()
    const productSlug = String(metadata.slug || '').trim()
    const checkoutSessionId = String(session?.id || '').trim()

    if (email && appId && productId && productSlug && checkoutSessionId) {
      await writeTemplateLicense({
        appId,
        email,
        productId,
        productSlug,
        checkoutSessionId,
      })
    }
  }

  return { received: true }
})
