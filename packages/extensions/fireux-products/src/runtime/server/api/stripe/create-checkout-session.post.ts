import { createRequire } from 'node:module'
import {
  createError,
  defineEventHandler,
  getRequestURL,
  readBody,
  type H3Event,
} from 'h3'
import { STRIPE_API_VERSION } from '../../stripe/version'

type CreateCheckoutSessionBody = {
  appId?: string
  productId?: string
  slug?: string
  priceId?: string
  mode?: 'payment' | 'subscription'
}

function baseUrlFromEvent(event: H3Event) {
  const configured = process.env.APP_DOMAIN?.trim()
  if (configured) return configured.replace(/\/$/, '')
  const url = getRequestURL(event)
  return `${url.protocol}//${url.host}`
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

  const body = (await readBody(event)) as CreateCheckoutSessionBody
  const appId = String(body?.appId || '').trim()
  const productId = String(body?.productId || '').trim()
  const slug = String(body?.slug || '').trim()
  const priceId = String(body?.priceId || '').trim()
  const mode = body?.mode === 'payment' ? 'payment' : 'subscription'

  if (!appId || !productId || !slug || !priceId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required checkout fields',
    })
  }

  const stripe = new Stripe(secret, { apiVersion: STRIPE_API_VERSION })
  const baseUrl = baseUrlFromEvent(event)

  const session = await stripe.checkout.sessions.create({
    mode,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/products/success?session_id={CHECKOUT_SESSION_ID}&product=${encodeURIComponent(slug)}`,
    cancel_url: `${baseUrl}/products/${encodeURIComponent(slug)}`,
    allow_promotion_codes: true,
    metadata: {
      appId,
      productId,
      slug,
      flow: 'template_access',
    },
  })

  return {
    success: true,
    id: session.id,
    url: session.url || '',
  }
})
