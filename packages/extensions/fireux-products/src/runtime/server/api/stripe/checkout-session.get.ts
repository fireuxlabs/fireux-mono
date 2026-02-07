import { createRequire } from 'node:module'
import {
  createError,
  defineEventHandler,
  getQuery,
  type H3Event,
} from 'h3'
import { STRIPE_API_VERSION } from '../../stripe/version'

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

  const query = getQuery(event)
  const sessionId = String(query?.session_id || '').trim()
  if (!sessionId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing session_id' })
  }

  const stripe = new Stripe(secret, { apiVersion: STRIPE_API_VERSION })
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  return {
    id: session.id,
    status: session.status,
    payment_status: session.payment_status,
    customer_email: session.customer_details?.email || session.customer_email || '',
    metadata: session.metadata || {},
  }
})
