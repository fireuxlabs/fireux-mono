import { useMediaStorage } from '../../../firebase/useMediaStorage'
import { useFirestoreManager } from '../../useFirestoreManager'

// ~/composables/admin/useProductUtils.ts

export function useProductUtils() {
  // Automatically available globally
  const { uploadImage } = useMediaStorage()
  const { checkUnique } = useFirestoreManager()

  /**
   * Build a tenant-prefixed slug and check if it's unique in the given collection.
   */
  async function buildSlugIfUnique(
    title: string,
    collectionName: string,
    tenantId?: string
  ): Promise<
    { success: true; slug: string } | { success: false; message: string }
  > {
    const base = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const slug = tenantId ? `${tenantId}-${base}` : base

    const isTaken = await checkUnique(collectionName, 'slug', slug, true)
    if (isTaken) {
      return {
        success: false,
        message: 'This slug already exists. Please pick another title',
      }
    }

    return { success: true, slug }
  }

  /**
   * Upload the main product image (Data-URL or File) for the given product ID.
   */
  async function uploadMainImage(
    data: File | string,
    collection: string,
    id: string
  ): Promise<string> {
    // Call uploadImageUtility(fileOrUrl, collection, id, type)
    const url = await uploadImage(data, collection, id, 'main')
    return url || ''
  }
  function formatPrice(
    cents: number | null | undefined,
    currency: string
  ): string {
    const amount = cents ?? 0
    return (amount / 100).toLocaleString(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    })
  }

  /**
   * Placeholder URL to use when a product has no image.
   */
  const placeholderImage = '/img/placeholder-product.png'

  /**
   * Creates a default Pro subscription product for an app
   * @param appId The app identifier
   * @param appName The app name
   * @param priceInCents Price in cents (default: 500 = $5.00)
   * @returns Product payload ready for creation
   */
  function createAppProProductPayload(
    appId: string,
    appName: string,
    priceInCents: number = 500
  ) {
    const slug = `${appId}-pro`

    return {
      product: {
        name: `${appName} Pro`,
        description: `Pro subscription for ${appName} with premium features`,
        active: true,
        images: [placeholderImage],
        prices: [
          {
            unit_amount: priceInCents,
            currency: 'usd',
            billing_scheme: 'per_unit' as const,
            type: 'recurring' as const,
            interval: 'month' as const,
            interval_count: 1,
          },
        ],
      },
      firebaseProduct: {
        appId,
        slug,
        content: `Premium features for ${appName}`,
        product_type: 'subscription' as const,
        stock: null,
        track_stock: false,
        main_image: placeholderImage,
        subscription_type: 'pro' as const,
        is_default_plan: true,
        features: [
          'Premium support',
          'Advanced features',
          'Priority access',
          'Extended limits',
        ],
      },
    }
  }

  /**
   * Get subscription products for a specific app
   */
  async function getAppSubscriptionProducts(appId: string) {
    const { firestoreFetchCollection } = useFirestoreManager()
    try {
      const products = await firestoreFetchCollection('products')
      return (
        products.value?.filter(
          (product: any) =>
            product.appId === appId && product.product_type === 'subscription'
        ) || []
      )
    } catch (error) {
      console.error('❌ [getAppSubscriptionProducts] Error:', error)
      return []
    }
  }

  /**
   * Get the default Pro product for an app
   */
  async function getAppProProduct(appId: string) {
    const { firestoreQueryOneByField } = useFirestoreManager()
    try {
      return await firestoreQueryOneByField('products', 'slug', `${appId}-pro`)
    } catch (error) {
      console.error('❌ [getAppProProduct] Error:', error)
      return null
    }
  }

  /**
   * Check if a user has a specific subscription plan
   */
  function hasSubscriptionPlan(
    userSubscription: any,
    planType: 'pro' | 'premium' | 'enterprise' = 'pro'
  ): boolean {
    return (
      userSubscription?.plan === planType && userSubscription?.is_pro === true
    )
  }

  /**
   * Get subscription features for a product
   */
  function getSubscriptionFeatures(product: any): string[] {
    return (
      product?.features || [
        'Premium support',
        'Advanced analytics',
        'Priority features',
        'Extended storage',
      ]
    )
  }

  return {
    formatPrice,
    placeholderImage,
    buildSlugIfUnique,
    uploadMainImage,
    checkUnique,
    createAppProProductPayload,
    // Subscription utilities
    getAppSubscriptionProducts,
    getAppProProduct,
    hasSubscriptionPlan,
    getSubscriptionFeatures,
  }
}
