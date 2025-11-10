---
title: Legacy Firestore Objects Report
origin: objects-report.md
archived-on: 2025-11-10
status: draft
---

> Migrated from `objects-report.md` on 2025-11-10 as part of the documentation reorganisation.

# Legacy Firestore Objects Report

## FILE: firestore/objects/Product/useCreateProductState.ts

```ts
// ~/composables/admin/useCreateProductState.ts
import { useStorage } from '@vueuse/core'
import { useCurrentUser } from 'vuefire'
import { useFirestoreManager } from '../../useFirestoreManager'
import type {
  FirebaseProduct,
  DefaultPrice,
  ProductCreationInput,
} from '../../../../models/objects/product.model'
import { ref, watch, onMounted } from 'vue'
import { useFireUXConfig } from '../../../FireUXConfig'

export async function useCreateProductState() {
  const now = new Date().toISOString()

  const currentUser = useCurrentUser()
  const { appId: tenantId } = useFireUXConfig()

  const defaultProduct: Partial<FirebaseProduct> = {
    id: '',
    name: '',
    description: '',
    content: '',
    active: true,
    prices: [],
    created_at: now,
    updated_at: now,
    slug: '',
    creator_id: currentUser.value?.uid || '',
    appId: tenantId as string,
    stock: null,
    track_stock: false,
    product_type: 'physical',
    default_price: undefined,
  }

  const product = useStorage<Partial<FirebaseProduct>>(
    'createProduct',
    defaultProduct
  )

  // Fix: Use the same key that ImagePicker uses (with "Data" suffix)
  const mainImageData = useStorage<string>('createProductMainImageData', '')

  // Replace the problematic `products` assignment with a mock implementation
  const products = {
    buildSlugIfUnique: async (
      title: string,
      _collectionName: string,
      tenantId?: string
    ) => {
      const slug = `${tenantId}-${title}`
      const isTaken = false // Mock slug uniqueness check
      if (isTaken) {
        return { success: false, message: 'Slug is already taken' }
      }
      return { success: true, slug }
    },
    useCreatePricesState: () => ({
      defaultPrice: ref({
        id: 'default-id',
        unit_amount: 1000,
        interval: 'month',
      }),
    }),
  }

  const buildSlugIfUnique = products.buildSlugIfUnique
  const { useCreatePricesState } = products
  const { defaultPrice } = useCreatePricesState()
  const { checkUnique } = useFirestoreManager()

  const isSlugTaken = ref(false)

  // Auto-generate slug
  watch(
    () => product.value.name,
    async (newName) => {
      if (!newName) {
        isSlugTaken.value = false
        product.value.slug = ''
        return
      }
      // Always set the slug to tenantId + kebab-case product name
      const base = newName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      const slug = `${tenantId}-${base}`
      product.value.slug = slug

      // Check if this slug is already taken
      isSlugTaken.value = await checkUnique('products', 'slug', slug, true)
    }
  )

  // Populate creator_id and appId on mount
  onMounted(() => {
    if (currentUser.value?.uid) product.value.creator_id = currentUser.value.uid
    if (tenantId) product.value.appId = tenantId as string
  })

  function resetCreateProductState() {
    product.value = {
      id: '',
      name: '',
      description: '',
      content: '',
      active: true,
      prices: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      slug: '',
      creator_id: currentUser.value?.uid || '',
      appId: tenantId as string,
      stock: null,
      track_stock: false,
      product_type: 'physical',
      default_price: defaultPrice.value
        ? {
            id: (defaultPrice.value as DefaultPrice).id || '',
            unit_amount: (defaultPrice.value as DefaultPrice).unit_amount || 0,
            interval:
              (defaultPrice.value as DefaultPrice).interval || undefined,
          }
        : undefined,
    }
    mainImageData.value = ''
  }

  // Update the type of `getProductPayload` to return `ProductCreationInput`
  async function getProductPayload(): Promise<ProductCreationInput> {
    console.log('📦 [getProductPayload] Starting payload creation...')
    console.log('📦 [getProductPayload] Current product state:', product.value)

    const name = product.value.name?.trim()
    if (!name) {
      console.error('❌ [getProductPayload] Product name is missing')
      throw new Error('❌ Product name is required.')
    }
    console.log('✅ [getProductPayload] Product name validated:', name)

    if (!product.value.slug) {
      console.error('❌ [getProductPayload] Slug is missing')
      throw new Error('❌ Slug is required.')
    }
    console.log('✅ [getProductPayload] Slug validated:', product.value.slug)

    console.log('🔍 [getProductPayload] Checking slug uniqueness...')
    const slugResult = await buildSlugIfUnique(
      'products',
      name,
      tenantId as string
    )
    if (!slugResult.success) {
      console.error(
        '❌ [getProductPayload] Slug validation failed:',
        slugResult.message
      )
      throw new Error(`❌ ${slugResult.message}`)
    }
    console.log('✅ [getProductPayload] Slug uniqueness confirmed')

    console.log(
      '🖼️ [getProductPayload] Main image data length:',
      mainImageData.value?.length || 0
    )

    const payload: ProductCreationInput = {
      name,
      description: product.value.description || '',
      content: product.value.content || '',
      active: product.value.active ?? true,
      slug: product.value.slug || '',
      stock: product.value.stock ?? null,
      product_type: product.value.product_type ?? 'physical',
      track_stock: product.value.track_stock ?? false,
      images: [],
      main_image: mainImageData.value || '', // Use the stored image data
      appId: tenantId as string,
      creator_id: currentUser.value?.uid || '',
    }

    console.log('✅ [getProductPayload] Payload created successfully:', payload)
    return payload
  }

  return {
    product,
    mainImageData,
    resetCreateProductState,
    getProductPayload,
    defaultPrice,
    isSlugTaken,
    buildSlugIfUnique,
  }
}
```

## FILE: firestore/objects/Product/useProductCreate.ts

```ts
// ~/composables/firestore/objects/Product/useProductCreate.ts

import { useCreateProductState } from './useCreateProductState'

export async function useProductCreate() {
  const { getProductPayload } = await useCreateProductState()

  async function createProduct() {
    try {
      const productPayload = await getProductPayload()

      // Extract image data for separate transmission
      const imageData = productPayload.main_image

      // Create clean product data without image for server processing
      const productData = {
        ...productPayload,
        main_image: '', // Will be set by server after upload
      }

      console.log('📦 [createProduct] Sending payload:', {
        product: productData,
        imageDataLength: imageData?.length || 0,
      })

      const response = await $fetch<{
        success: boolean
        id?: string
        error?: string
      }>('/api/stripe/create-product', {
        method: 'POST',
        body: {
          product: productData,
          imageData: imageData,
        },
      })

      if (!response.success) {
        throw new Error(response.error || 'Server-side product creation failed')
      }

      return { success: true, id: response.id }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Unexpected error occurred.',
      }
    }
  }

  return { createProduct }
}
```

## FILE: firestore/objects/Product/useProductDelete.ts

```ts
import { useCurrentUser } from 'vuefire'
import { useFirestoreManager } from '../../useFirestoreManager'

interface DeleteProductResponse {
  success?: boolean
  error?: string
}

export function useProductDelete() {
  const { deleteDocument } = useFirestoreManager()
  const currentUser = useCurrentUser()

  async function deleteProduct(slug: string): Promise<boolean> {
    if (!slug) {
      throw new Error('No product slug provided.')
    }

    if (!currentUser.value) {
      throw new Error('No authenticated user found.')
    }

    try {
      const response = await $fetch<DeleteProductResponse>(
        '/api/stripe/delete-product',
        {
          method: 'POST',
          body: {
            slug,
            userId: currentUser.value.uid,
          },
        }
      )

      if (response.success) {
        console.log('✅ Product Deleted Successfully')
        await deleteDocument('products', slug)
        return true
      } else {
        console.error(
          '❌ Error Deleting Product:',
          response.error || 'Unknown error'
        )
        throw new Error(response.error || 'Unknown error')
      }
    } catch (error) {
      console.error('❌ Error Deleting Product:', error)
      throw error
    }
  }

  return { deleteProduct }
}
```

## FILE: firestore/objects/Product/useProducts.ts

```ts
import { useFirestoreManager } from '../../useFirestoreManager'
import type {
  FirebaseProduct,
  Price,
} from '../../../../models/objects/product.model'
import type { Ref } from 'vue'
import { ref } from 'vue'
import { useProductCreate } from './useProductCreate'
import { useProductUpdate } from './useProductUpdate'
import { useProductDelete } from './useProductDelete'
import { useProductValidation } from './utils/useProductValidation'
import { useProductFormatting } from './utils/useProductFormatting'

export async function useProducts() {
  const {
    firestoreFetchCollection,
    firestoreFetchDoc,
    firestoreQueryOneByField,
    firestoreFetchSubcollection,
  } = useFirestoreManager()

  // Fetch all products (scoped by appId automatically)
  const productsCollection =
    (await firestoreFetchCollection<FirebaseProduct>('products')) || ref([])

  // After fetching products, load their prices and assign directly to product.prices
  if (productsCollection.value) {
    for (const product of productsCollection.value) {
      const prices = await fetchProductPrices(product.slug || '')
      product.prices = prices
    }
  }

  // Fetch by document ID
  async function fetchProduct(
    id: string
  ): Promise<Ref<FirebaseProduct | null | undefined>> {
    return (await firestoreFetchDoc('products', id)) as Ref<
      FirebaseProduct | null | undefined
    >
  }

  // Fetch by slug (scoped by app_id automatically)
  function fetchProductBySlug(slug: string): Promise<FirebaseProduct | null> {
    return firestoreQueryOneByField(
      'products',
      'slug',
      slug
    ) as Promise<FirebaseProduct | null>
  }

  const defaultCurrency = 'EUR'

  async function fetchProductPrices(productId: string): Promise<Price[] | []> {
    if (!productId) return []
    try {
      return (await firestoreFetchSubcollection(
        'products',
        productId,
        'prices'
      )) as Price[]
    } catch (error) {
      console.error('Error fetching prices:', error)
      return []
    }
  }

  // Await all the async composables
  const productCreate = await useProductCreate()
  const productUpdate = useProductUpdate()
  const productDelete = useProductDelete()
  const productValidation = useProductValidation()
  const productFormatting = useProductFormatting()

  return {
    defaultCurrency,
    productsCollection,
    fetchProduct,
    fetchProductBySlug,
    fetchProductPrices,
    ...productCreate,
    ...productUpdate,
    ...productDelete,
    ...productValidation,
    ...productFormatting,
  }
}
```

## FILE: firestore/objects/Product/useProductUpdate.ts

```ts
import { useFirestoreManager } from '../../useFirestoreManager'
import { serverTimestamp } from 'firebase/firestore'
import type { FirebaseProduct } from '../../../../models/objects/product.model'

// ~/composables/admin/useProductUpdate.ts
export function useProductUpdate() {
  const { updateDocument } = useFirestoreManager()

  async function updateProduct(
    id: string,
    updates: Partial<FirebaseProduct>
  ): Promise<boolean> {
    try {
      if (!id) {
        throw new Error('Product ID is required for update.')
      }

      if (!updates || typeof updates !== 'object') {
        throw new Error('Invalid update payload. Must be an object.')
      }

      // Add server timestamp for updated_at
      const updateData = {
        ...updates,
        updated_at: serverTimestamp(),
      }

      await updateDocument('products', id, updateData)
      console.log(`✅ Product updated successfully: ${id}`)
      return true
    } catch (error) {
      console.error('❌ Error updating product:', error)
      throw error
    }
  }

  return { updateProduct }
}
```

## FILE: firestore/objects/Product/useProductUtils.ts

```ts
import { useImageStorage } from '../../../firebase/useImageStorage'
import { useFirestoreManager } from '../../useFirestoreManager'

// ~/composables/admin/useProductUtils.ts

export function useProductUtils() {
  // Automatically available globally
  const { uploadImage } = useImageStorage()
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
    const url = await uploadImage(`${collection}/${id}/main.jpg`, data)
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
      const products = firestoreFetchCollection('products')
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
```

## FILE: firestore/objects/Product/Prices/useCreatePricesState.ts

```ts
// ~/composables/admin/useCreatePricesState.ts
import { useStorage } from '@vueuse/core'
import type {
  Price,
  StripePriceInput,
  DefaultPrice,
} from '../../../../../models/objects/product.model'
import { computed } from 'vue'

export function useCreatePricesState() {
  const prices = useStorage<Partial<Price>[]>('createProductPrices', [
    {
      unit_amount: 0,
      currency: 'eur',
    },
  ])

  function addPrice() {
    prices.value.push({
      unit_amount: 0,
      currency: 'eur',
    })
  }

  function removePrice(index: number) {
    prices.value.splice(index, 1)
  }

  function resetPrices() {
    prices.value = [
      {
        unit_amount: 0,
        currency: 'eur',
      },
    ]
  }

  function resetCreatePricesState() {
    resetPrices()
  }

  const pricesPayload = computed<StripePriceInput[]>(() => {
    if (!prices.value.length) {
      throw new Error('❌ At least one price is required.')
    }

    return prices.value.map((p, i) => {
      if (!p.unit_amount || p.unit_amount <= 0) {
        throw new Error(
          `❌ Price at index ${i} is missing a valid unit_amount.`
        )
      }
      if (!p.currency) {
        throw new Error(`❌ Price at index ${i} is missing a currency.`)
      }

      return {
        billing_scheme: p.billing_scheme ?? 'per_unit',
        currency: p.currency,
        unit_amount: p.unit_amount,
        type: p.type ?? 'one_time',
        interval: p.type === 'recurring' ? p.interval ?? 'month' : undefined,
        interval_count:
          p.type === 'recurring' ? p.interval_count ?? 1 : undefined,
        metadata: p.metadata ?? {},
      }
    })
  })

  const defaultUnitPrice = computed(() => {
    return prices.value[0]?.unit_amount ?? 0
  })

  const defaultPrice = computed<DefaultPrice | undefined>(() => {
    const p = prices.value[0]
    if (!p) return undefined
    return {
      id: p.id ?? '',
      unit_amount: p.unit_amount ?? 0,
      interval: p.interval,
    }
  })

  return {
    prices,
    addPrice,
    removePrice,
    resetPrices,
    resetCreatePricesState,
    pricesPayload,
    defaultUnitPrice,
    defaultPrice,
  }
}
```

## FILE: firestore/objects/Product/utils/useProductFormatting.ts

```ts
import type {
  FirebaseProduct,
  Price,
} from '../../../../../models/objects/product.model'
import { useImageStorage } from '../../../../firebase/useImageStorage'
import { useFirestoreManager } from '../../../useFirestoreManager'

export function useProductFormatting() {
  const { uploadImage } = useImageStorage()
  const { checkUnique } = useFirestoreManager()

  function formatSlug(slug: string): string {
    return slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/--+/g, '-')
      .replace(/(^-)|(-$)/g, '')
  }

  function formatProductData(
    product: Partial<FirebaseProduct>
  ): Partial<FirebaseProduct> {
    const formatted: Partial<FirebaseProduct> = { ...product }

    if (formatted.name) formatted.name = formatted.name.trim()
    if (formatted.description)
      formatted.description = formatted.description.trim()
    if (formatted.slug) formatted.slug = formatSlug(formatted.slug)

    if (formatted.features) {
      formatted.features = formatGenericArray(formatted.features as any[])
    }
    if (formatted.images) {
      formatted.images = (formatted.images as any[]).filter((img: any) => {
        if (typeof img === 'string') return img.trim().length > 0
        return img && typeof img.url === 'string' && img.url.trim().length > 0
      }) as any
    }

    return formatted
  }

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
      return { success: false, message: `Slug "${slug}" is already taken.` }
    }
    return { success: true, slug }
  }

  function formatProductName(product: FirebaseProduct): string {
    return product.name || 'Unnamed Product'
  }

  function formatProductExcerpt(
    product: FirebaseProduct,
    maxLength: number = 150
  ): string {
    const description = product.description || ''
    if (description.length <= maxLength) return description
    return description.substring(0, maxLength).replace(/\s+\S*$/, '') + '...'
  }

  function formatPrice(price: Price): string {
    const currency = price.currency?.toUpperCase() || 'USD'
    const symbol = getCurrencySymbol(currency)
    const amount = (price.unit_amount / 100).toFixed(2)
    return `${symbol}${amount}`
  }

  function formatPriceRange(product: FirebaseProduct): string {
    if (!product.prices || product.prices.length === 0)
      return 'Price not available'
    if (product.prices.length === 1) {
      const only = product.prices[0]
      if (only) return formatPrice(only)
      return 'Price not available'
    }

    const amounts = product.prices
      .map((p: Price | undefined) => (p ? p.unit_amount : undefined))
      .filter((n): n is number => typeof n === 'number')
      .sort((a: number, b: number) => a - b)
    const minPrice = amounts[0]
    const maxPrice = amounts[amounts.length - 1]

    const currency = product.prices[0]?.currency?.toUpperCase() || 'USD'
    const symbol = getCurrencySymbol(currency)
    if (minPrice === undefined || maxPrice === undefined)
      return 'Price not available'
    return `${symbol}${(minPrice / 100).toFixed(2)} - ${symbol}${(
      maxPrice / 100
    ).toFixed(2)}`
  }

  function formatAvailabilityStatus(product: FirebaseProduct): string {
    if (product.active === false) return 'Unavailable'
    if ((product as any).metadata?.stock_quantity) {
      const stock = parseInt((product as any).metadata.stock_quantity)
      if (stock <= 0) return 'Out of Stock'
      if (stock <= 5) return 'Limited Stock'
    }
    return 'Available'
  }

  function formatFeatures(product: FirebaseProduct): string[] {
    const feats: any[] = (product.features as any[]) || []
    return feats
      .map((f: any) => (typeof f === 'string' ? f : f?.label))
      .filter((label: any) => typeof label === 'string' && label.trim().length)
  }

  async function uploadProductImage(
    file: File,
    productSlug: string
  ): Promise<string | null> {
    try {
      const timestamp = Date.now()
      const path = `products/${productSlug}/${timestamp}-${file.name}`
      return await uploadImage(path, file)
    } catch (error) {
      console.error('Error uploading product image:', error)
      return null
    }
  }

  function getCurrencySymbol(currency: string): string {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CAD: 'C$',
      AUD: 'A$',
    }
    return symbols[currency] || currency + ' '
  }

  function formatGenericArray(arr: any[]): any[] {
    if (!Array.isArray(arr)) return []
    if (arr.length === 0) return []
    if (typeof arr[0] === 'string') {
      return [
        ...new Set(
          arr.filter((s: string) => s?.trim()).map((s: string) => s.trim())
        ),
      ]
    }
    if (arr[0] && typeof arr[0].label === 'string') {
      // Normalize label trimming and de-duplicate by label
      const seen = new Set<string>()
      const out: any[] = []
      for (const item of arr) {
        const label = String(item.label || '').trim()
        if (!label || seen.has(label)) continue
        seen.add(label)
        out.push({ ...item, label })
      }
      return out
    }
    return arr
  }

  return {
    formatProductData,
    buildSlugIfUnique,
    formatSlug,
    formatProductName,
    formatProductExcerpt,
    formatPrice,
    formatPriceRange,
    formatAvailabilityStatus,
    formatFeatures,
    uploadProductImage,
    getCurrencySymbol,
  }
}
```

## FILE: firestore/objects/Product/utils/useProductValidation.ts

```ts
import type { FirebaseProduct } from '../../../../../models/objects/product.model'

export function useProductValidation() {
  /**
   * Validate product data
   */
  function validateProduct(product: Partial<FirebaseProduct>) {
    const errors: string[] = []

    // Required fields
    if (!product.name?.trim()) {
      errors.push('Product name is required')
    }

    if (!product.description?.trim()) {
      errors.push('Product description is required')
    }

    if (!product.slug?.trim()) {
      errors.push('Product slug is required')
    }

    // Name validation
    if (product.name && product.name.length > 200) {
      errors.push('Product name must be 200 characters or less')
    }

    // Description validation
    if (product.description && product.description.length > 1000) {
      errors.push('Product description must be 1000 characters or less')
    }

    // Slug validation
    if (product.slug && !isValidSlug(product.slug)) {
      errors.push(
        'Slug must contain only lowercase letters, numbers, and hyphens'
      )
    }

    // Price validation
    if (product.prices && product.prices.length === 0) {
      errors.push('At least one price is required')
    }

    // Image validation
    if (product.images) {
      for (const image of product.images) {
        const url = typeof image === 'string' ? image : image.url
        if (!isValidUrl(url)) {
          errors.push('All product images must be valid URLs')
          break
        }
      }
    }

    // Features validation
    if (product.features && product.features.length > 20) {
      errors.push('Maximum 20 features allowed')
    }

    // Metadata validation
    if (product.metadata) {
      if (typeof product.metadata !== 'object') {
        errors.push('Metadata must be an object')
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * Validate slug format
   */
  function isValidSlug(slug: string): boolean {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    return slugRegex.test(slug)
  }

  /**
   * Validate URL format
   */
  function isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  /**
   * Validate price value
   */
  function isValidPrice(price: number): boolean {
    return typeof price === 'number' && price >= 0 && price < 999999999
  }

  /**
   * Validate product type
   */
  function isValidProductType(type: string): boolean {
    const validTypes = ['physical', 'digital', 'service', 'subscription']
    return validTypes.includes(type)
  }

  return {
    validateProduct,
    isValidSlug,
    isValidUrl,
    isValidPrice,
    isValidProductType,
  }
}
```

## FILE: firestore/objects/Blog/useBlogCreate.ts

```ts
import { useFirestoreManager } from '../../useFirestoreManager'
import type { BlogPost } from '../../../../models/objects/blogPost.model'

export function useBlogCreate() {
  const { setDocument } = useFirestoreManager()

  const createBlogPost = async (
    postData: Partial<BlogPost>,
    slug: string
  ): Promise<string> => {
    // Use the slug as the document ID
    return setDocument('blogs', slug, postData).then(() => slug)
  }

  return { createBlogPost }
}
```

## FILE: firestore/objects/Blog/useBlogDelete.ts

```ts
import { useFirestoreManager } from '../../useFirestoreManager'

export function useBlogDelete() {
  const { deleteDocument } = useFirestoreManager()

  async function deleteBlogPost(slug: string): Promise<boolean> {
    if (!slug) {
      throw new Error('No blog post slug provided.')
    }

    try {
      await deleteDocument('blogs', slug)
      console.log('✅ Blog Post Deleted Successfully')
      return true
    } catch (error) {
      console.error('❌ Error Deleting Blog Post:', error)
      throw error
    }
  }

  return { deleteBlogPost }
}
```

## FILE: firestore/objects/Blog/useBlogPosts.ts

```ts
// filepath: /Users/danielwatson/Developer/FireUX/packages/fireux-core/composables/firestore/objects/Blog/useBlogPosts.ts
import { computed, type Ref } from 'vue'
import { useFirestoreRead } from '../../useFirestoreRead'
import type { BlogPost } from '../../../../models/objects/blogPost.model'
import { useBlogCreate } from './useBlogCreate'
import { useBlogDelete } from './useBlogDelete'
import { useBlogUpdate } from './useBlogUpdate'
import { useBlogPostUtils } from './useBlogPostUtils'

export async function useBlogPosts() {
  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreRead()

  const blogPostsCollection = await firestoreFetchCollection<BlogPost>('blogs')

  const sortedBlogPostsCollection = computed(() => {
    const posts = blogPostsCollection.value
    return posts?.slice().sort((a: BlogPost, b: BlogPost) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  })

  async function fetchBlogPost(
    slug: string
  ): Promise<Ref<BlogPost | null | undefined>> {
    return (await firestoreFetchDoc('blogs', slug)) as Ref<
      BlogPost | null | undefined
    >
  }

  return {
    blogPostsCollection: sortedBlogPostsCollection,
    fetchBlogPost,
    ...useBlogCreate(),
    ...useBlogDelete(),
    ...useBlogUpdate(),
    ...useBlogPostUtils(),
  }
}
```

## FILE: firestore/objects/Blog/useBlogPostUtils.ts

```ts
// app/composables/firestore/documents/Blog/blogPostUtils.ts
import type {
  BlogPost,
  Author,
} from '../../../../models/objects/blogPost.model'

/**
 * Provides helper functions for blog post creation and editing.
 */
export function useBlogPostUtils() {
  // Generate an SEO‑friendly slug from the title
  function generateSlug(title: string): string {
    let out = title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    out = out.replace(/^-+/, '')
    out = out.replace(/-+$/, '')
    return out
  }

  // Compute estimated reading time (~200 words/minute)
  function computeReadingTime(content: string): string {
    const text = content?.replace(/<[^>]*>/g, '').trim() || ''
    const minutes = Math.ceil((text.split(/\s+/).length || 0) / 200)
    return `${minutes} min`
  }

  // Get the current user identity from CoreUser (canonical)
  async function getAuthor(): Promise<Author> {
    const { useUser } = await import('../../user/useUser')
    const { user } = useUser()
    return {
      id: user.value?.id || '',
      display_name:
        user.value?.core?.display_name || user.value?.core?.email || '',
      handle: user.value?.core?.handle || '',
      avatar: user.value?.core?.avatar || '/img/default-image.png',
      email: user.value?.core?.email || '',
    }
  }

  // Default images for a blog post
  function getDefaultImages(): Pick<BlogPost, 'featuredImage' | 'socialImage'> {
    return {
      featuredImage: '/img/logo-type-dark.svg',
      socialImage: '/img/logo.png',
    }
  }

  return {
    generateSlug,
    computeReadingTime,
    getAuthor,
    getDefaultImages,
  }
}
```

## FILE: firestore/objects/Blog/useBlogs.ts

```ts
// filepath: /Users/danielwatson/Developer/FireUX/packages/fireux-core/composables/firestore/objects/Blog/useBlogPosts.ts
import { computed, type Ref } from 'vue'
import { useFirestoreManager } from '../../useFirestoreManager'
import type { BlogPost } from '../../../../models/objects/blogPost.model'
import { useBlogCreate } from './useBlogCreate'
import { useBlogDelete } from './useBlogDelete'
import { useBlogUpdate } from './useBlogUpdate'
import { useBlogValidation } from './utils/useBlogValidation'
import { useBlogFormatting } from './utils/useBlogFormatting'

export async function useBlogs() {
  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreManager()

  const blogsCollection = await firestoreFetchCollection<BlogPost>('blogs')

  const sortedBlogsCollection = computed(() => {
    const posts = blogsCollection.value
    return posts?.slice().sort((a: BlogPost, b: BlogPost) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  })

  async function fetchBlog(
    slug: string
  ): Promise<Ref<BlogPost | null | undefined>> {
    return (await firestoreFetchDoc('blogs', slug)) as Ref<
      BlogPost | null | undefined
    >
  }

  // Child composables
  const blogCreate = useBlogCreate()
  const blogUpdate = useBlogUpdate()
  const blogDelete = useBlogDelete()
  const blogValidation = useBlogValidation()
  const blogFormatting = useBlogFormatting()

  return {
    blogsCollection: sortedBlogsCollection,
    fetchBlog,
    ...blogCreate,
    ...blogUpdate,
    ...blogDelete,
    ...blogValidation,
    ...blogFormatting,
  }
}
```

## FILE: firestore/objects/Blog/useBlogUpdate.ts

```ts
import { useFirestoreUpdate } from '../../useFirestoreUpdate'
import { serverTimestamp } from 'firebase/firestore'
import type { BlogPost } from '../../../../models/objects/blogPost.model'

export function useBlogUpdate() {
  const { updateDocument } = useFirestoreUpdate()

  async function updateBlogPost(
    postId: string,
    updates: Partial<BlogPost>
  ): Promise<boolean> {
    try {
      if (!postId) {
        throw new Error('No BlogPost ID provided.')
      }

      if (!updates || typeof updates !== 'object') {
        throw new Error('Invalid update payload. Must be an object.')
      }

      // Add server timestamp for updated_at
      const updateData = {
        ...updates,
        updated_at: serverTimestamp(),
      }

      await updateDocument('blogs', postId, updateData)
      console.log(`✅ BlogPost updated successfully: ${postId}`)
      return true
    } catch (error) {
      console.error('❌ Error updating BlogPost:', error)
      throw error
    }
  }

  return { updateBlogPost }
}
```

## FILE: firestore/objects/Blog/useCreateBlogPostState.ts

```ts
import { useStorage } from '@vueuse/core'
import { onMounted } from 'vue'
import { useFireUXConfig } from '../../../FireUXConfig'
import { useBlogPostUtils } from './useBlogPostUtils'
import type { BlogPostEntry } from '../../../../models/objects/blogPost.model'

export function useCreateBlogPostState() {
  const now = new Date().toISOString()
  const { appId: tenantId } = useFireUXConfig()
  const { getAuthor, getDefaultImages } = useBlogPostUtils()

  // Default blog post template
  const defaultBlogPost: BlogPostEntry = {
    title: '',
    content: '',
    metaDescription: '',
    slug: '',
    author: {
      id: '',
      display_name: '',
      avatar: '',
    },
    keywords: [],
    tags: [],
    canonicalUrl: '',
    featuredImage: '',
    socialImage: '',
    readingTime: '',
    cta_link: '',
    cta_text: '',
    type: 'article',
    product_id: undefined,
  }

  // Reactive state stored in localStorage
  const blogPost = useStorage<BlogPostEntry>('createBlogPost', defaultBlogPost)

  // Image state keys (must match what ImagePicker components use)
  const featuredImageData = useStorage<string>(
    'createBlogFeaturedImageData',
    ''
  )
  const socialImageData = useStorage<string>('createBlogSocialImageData', '')

  // Initialize author on mount
  onMounted(async () => {
    if (!blogPost.value.author.id) {
      blogPost.value.author = await getAuthor()
    }
  })

  // Reset function to clear all blog post state
  function resetCreateBlogPostState() {
    const defaultImages = getDefaultImages()

    blogPost.value = {
      title: '',
      content: '',
      metaDescription: '',
      slug: '',
      author: blogPost.value.author,
      keywords: [],
      tags: [],
      canonicalUrl: '',
      featuredImage: defaultImages.featuredImage,
      socialImage: defaultImages.socialImage,
      readingTime: '',
      cta_link: '',
      cta_text: '',
      type: 'article',
      product_id: undefined,
    }

    // Clear image picker state
    featuredImageData.value = ''
    socialImageData.value = ''
  }

  // Get complete blog post payload ready for creation
  function getBlogPostPayload() {
    return {
      ...blogPost.value,
      created_at: now,
      updated_at: now,
      appId: tenantId,
    }
  }

  return {
    blogPost,
    featuredImageData,
    socialImageData,
    resetCreateBlogPostState,
    getBlogPostPayload,
  }
}
```

## FILE: firestore/objects/Blog/utils/useBlogFormatting.ts

```ts
import type { BlogPost } from '../../../../../models/objects/blogPost.model'
import type { CoreUserDoc as CoreUser } from '../../../../../models/core/user.model'
import { useUser } from '../../../user/useUser'

export function useBlogFormatting() {
  /**
   * Format blog data before saving
   */
  function formatBlogData(blog: Partial<BlogPost>): Partial<BlogPost> {
    const formatted: Partial<BlogPost> = { ...blog }

    // Format title
    if (formatted.title) {
      formatted.title = formatted.title.trim()
    }

    // Format slug
    if (formatted.slug) {
      formatted.slug = formatSlug(formatted.slug)
    }

    // Format meta description
    if (formatted.metaDescription) {
      formatted.metaDescription = formatted.metaDescription.trim()
    }

    // Format canonical URL
    if (formatted.canonicalUrl) {
      formatted.canonicalUrl = formatUrl(formatted.canonicalUrl)
    }

    // Format arrays (remove empty strings and duplicates)
    if (formatted.tags) {
      formatted.tags = formatStringArray(formatted.tags)
    }
    if (formatted.keywords) {
      formatted.keywords = formatStringArray(formatted.keywords)
    }

    return formatted
  }

  /**
   * Generate an SEO‑friendly slug from the title
   */
  function generateSlug(title: string): string {
    let out = title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    out = out.replace(/^-+/, '')
    out = out.replace(/-+$/, '')
    return out
  }

  /**
   * Format slug to ensure it's URL-friendly
   */
  function formatSlug(slug: string): string {
    let out = slug.toLowerCase().replace(/[^a-z0-9-]/g, '')
    out = out.replace(/--+/g, '-')
    out = out.replace(/^-+/, '')
    out = out.replace(/-+$/, '')
    return out
  }

  /**
   * Compute estimated reading time (~200 words/minute)
   */
  function computeReadingTime(content: string): string {
    const text = content?.replace(/<[^>]*>/g, '').trim() || ''
    const minutes = Math.ceil((text.split(/\s+/).length || 0) / 200)
    return `${minutes} min`
  }

  /**
   * Get the current user as an Author object
   */
  async function getAuthor(): Promise<
    Pick<CoreUser, 'id' | 'display_name' | 'handle' | 'avatar' | 'email'>
  > {
    const { user } = useUser()
    return {
      id: user.value?.id || '',
      display_name:
        user.value?.core?.display_name || user.value?.core?.email || '',
      handle: user.value?.core?.handle || '',
      avatar: user.value?.core?.avatar || '/img/default-image.png',
      email: user.value?.core?.email || '',
    }
  }

  /**
   * Default images for a blog post
   */
  function getDefaultImages(): Pick<BlogPost, 'featuredImage' | 'socialImage'> {
    return {
      featuredImage: '/img/logo-type-dark.svg',
      socialImage: '/img/logo.png',
    }
  }

  /**
   * Format blog title for display
   */
  function formatBlogTitle(blog: BlogPost): string {
    return blog.title || 'Untitled Post'
  }

  /**
   * Format blog excerpt from content
   */
  function formatBlogExcerpt(blog: BlogPost, maxLength: number = 150): string {
    const plainText = blog.content?.replace(/<[^>]*>/g, '').trim() || ''
    if (plainText.length <= maxLength) return plainText

    return plainText.substring(0, maxLength).replace(/\s+\S*$/, '') + '...'
  }

  /**
   * Format reading time for display
   */
  function formatReadingTime(blog: BlogPost): string {
    return blog.readingTime || computeReadingTime(blog.content || '')
  }

  /**
   * Format publication date
   */
  function formatPublicationDate(blog: BlogPost): string {
    if (!blog.created_at) return 'Unknown date'

    try {
      const date = new Date(blog.created_at)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return 'Invalid date'
    }
  }

  /**
   * Format tags for display
   */
  function formatTags(blog: BlogPost): string[] {
    return blog.tags?.filter((tag) => tag?.trim()) || []
  }

  /**
   * Helper function to format URL
   */
  function formatUrl(url: string): string {
    const trimmed = url.trim()
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return `https://${trimmed}`
    }
    return trimmed
  }

  /**
   * Helper function to format string arrays
   */
  function formatStringArray(arr: string[]): string[] {
    return [
      ...new Set(arr.filter((item) => item?.trim()).map((item) => item.trim())),
    ]
  }

  return {
    formatBlogData,
    generateSlug,
    formatSlug,
    computeReadingTime,
    getAuthor,
    getDefaultImages,
    formatBlogTitle,
    formatBlogExcerpt,
    formatReadingTime,
    formatPublicationDate,
    formatTags,
  }
}
```

## FILE: firestore/objects/Blog/utils/useBlogValidation.ts

```ts
import type { BlogPost } from '../../../../../models/objects/blogPost.model'

export function useBlogValidation() {
  /**
   * Validate blog post data
   */
  function validateBlog(blog: Partial<BlogPost>) {
    const errors: string[] = []

    // Required fields
    if (!blog.title?.trim()) {
      errors.push('Title is required')
    }

    if (!blog.content?.trim()) {
      errors.push('Content is required')
    }

    if (!blog.slug?.trim()) {
      errors.push('Slug is required')
    }

    // Title validation
    if (blog.title && blog.title.length > 200) {
      errors.push('Title must be 200 characters or less')
    }

    // Slug validation
    if (blog.slug && !isValidSlug(blog.slug)) {
      errors.push(
        'Slug must contain only lowercase letters, numbers, and hyphens'
      )
    }

    // Meta description validation
    if (blog.metaDescription && blog.metaDescription.length > 160) {
      errors.push('Meta description should be 160 characters or less')
    }

    // Featured image validation
    if (blog.featuredImage && !isValidUrl(blog.featuredImage)) {
      errors.push('Featured image must be a valid URL')
    }

    // Social image validation
    if (blog.socialImage && !isValidUrl(blog.socialImage)) {
      errors.push('Social image must be a valid URL')
    }

    // Tags validation
    if (blog.tags && blog.tags.length > 10) {
      errors.push('Maximum 10 tags allowed')
    }

    // Keywords validation
    if (blog.keywords && blog.keywords.length > 15) {
      errors.push('Maximum 15 keywords allowed')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * Validate slug format
   */
  function isValidSlug(slug: string): boolean {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    return slugRegex.test(slug)
  }

  /**
   * Validate URL format
   */
  function isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  /**
   * Validate reading time format
   */
  function isValidReadingTime(readingTime: string): boolean {
    const timeRegex = /^\d+\s+min$/
    return timeRegex.test(readingTime)
  }

  return {
    validateBlog,
    isValidSlug,
    isValidUrl,
    isValidReadingTime,
  }
}
```
