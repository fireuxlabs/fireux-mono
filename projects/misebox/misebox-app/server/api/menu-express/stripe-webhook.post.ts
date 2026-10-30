import { defineEventHandler, getHeader, readRawBody } from 'h3'
import { recordPayment, stripeClient } from '../../menu-express/payment'
import { fail } from '../../menu-express/contract'
export default defineEventHandler(async (event) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) fail('Webhook is not configured.', 503)
  const body = await readRawBody(event, false)
  const signature = getHeader(event, 'stripe-signature')
  if (!body || !signature) fail('Missing webhook signature.')
  let verified
  try {
    verified = stripeClient().webhooks.constructEvent(body, signature, secret)
  } catch {
    return fail('Invalid webhook signature.')
  }
  return recordPayment(event, verified)
})
