// ~/server/api/stripe/create-product.post.ts
import { defineEventHandler, readBody, createError } from 'h3'
import Stripe from 'stripe'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
})

export default defineEventHandler(async (event) => {
  try {
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
          currency: price.currency || 'eur',
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
        firestoreResult = await $fetch('/api/stripe/update-firestore', {
          method: 'POST',
          body: {
            stripeProductId: stripeProduct.id,
            product: product,
            stripePrices: stripePrices,
            pong: ping === 'ping' ? 'pong' : undefined,
          },
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
