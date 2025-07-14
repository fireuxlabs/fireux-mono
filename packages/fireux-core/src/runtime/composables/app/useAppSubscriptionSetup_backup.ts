// ~/composables/app/useAppSubscriptionSetup.ts

/**
 * Subscription setup for new apps
 * Automatically creates Pro and Enterprise subscription products with Stripe integration
 * 
 * NOTE: Temporarily disabled due to import issues - will fix after profile work
 */
export function useAppSubscriptionSetup() {
  /**
   * Creates both Pro and Enterprise subscription products for a new app
   * @param appId The app identifier
   * @param appName The app name
   */
  async function createAppSubscriptionProducts(
    appId: string,
    appName: string
  ): Promise<void> {
    console.log(
      `🚀 [createAppSubscriptionProducts] Setting up subscriptions for ${appName} - DISABLED`
    )
    // Temporarily disabled to focus on profile system
    return Promise.resolve()
  }

    try {
      // Create Pro subscription
      await createSubscriptionProduct(appId, appName, 'pro', {
        monthlyPrice: 500, // $5.00
        yearlyPrice: 5000, // $50.00
        features: [
          'Premium support',
          'Advanced analytics',
          'Priority features',
          'Extended storage',
          'Custom branding',
        ],
      })

      // Create Enterprise subscription
      await createSubscriptionProduct(appId, appName, 'enterprise', {
        monthlyPrice: 2000, // $20.00
        yearlyPrice: 20000, // $200.00
        features: [
          'Everything in Pro',
          'White-label solution',
          'API access',
          'Custom integrations',
          'Dedicated support',
          'Advanced security',
          'Team management',
          'Custom reporting',
        ],
      })

      console.log(
        `✅ [createAppSubscriptionProducts] Successfully created subscription products for ${appName}`
      )
    } catch (error) {
      console.error(
        `❌ [createAppSubscriptionProducts] Error creating subscriptions:`,
        error
      )
      throw error
    }
  }

  /**
   * Creates a single subscription product with monthly and yearly pricing
   */
  async function createSubscriptionProduct(
    appId: string,
    appName: string,
    tier: 'pro' | 'enterprise',
    config: {
      monthlyPrice: number
      yearlyPrice: number
      features: string[]
    }
  ): Promise<void> {
    console.log(
      `📦 [createSubscriptionProduct] Creating ${tier} subscription for ${appName}`
    )

    const { useCreateProductState } = await import(
      '../firestore/objects/Product/useCreateProductState'
    )
    const { useCreatePricesState } = await import(
      '../firestore/objects/Product/Prices/useCreatePricesState'
    )
    const { useProductCreate } = await import(
      '../firestore/objects/Product/useProductCreate'
    )

    // Set up state
    const productState = await useCreateProductState()
    const pricesState = useCreatePricesState()
    const { createProduct } = await useProductCreate()

    // Reset state
    productState.resetCreateProductState()
    pricesState.resetCreatePricesState()

    // Configure product
    const tierCapitalized = tier.charAt(0).toUpperCase() + tier.slice(1)
    productState.product.value.name = `${appName} ${tierCapitalized}`
    productState.product.value.slug = `${appId}-${tier}`
    productState.product.value.description = `${tierCapitalized} subscription for ${appName} with premium features`
    productState.product.value.content = generateProductContent(
      appName,
      tier,
      config.features
    )
    productState.product.value.product_type = 'subscription'
    productState.product.value.subscription_type = tier
    productState.product.value.is_default_plan = tier === 'pro' // Pro is default paid plan
    productState.product.value.features = config.features
    productState.product.value.stock = null
    productState.product.value.track_stock = false
    productState.product.value.main_image = '/img/subscription-placeholder.png'
    productState.product.value.active = true

    // Configure pricing - Monthly and Yearly
    pricesState.prices.value = [
      {
        unit_amount: config.monthlyPrice,
        currency: 'eur',
        type: 'recurring',
        interval: 'month',
        interval_count: 1,
        billing_scheme: 'per_unit',
        active: true,
      },
      {
        unit_amount: config.yearlyPrice,
        currency: 'eur',
        type: 'recurring',
        interval: 'year',
        interval_count: 1,
        billing_scheme: 'per_unit',
        active: true,
      },
    ]

    // Set main image placeholder
    productState.mainImageData.value = generateSubscriptionImage(tier)

    // Create the product
    console.log(
      `📝 [createSubscriptionProduct] Creating ${tier} product with ${pricesState.prices.value.length} prices`
    )

    const result = await createProduct()

    if (result.success) {
      console.log(
        `✅ [createSubscriptionProduct] Created ${tier} subscription for ${appName}`
      )
    } else {
      throw new Error(result.error || `Failed to create ${tier} subscription`)
    }
  }

  /**
   * Generates rich content for subscription product descriptions
   */
  function generateProductContent(
    appName: string,
    tier: 'pro' | 'enterprise',
    features: string[]
  ): string {
    const tierCapitalized = tier.charAt(0).toUpperCase() + tier.slice(1)

    return `
      <h2>${appName} ${tierCapitalized} Subscription</h2>
      <p>Unlock the full potential of ${appName} with our ${tierCapitalized} plan.</p>
      
      <h3>What's Included:</h3>
      <ul>
        ${features.map((feature) => `<li>${feature}</li>`).join('')}
      </ul>
      
      <h3>Perfect For:</h3>
      ${
        tier === 'pro'
          ? '<p>Individual professionals and small teams looking to maximize productivity and access premium features.</p>'
          : '<p>Large organizations requiring enterprise-grade security, customization, and dedicated support.</p>'
      }
      
      <h3>Billing:</h3>
      <p>Choose monthly or yearly billing. Save 17% with yearly plans!</p>
      
      <p><em>Cancel anytime. No setup fees. 14-day money-back guarantee.</em></p>
    `.trim()
  }

  /**
   * Generates a simple placeholder image for subscription tiers
   */
  function generateSubscriptionImage(tier: 'pro' | 'enterprise'): string {
    // For now, return a simple base64 encoded 1x1 pixel image
    // In production, you'd want to generate or use actual subscription tier images
    const color = tier === 'pro' ? '#10B981' : '#6366F1' // Green for Pro, Indigo for Enterprise

    // This is a placeholder - in real implementation you'd want proper images
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
  }

  /**
   * Checks if subscription products already exist for an app
   */
  async function subscriptionProductsExist(appId: string): Promise<boolean> {
    try {
      const { useFirestoreManager } = await import(
        '../firestore/useFirestoreManager'
      )
      const { firestoreQueryOneByField } = useFirestoreManager()

      const proProduct = await firestoreQueryOneByField(
        'products',
        'slug',
        `${appId}-pro`
      )
      const enterpriseProduct = await firestoreQueryOneByField(
        'products',
        'slug',
        `${appId}-enterprise`
      )

      return !!(proProduct && enterpriseProduct)
    } catch (error) {
      console.error('Error checking subscription products:', error)
      return false
    }
  }

  return {
    createAppSubscriptionProducts,
    createSubscriptionProduct,
    subscriptionProductsExist,
  }
}
