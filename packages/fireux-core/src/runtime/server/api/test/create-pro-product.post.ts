// ~/server/api/test/create-pro-product.post.ts
import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { appId, appName } = body

    if (!appId || !appName) {
      throw createError({
        statusCode: 400,
        statusMessage: 'appId and appName are required',
      })
    }

    // For testing, let's call the createDefaultProProduct function directly
    // Import the state management composables directly
    const { useCreateProductState } = await import(
      '../../composables/firestore/objects/Product/useCreateProductState'
    )
    const { useCreatePricesState } = await import(
      '../../composables/firestore/objects/Product/Prices/useCreatePricesState'
    )
    const { useProductCreate } = await import(
      '../../composables/firestore/objects/Product/useProductCreate'
    )

    console.log(`🧪 [test] Starting Pro product creation for ${appId}`)

    // Set up the product state
    const productState = await useCreateProductState()
    const pricesState = useCreatePricesState()
    const { createProduct } = await useProductCreate()

    console.log(`📦 [test] Imports successful`)

    // Reset and set the product data
    productState.resetCreateProductState()

    // Set individual product fields
    productState.product.value.name = `${appName} Pro`
    productState.product.value.slug = `${appId}-pro`
    productState.product.value.description = `Pro subscription for ${appName} - unlock premium features`
    productState.product.value.content = `Get access to premium features of ${appName}`
    productState.product.value.product_type = 'subscription'
    productState.product.value.subscription_type = 'pro'
    productState.product.value.is_default_plan = true
    productState.product.value.features = [
      'Premium support',
      'Advanced analytics',
      'Priority features',
      'Extended storage',
    ]
    productState.product.value.stock = null
    productState.product.value.track_stock = false
    productState.product.value.main_image = '/img/pro-subscription.png'
    productState.product.value.active = true
    productState.product.value.id = `${appId}-pro`

    // Set the price data by modifying the underlying prices array
    pricesState.resetCreatePricesState() // Reset to default
    pricesState.prices.value[0] = {
      unit_amount: 500, // $5.00
      currency: 'eur',
      type: 'recurring',
      interval: 'month',
      interval_count: 1,
    }

    // Set a placeholder main image (use a simple 1x1 pixel placeholder for now)
    productState.mainImageData.value =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

    console.log(`📝 [test] Product data set, creating...`)

    // Now create the product using the state-based API
    const result = await createProduct()

    console.log(`📋 [test] Creation result:`, result)

    if (result.success) {
      console.log(`✅ [test] Created Pro product for ${appId}`)
      return {
        success: true,
        message: `Pro product created for ${appId}`,
        productId: result.id,
      }
    } else {
      throw new Error(result.error || 'Failed to create product')
    }
  } catch (error) {
    console.error('❌ [test] Error creating Pro product:', error)

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to create Pro product',
    })
  }
})
