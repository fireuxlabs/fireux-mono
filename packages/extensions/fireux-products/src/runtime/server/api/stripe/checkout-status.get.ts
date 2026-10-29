import { createRequire } from 'node:module'
import { createError, defineEventHandler, getQuery, setResponseHeader } from 'h3'
import { checkoutBuyerSession } from '../../../product/server/integration/stripe/buyer-session'
import { STRIPE_API_VERSION } from '../../../product/server/integration/stripe/version'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const sessionId = getQuery(event).session_id
  if (typeof sessionId !== 'string' || !/^cs_[A-Za-z0-9_]+$/.test(sessionId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid checkout session' })
  }
  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) {
    throw createError({ statusCode: 501, statusMessage: 'Stripe not configured' })
  }
  const buyer = await checkoutBuyerSession(event, secret)
  if (!buyer.data.checkouts?.includes(sessionId)) {
    throw createError({ statusCode: 404, statusMessage: 'Checkout not found' })
  }
  const require = createRequire(import.meta.url)
  const Stripe = require('stripe')
  const stripe = new (Stripe.default ?? Stripe)(secret, {
    apiVersion: STRIPE_API_VERSION,
  })
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  return {
    status: session.status,
    payment_status: session.payment_status,
  }
})
