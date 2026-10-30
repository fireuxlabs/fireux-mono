import { requireChatSessionAccess } from 'fireux-core/runtime/server/utils/chat/session'
import Stripe from 'stripe'
import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { createProductCheckout } from 'fireux-products/runtime/product/server/integration/stripe/checkout'
import { STRIPE_API_VERSION } from 'fireux-products/runtime/product/server/integration/stripe/version'
import { context } from './authority'
import { dto, fail, requestId } from './contract'

export function stripeClient() {
  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) fail('Checkout is not configured yet.', 503)
  return new Stripe(secret, { apiVersion: STRIPE_API_VERSION as any })
}
export async function startCheckout(
  event: H3Event,
  rawId: unknown,
  token: unknown
) {
  const id = requestId(rawId),
    { appId, target } = context(event)
  const productId = 'menu-express'
  const db = getRuntimeFirestore()
  const prices = await db
    .collection(`products/${productId}/prices`)
    .where('active', '==', true)
    .limit(20)
    .get()
  const available = prices.docs.filter(
    (doc) => doc.data().type !== 'recurring' && doc.data().provider === 'stripe'
  )
  const preferred = available.filter((doc) => doc.data().default === true)
  const price =
    preferred.length === 1
      ? preferred[0]
      : available.length === 1
        ? available[0]
        : null
  if (!price) fail('Menu Express has no agreed checkout price yet.', 503)
  const priceId = String(price.data().provider_price_id || price.id)
  const request = await runGuardedServerTransaction(
    { kind: 'runtime' },
    async (tx) => {
      await requireChatSessionAccess(tx, { appId, conversationId: id, token })
      const stored = await tx.read(target, id)
      if (!stored.exists) fail('Request not found.', 404)
      const request = dto(id, stored.data!)
      if (request.demo) fail('Demo requests do not take real payments.', 409)
      if (request.payment.status === 'paid')
        fail('This request is already paid.', 409)
      return request
    }
  )
  const stripe = stripeClient()
  let attempt = request.payment.attempt
  if (request.payment.sessionId) {
    const existing = await stripe.checkout.sessions.retrieve(
      request.payment.sessionId
    )
    if (existing.status === 'open') return { url: existing.url }
    if (existing.status === 'complete' && request.payment.status !== 'failed')
      fail(
        'Checkout is complete; payment confirmation is pending. Do not pay again.',
        409
      )
    attempt++
  }
  const payment = { status: 'unpaid', sessionId: '', attempt, priceId }
  await runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    await requireChatSessionAccess(tx, { appId, conversationId: id, token })
    const stored = await tx.read(target, id)
    if (!stored.exists || stored.data?.payment.status === 'paid')
      fail('Reload this request before paying.', 409)
    tx.update(target, id, { payment })
  })
  const result = await createProductCheckout(
    event,
    { appId, productId, slug: productId, priceId, mode: 'payment' },
    {
      returnPath: `/menu-express/${id}`,
      metadata: { menuExpressRequestId: id },
      idempotencyKey: `menu-express:${appId}:${id}:${attempt}`,
    }
  )
  await runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const stored = await tx.read(target, id)
    if (!stored.exists || stored.data?.payment.attempt !== attempt)
      fail('Checkout changed. Reload this request.', 409)
    // A fast webhook can confirm payment before this response is persisted.
    tx.update(target, id, {
      'payment.sessionId': result.id,
      ...(!['paid', 'failed'].includes(String(stored.data?.payment.status))
        ? { 'payment.status': 'pending' }
        : {}),
    })
  })
  return { url: result.url }
}
export async function recordPayment(event: H3Event, stripeEvent: Stripe.Event) {
  const supported = [
    'checkout.session.completed',
    'checkout.session.async_payment_succeeded',
    'checkout.session.async_payment_failed',
  ]
  if (!supported.includes(stripeEvent.type)) return { received: true }
  const received = stripeEvent.data.object as Stripe.Checkout.Session
  if (!received.metadata?.menuExpressRequestId) return { received: true }
  const id = requestId(received.metadata.menuExpressRequestId),
    { appId, target } = context(event)
  const stripe = stripeClient()
  const session = await stripe.checkout.sessions.retrieve(received.id)
  const lines = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 2,
  })
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const record = await tx.read(target, id)
    if (!record.exists) fail('Unknown Menu Express request.', 404)
    const request = dto(id, record.data!)
    const productId = 'menu-express'
    if (
      request.demo ||
      session.metadata?.appId !== appId ||
      session.metadata?.productId !== productId ||
      session.metadata?.menuExpressRequestId !== id ||
      session.mode !== 'payment' ||
      lines.data.length !== 1 ||
      lines.has_more ||
      lines.data[0]?.quantity !== 1 ||
      lines.data[0]?.price?.id !== request.payment.priceId ||
      (request.payment.sessionId && request.payment.sessionId !== session.id)
    )
      fail('Checkout does not match this request.', 409)
    if (request.payment.status === 'paid') return { received: true }
    const status =
      ['paid', 'no_payment_required'].includes(session.payment_status) &&
      session.status === 'complete'
        ? 'paid'
        : stripeEvent.type === 'checkout.session.async_payment_failed'
          ? 'failed'
          : 'pending'
    if (request.payment.status === 'failed' && status === 'pending')
      return { received: true }
    tx.update(target, id, {
      payment: { ...request.payment, sessionId: session.id, status },
      updatedAt: new Date().toISOString(),
    })
    return { received: true }
  })
}
