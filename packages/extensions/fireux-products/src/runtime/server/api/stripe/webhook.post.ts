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

function normalizeString(value: unknown): string {
  return String(value || '').trim()
}

function isSafeDocumentSegment(value: string) {
  return Boolean(value && !value.includes('/') && value !== '.' && value !== '..')
}

function isEmailLike(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function validateLicenseMetadata(session: any) {
  const metadata = session?.metadata || {}
  const email = normalizeString(
    session?.customer_details?.email || session?.customer_email
  ).toLowerCase()
  const appId = normalizeString(metadata.appId)
  const productId = normalizeString(metadata.productId)
  const productSlug = normalizeString(metadata.slug)
  const flow = normalizeString(metadata.flow)
  const checkoutSessionId = normalizeString(session?.id)

  const missing: string[] = []
  if (!email) missing.push('email')
  if (!appId) missing.push('metadata.appId')
  if (!productId) missing.push('metadata.productId')
  if (!productSlug) missing.push('metadata.slug')
  if (!checkoutSessionId) missing.push('checkoutSessionId')

  const invalid: string[] = []
  if (email && !isEmailLike(email)) invalid.push('email')
  if (appId && !isSafeDocumentSegment(appId)) invalid.push('metadata.appId')
  if (productId && !isSafeDocumentSegment(productId)) {
    invalid.push('metadata.productId')
  }
  if (productSlug && !isSafeDocumentSegment(productSlug)) {
    invalid.push('metadata.slug')
  }
  if (checkoutSessionId && !isSafeDocumentSegment(checkoutSessionId)) {
    invalid.push('checkoutSessionId')
  }
  if (productId && productSlug && productId !== productSlug) {
    invalid.push('metadata.productId/metadata.slug mismatch')
  }
  if (flow !== 'template_access') {
    invalid.push('metadata.flow')
  }

  if (missing.length || invalid.length) {
    console.warn('[fireux-products] Skipping license write for invalid Stripe metadata', {
      event: 'checkout.session.completed',
      missing,
      invalid,
      checkoutSessionId,
    })
    return null
  }

  return {
    appId,
    email,
    checkoutSessionId,
    productId,
    productSlug,
  }
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
    const licensePayload = validateLicenseMetadata(session)

    if (licensePayload) {
      await writeTemplateLicense(licensePayload)
    }
  }

  return { received: true }
})
