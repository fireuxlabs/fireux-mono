import { createRequire } from 'node:module'
import { createError } from 'h3'
import { STRIPE_API_VERSION } from '../integration/stripe/version.ts'

export function getMenuStripe() {
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

  return new Stripe(secret, { apiVersion: STRIPE_API_VERSION })
}

export function allowUnsignedStripeWebhook() {
  return import.meta.dev
}
