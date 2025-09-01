// ~/server/api/stripe/create-subscription.post.ts
import { defineEventHandler, readBody, createError } from 'h3'
import { STRIPE_API_VERSION } from '../stripe/version'

export default defineEventHandler(async (event) => {
  try {
    // Quick guard: if no secret key, return 501 (not configured)
    const secret = process.env.STRIPE_SECRET_KEY
    if (!secret) {
      throw createError({
        statusCode: 501,
        statusMessage: 'Stripe not configured (missing STRIPE_SECRET_KEY)',
      })
    }

    // Lazy import Stripe SDK to avoid crashing when not installed during dev
    const { default: Stripe } = await import('stripe').catch(() => ({
      default: null as any,
    }))
    if (!Stripe) {
      throw createError({
        statusCode: 501,
        statusMessage: 'Stripe SDK not installed',
      })
    }

    const body = await readBody(event)
    const {
      customerId,
      priceId,
      productId,
      appId,
      userId,
      trial_period_days = null,
      automatic_tax = { enabled: false },
      collection_method = 'charge_automatically',
      metadata = {},
      ping,
    } = body

    // Validate required fields
    if (!customerId || !priceId || !appId || !userId) {
      throw createError({
        statusCode: 400,
        statusMessage:
          'customerId, priceId, appId, and userId are required for subscription creation',
      })
    }

    console.log(
      `🔄 [create-subscription] Creating subscription for customer: ${customerId}`
    )
    if (ping) {
      console.log(`🏓 [create-subscription] Ping received: ${ping}`)
    }

    // Initialize Stripe
    const stripe = new Stripe(secret, { apiVersion: STRIPE_API_VERSION })

    // Verify customer exists
    console.log('👤 [create-subscription] Verifying customer...')
    try {
      await stripe.customers.retrieve(customerId)
      console.log('✅ [create-subscription] Customer verified')
    } catch (error) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid customer ID: ${customerId}`,
      })
    }

    // Verify price exists
    console.log('💰 [create-subscription] Verifying price...')
    try {
      const price = await stripe.prices.retrieve(priceId)
      console.log('✅ [create-subscription] Price verified:', price.id)
    } catch (error) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid price ID: ${priceId}`,
      })
    }

    // Create the subscription
    console.log('🔄 [create-subscription] Creating Stripe subscription...')
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: priceId,
        },
      ],
      metadata: {
        appId,
        userId,
        productId: productId || '',
        ...metadata,
      },
      ...(trial_period_days && { trial_period_days }),
      automatic_tax,
      collection_method,
    })

    console.log(
      `✅ [create-subscription] Stripe subscription created: ${subscription.id}`
    )

    // Prepare subscription data for Firestore
    const subscriptionData = {
      subscription_id: subscription.id,
      customer_id: customerId,
      price_id: priceId,
      product_id:
        productId || (subscription.items.data[0]?.price as any)?.product || '',
      status: subscription.status,
      current_period_start: new Date(
        (subscription as any).current_period_start * 1000
      ).toISOString(),
      current_period_end: new Date(
        (subscription as any).current_period_end * 1000
      ).toISOString(),
      created: new Date((subscription as any).created * 1000).toISOString(),
      appId,
      userId,
      trial_start: (subscription as any).trial_start
        ? new Date((subscription as any).trial_start * 1000).toISOString()
        : null,
      trial_end: (subscription as any).trial_end
        ? new Date((subscription as any).trial_end * 1000).toISOString()
        : null,
      cancel_at_period_end: (subscription as any).cancel_at_period_end,
      canceled_at: (subscription as any).canceled_at
        ? new Date((subscription as any).canceled_at * 1000).toISOString()
        : null,
      metadata: subscription.metadata,
    }

    // Update Firestore via generic endpoint
    console.log('📝 [create-subscription] Updating Firestore...')
    try {
      await fetch('/api/firestore/update-document', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          collection: 'apps',
          documentId: appId,
          subcollections: [
            { collection: 'users', documentId: userId },
            { collection: 'subscriptions', documentId: subscription.id },
          ],
          data: subscriptionData,
          operation: 'set',
          pong: ping ? `pong-${ping}` : undefined,
        }),
      })

      // Also update the user's document with current subscription info
      await fetch('/api/firestore/update-document', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          collection: 'apps',
          documentId: appId,
          subcollections: [{ collection: 'users', documentId: userId }],
          data: {
            current_subscription: {
              subscription_id: subscription.id,
              status: subscription.status,
              price_id: priceId,
              product_id: subscriptionData.product_id,
              current_period_end: subscriptionData.current_period_end,
              cancel_at_period_end: (subscription as any).cancel_at_period_end,
            },
            subscription_updated_at: new Date().toISOString(),
          },
          operation: 'merge',
          pong: ping ? `pong-user-${ping}` : undefined,
        }),
      })

      console.log('✅ [create-subscription] Firestore update completed')
    } catch (firestoreError) {
      console.warn(
        '⚠️ [create-subscription] Firestore update failed:',
        firestoreError
      )
      // Don't fail the entire request if Firestore fails
    }

    return {
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        customer_id: customerId,
        price_id: priceId,
        product_id: subscriptionData.product_id,
        current_period_start: subscriptionData.current_period_start,
        current_period_end: subscriptionData.current_period_end,
        trial_start: subscriptionData.trial_start,
        trial_end: subscriptionData.trial_end,
        cancel_at_period_end: (subscription as any).cancel_at_period_end,
      },
      message: `Subscription created successfully`,
      firestore: 'updated',
      pong: ping ? `pong-${ping}` : undefined,
    }
  } catch (error) {
    console.error('❌ [create-subscription] Error:', error)

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'

    throw createError({
      statusCode: 500,
      statusMessage: `Failed to create subscription: ${errorMessage}`,
    })
  }
})
