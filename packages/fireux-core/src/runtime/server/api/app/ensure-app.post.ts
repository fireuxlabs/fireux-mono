export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    console.log('🚀 ensure-app received:', body)

    // Extract request parameters
    const {
      appId,
      appName,
      userId, // TODO: Should be extracted from authentication context instead
      metadata = {},
      ping, // For testing only
    } = body

    // Handle ping/pong for testing
    const response: any = {
      success: true,
      message: `App '${appName}' initialization completed`,
      appId,
      appName,
      userId,
      tasks_completed: [],
      tasks_failed: [],
      products_created: [],
      subscriptions_setup: false,
      firestore_updated: false,
    }

    if (ping) {
      response.pong = `pong-${ping}`
    }

    // Validate required fields
    if (!appId || !appName || !userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: appId, appName, userId',
      })
    }

    // Validate userId format (Firebase UIDs are typically 28 characters)
    if (userId === 'admin' || userId.length < 10) {
      console.warn(
        '⚠️ Warning: userId appears to be a role or test value, not a real user UID'
      )
      // TODO: In production, get userId from authentication context instead
    }

    // Task 1: Setup Subscription Plans (always enabled)
    try {
      console.log('📦 Creating Pro subscription plan...')
      const proResponse = await $fetch('/api/stripe/create-product', {
        method: 'POST',
        body: {
          product: {
            name: `${appName} - Pro Plan`,
            description:
              'Advanced features, Priority support, Extended storage, Analytics dashboard',
            appId: appId,
            slug: `${appId}-pro-plan`,
            metadata: {
              plan_type: 'pro',
              app_id: appId,
              app_name: appName,
            },
            prices: [
              {
                unit_amount: 999, // €9.99
                currency: 'eur',
                type: 'recurring',
                interval: 'month',
                nickname: 'Pro Monthly',
              },
              {
                unit_amount: 9999, // €99.99
                currency: 'eur',
                type: 'recurring',
                interval: 'year',
                nickname: 'Pro Yearly',
              },
            ],
          },
        },
      })

      response.products_created.push({
        type: 'pro_plan',
        product_id: proResponse.id,
        name: `${appName} - Pro Plan`,
        prices: 2,
      })

      console.log('📦 Creating Enterprise subscription plan...')
      const enterpriseResponse = await $fetch('/api/stripe/create-product', {
        method: 'POST',
        body: {
          product: {
            name: `${appName} - Enterprise Plan`,
            description:
              'All Pro features + Dedicated support, Unlimited storage, Advanced analytics, API access, Custom integrations',
            appId: appId,
            slug: `${appId}-enterprise-plan`,
            metadata: {
              plan_type: 'enterprise',
              app_id: appId,
              app_name: appName,
            },
            prices: [
              {
                unit_amount: 2999, // €29.99
                currency: 'eur',
                type: 'recurring',
                interval: 'month',
                nickname: 'Enterprise Monthly',
              },
              {
                unit_amount: 29999, // €299.99
                currency: 'eur',
                type: 'recurring',
                interval: 'year',
                nickname: 'Enterprise Yearly',
              },
            ],
          },
        },
      })

      response.products_created.push({
        type: 'enterprise_plan',
        product_id: enterpriseResponse.id,
        name: `${appName} - Enterprise Plan`,
        prices: 2,
      })

      response.tasks_completed.push('default_subscription_plans')
      response.subscriptions_setup = true
      console.log('✅ Subscription plans created successfully')
    } catch (error) {
      console.error('❌ Failed to create subscription plans:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      response.tasks_failed.push({
        task: 'default_subscription_plans',
        error: errorMessage,
      })
    }

    // Task 2: Update App Metadata
    try {
      console.log('📝 Updating app metadata in Firestore...')

      // Add a small delay to ensure Firebase Admin has time to initialize
      // This helps prevent race conditions with multiple API calls
      await new Promise((resolve) => setTimeout(resolve, 100))

      const appMetadata = {
        app_name: appName,
        main_image: `/logo-type-dark.png`, // Standard logo path for all apps
        creator_id: userId,
        initialized_at: new Date().toISOString(),
        subscriptions_setup: response.subscriptions_setup,
        products_created: response.products_created.length,
        ensure_app_completed: true,
        last_ensure_app_run: new Date().toISOString(),
        metadata: {
          ensure_app_version: '1.0',
          ...metadata,
        },
      }

      console.log('📝 Calling Firestore update with data:', appMetadata)

      const firestoreResponse = await $fetch('/api/firestore/update-document', {
        method: 'POST',
        body: {
          collection: 'apps',
          documentId: appId,
          data: appMetadata,
          merge: true,
          ping: `ensure-app-${Date.now()}`,
        },
      })

      console.log('📝 Firestore response:', firestoreResponse)

      response.tasks_completed.push('app_metadata_update')
      response.firestore_updated = true
      console.log('✅ App metadata updated successfully')
    } catch (error) {
      console.error('❌ Failed to update app metadata:', error)
      console.error('❌ Full error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        data: (error as any).data,
      })
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      response.tasks_failed.push({
        task: 'app_metadata_update',
        error: errorMessage,
      })
    }

    // Final response
    console.log('🎉 App initialization completed:', {
      tasks_completed: response.tasks_completed,
      tasks_failed: response.tasks_failed,
      products_created: response.products_created.length,
    })

    return response
  } catch (error) {
    console.error('💥 ensure-app error:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'App initialization failed'
    throw createError({
      statusCode: 500,
      statusMessage: errorMessage,
    })
  }
})
