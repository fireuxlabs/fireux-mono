// ~/server/api/stripe/create-product.post.ts
import { defineEventHandler, readBody, createError, type H3Event } from 'h3'
import { createRequire } from 'node:module'
import { STRIPE_API_VERSION } from '../../stripe/version'

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Quick guard: if no secret key, return 501 (not configured) instead of crashing
    const secret = process.env.STRIPE_SECRET_KEY
    if (!secret) {
      throw createError({
        statusCode: 501,
        statusMessage: 'Stripe not configured (missing STRIPE_SECRET_KEY)',
      })
    }

    // Lazy import Stripe so dev without the package/env won’t crash at load time
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
    const body = await readBody(event)
    const { product, ping } = body

    if (!product) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Product data is required',
      })
    }

    console.log('🔄 [create-product] Creating Stripe product:', product.name)
    if (ping) {
      console.log('🏓 [create-product] Ping received:', ping)
    }

    // Create product in Stripe
    const stripeProduct = await stripe.products.create({
      name: product.name,
      description: product.description || '',
      metadata: {
        appId: product.appId || '',
        slug: product.slug || '',
      },
    })

    console.log('✅ [create-product] Stripe product created:', stripeProduct.id)

    // Create prices if provided
    const stripePrices = []
    if (product.prices && product.prices.length > 0) {
      for (const price of product.prices) {
        const stripePrice = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: price.unit_amount,
          currency: String(price.currency || 'eur').toLowerCase(),
          billing_scheme: price.billing_scheme || 'per_unit',
          metadata: price.metadata || {},
          recurring:
            price.type === 'recurring'
              ? {
                  interval: price.interval,
                  interval_count: price.interval_count || 1,
                }
              : undefined,
        })
        stripePrices.push(stripePrice)
        console.log('✅ [create-product] Stripe price created:', stripePrice.id)
      }
    }

    // Call Firestore update endpoint if product creation was successful
    let firestoreResult = null
    if (stripeProduct.id) {
      try {
        console.log('📝 [create-product] Calling Firestore update endpoint...')
        firestoreResult = await fetch('/api/stripe/update-firestore', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            stripeProductId: stripeProduct.id,
            product: product,
            stripePrices: stripePrices,
            pong: ping === 'ping' ? 'pong' : undefined,
          }),
        })
        console.log('✅ [create-product] Firestore update completed')
      } catch (firestoreError) {
        console.warn(
          '⚠️ [create-product] Firestore update failed:',
          firestoreError
        )
      }
    }

    return {
      success: true,
      id: stripeProduct.id,
      stripe_prices: stripePrices.map((p) => p.id),
      message: `Product '${product.name}' created successfully in Stripe`,
      pong: ping === 'ping' ? 'pong' : undefined,
      firestore: firestoreResult ? 'updated' : 'skipped',
    }
  } catch (error) {
    console.error('❌ [create-product] Error:', error)

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'

    throw createError({
      statusCode: 500,
      statusMessage: `Failed to create product: ${errorMessage}`,
    })
  }
})
