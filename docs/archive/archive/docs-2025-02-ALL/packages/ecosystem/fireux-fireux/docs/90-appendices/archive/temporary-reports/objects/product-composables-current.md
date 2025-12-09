---
title: FireUX Product Composables (Current)
origin: product-report.md
archived-on: 2025-11-10
status: draft
---

> Migrated from `product-report.md` on 2025-11-10 during the cleanup of root-level markdown.

# FireUX Product Composables (Current)

## FILE: firestore/objects/Product/useCreateProductState.ts

```ts
import { useStorage } from '@vueuse/core'
import { onMounted, ref, watch } from 'vue'
import { useCurrentUser } from 'vuefire'
import { useFirestoreManager } from '../../operations/useFirestoreManager'
import { useFireUXConfig } from '../../../FireUXConfig'
import type { FirebaseProduct } from '../../../../models/objects/product.model'

type ProductDraft = Partial<FirebaseProduct> & {
  main_image?: string
}

const STORAGE_KEY = 'createProduct'
const IMAGE_KEY = 'createProductMainImageData'

export function useCreateProductState() {
  const currentUser = useCurrentUser()
  const { appId: tenantId } = useFireUXConfig()
  const { checkUnique } = useFirestoreManager()

  const product = useStorage<ProductDraft>(STORAGE_KEY, {
    id: '',
    name: '',
    description: '',
    active: true,
    slug: '',
    appId: tenantId,
    creator_id: currentUser.value?.uid || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  const mainImageData = useStorage<string>(IMAGE_KEY, '')
  const isSlugTaken = ref(false)

  watch(
    () => product.value.name,
    async (newName) => {
      if (!newName) {
        product.value.slug = ''
        isSlugTaken.value = false
        return
      }

      const base = newName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      const slug = tenantId ? `${tenantId}-${base}` : base
      product.value.slug = slug

      try {
        const slugAvailable = await checkUnique('products', 'slug', slug, true)
        isSlugTaken.value = !slugAvailable
      } catch (error) {
        console.error('[fireux] failed to validate product slug', error)
        isSlugTaken.value = false
      }
    }
  )

  onMounted(() => {
    if (currentUser.value?.uid) {
      product.value.creator_id = currentUser.value.uid
    }
    if (tenantId) {
      product.value.appId = tenantId
    }
  })

  function resetCreateProductState() {
    product.value = {
      id: '',
      name: '',
      description: '',
      active: true,
      slug: '',
      appId: tenantId,
      creator_id: currentUser.value?.uid || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    mainImageData.value = ''
    isSlugTaken.value = false
  }

  function getProductPayload(): ProductDraft {
    if (!product.value.name?.trim()) {
      throw new Error('Product name is required')
    }
    if (!product.value.slug?.trim()) {
      throw new Error('Product slug is required')
    }
    if (isSlugTaken.value) {
      throw new Error('Product slug must be unique')
    }

    return {
      ...product.value,
      main_image: mainImageData.value,
    }
  }

  return {
    product,
    mainImageData,
    isSlugTaken,
    resetCreateProductState,
    getProductPayload,
  }
}
```

## FILE: firestore/objects/Product/useProductCreate.ts

```ts
import { useCreateProductState } from './useCreateProductState'

type CreateProductResult = {
  success: boolean
  id?: string
  error?: string
}

export function useProductCreate() {
  const { getProductPayload } = useCreateProductState()

  async function createProduct(): Promise<CreateProductResult> {
    try {
      const payload = getProductPayload()
      console.log('🧩 [Stub] createProduct payload', payload)
      return {
        success: true,
        id: payload.slug ? `${payload.slug}-stub` : 'product-stub-id',
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create product'
      return { success: false, error: message }
    }
  }

  return { createProduct }
}
```

## FILE: firestore/objects/Product/useProductUpdate.ts

```ts
import type { FirebaseProduct } from '../../../../models/objects/product.model'
import { useFirestoreManager } from '../../operations/useFirestoreManager'

export function useProductUpdate() {
  const { updateDocument, getCollectionPath } = useFirestoreManager()
  const collectionPath = getCollectionPath('products')

  async function updateProduct(
    id: string,
    updates: Partial<FirebaseProduct>
  ): Promise<boolean> {
    if (!id) {
      throw new Error('Product ID required for update')
    }

    await updateDocument<FirebaseProduct>(collectionPath, id, updates)
    console.log('🧩 [Stub] updateProduct', { id, updates })
    return true
  }

  return { updateProduct }
}
```

## FILE: firestore/objects/Product/useProductDelete.ts

```ts
import { useCurrentUser } from 'vuefire'
import { useFirestoreManager } from '../../operations/useFirestoreManager'

export function useProductDelete() {
  const { deleteDocument, getCollectionPath } = useFirestoreManager()
  const currentUser = useCurrentUser()
  const collectionPath = getCollectionPath('products')

  async function deleteProduct(slug: string): Promise<boolean> {
    if (!slug) {
      throw new Error('Product slug is required')
    }

    if (!currentUser.value) {
      throw new Error('User must be authenticated to delete products')
    }

    console.log('🧩 [Stub] deleteProduct', { slug })
    await deleteDocument(collectionPath, slug)
    return true
  }

  return { deleteProduct }
}
```

## FILE: firestore/objects/Product/useProducts.ts

```ts
import { ref, type Ref } from 'vue'
import type { FirebaseProduct } from '../../../../models/objects/product.model'
import { useFirestoreManager } from '../../operations/useFirestoreManager'
import { useProductCreate } from './useProductCreate'
import { useProductUpdate } from './useProductUpdate'
import { useProductDelete } from './useProductDelete'

export function useProducts() {
  const {
    firestoreFetchCollection,
    firestoreFetchDoc,
    firestoreQueryOneByField,
    getCollectionPath,
  } = useFirestoreManager()

  const collectionPath = getCollectionPath('products')
  const productsCollection =
    (firestoreFetchCollection<FirebaseProduct>(collectionPath) as Ref<
      FirebaseProduct[] | undefined
    >) ?? ref<FirebaseProduct[] | undefined>([])

  const fetchProduct = (id: string) =>
    firestoreFetchDoc<FirebaseProduct>(collectionPath, id)

  const fetchProductBySlug = (slug: string) =>
    firestoreQueryOneByField<FirebaseProduct>('products', 'slug', slug, true)

  const productCreate = useProductCreate()
  const productUpdate = useProductUpdate()
  const productDelete = useProductDelete()

  return {
    productsCollection,
    fetchProduct,
    fetchProductBySlug,
    ...productCreate,
    ...productUpdate,
    ...productDelete,
  }
}
```

## FILE: firestore/objects/Product/useProductUtils.ts

```ts
import { useImageStorage } from '../../../firebase/useImageStorage'
import { useFirestoreManager } from '../../operations/useFirestoreManager'

export function useProductUtils() {
  const { uploadImage } = useImageStorage()
  const { checkUnique } = useFirestoreManager()

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

    const slugAvailable = await checkUnique(collectionName, 'slug', slug, true)
    if (!slugAvailable) {
      return { success: false, message: 'Slug taken' }
    }

    return { success: true, slug }
  }

  async function uploadMainImage(
    data: File | string,
    collectionName: string,
    id: string
  ): Promise<string> {
    const path = `${collectionName}/${id}/main.jpg`
    const url = await uploadImage(path, data)
    return url || ''
  }

  return {
    buildSlugIfUnique,
    uploadMainImage,
  }
}
```

## FILE: firestore/objects/Product/Prices/useCreatePricesState.ts

```ts
import { useStorage } from '@vueuse/core'
import { computed } from 'vue'
import type {
  DefaultPrice,
  Price,
  StripePriceInput,
} from '../../../../../models/objects/product.model'

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
      throw new Error('At least one price is required')
    }

    return prices.value.map((price, index) => {
      if (!price.unit_amount || price.unit_amount <= 0) {
        throw new Error(`Price ${index + 1} must have a value greater than 0`)
      }
      if (!price.currency) {
        throw new Error(`Price ${index + 1} requires a currency`)
      }

      const isRecurring = price.type === 'recurring'

      return {
        billing_scheme: price.billing_scheme ?? 'per_unit',
        currency: price.currency,
        unit_amount: price.unit_amount,
        type: price.type ?? 'one_time',
        interval: isRecurring ? price.interval ?? 'month' : undefined,
        interval_count: isRecurring ? price.interval_count ?? 1 : undefined,
        metadata: price.metadata ?? {},
      }
    })
  })

  const defaultUnitPrice = computed(() => prices.value[0]?.unit_amount ?? 0)

  const defaultPrice = computed<DefaultPrice | undefined>(() => {
    const price = prices.value[0]
    if (!price) return undefined
    return {
      id: price.id ?? '',
      unit_amount: price.unit_amount ?? 0,
      interval: price.interval,
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
import { useFirestoreManager } from '../../../operations/useFirestoreManager'

export function useProductFormatting() {
  const { uploadImage } = useImageStorage()
  const { checkUnique } = useFirestoreManager()

  function formatSlug(slug: string): string {
    return slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/--+/g, '-')
      .replace(/(^-|-$)/g, '')
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
      formatted.images = (formatted.images as any[]).filter((image: any) => {
        if (typeof image === 'string') return image.trim().length > 0
        return (
          image && typeof image.url === 'string' && image.url.trim().length > 0
        )
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
    const slugAvailable = await checkUnique(collectionName, 'slug', slug, true)
    if (!slugAvailable) {
      return { success: false, message: `Slug "${slug}" is already taken.` }
    }
    return { success: true, slug }
  }

  function formatProductName(product: FirebaseProduct): string {
    return product.name || 'Unnamed Product'
  }

  function formatProductExcerpt(
    product: FirebaseProduct,
    maxLength = 150
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
      const onlyPrice = product.prices[0]
      return onlyPrice ? formatPrice(onlyPrice) : 'Price not available'
    }

    const amounts = product.prices
      .map((price: Price | undefined) =>
        price ? price.unit_amount : undefined
      )
      .filter((value): value is number => typeof value === 'number')
      .sort((a: number, b: number) => a - b)

    const minPrice = amounts[0]
    const maxPrice = amounts[amounts.length - 1]
    const currency = product.prices[0]?.currency?.toUpperCase() || 'USD'
    const symbol = getCurrencySymbol(currency)

    if (minPrice === undefined || maxPrice === undefined) {
      return 'Price not available'
    }

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
    const features: any[] = (product.features as any[]) || []
    return features
      .map((feature: any) =>
        typeof feature === 'string' ? feature : feature?.label
      )
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
      console.error('[fireux] failed to upload product image', error)
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
    return symbols[currency] || `${currency} `
  }

  function formatGenericArray(arr: any[]): any[] {
    if (!Array.isArray(arr) || arr.length === 0) return []
    if (typeof arr[0] === 'string') {
      return [
        ...new Set(
          arr
            .filter((value: string) => value?.trim())
            .map((value: string) => value.trim())
        ),
      ]
    }
    if (arr[0] && typeof arr[0].label === 'string') {
      const seen = new Set<string>()
      const output: any[] = []
      for (const item of arr) {
        const label = String(item.label || '').trim()
        if (!label || seen.has(label)) continue
        seen.add(label)
        output.push({ ...item, label })
      }
      return output
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
  function validateProduct(product: Partial<FirebaseProduct>) {
    const errors: string[] = []

    if (!product.name?.trim()) {
      errors.push('Product name is required')
    }

    if (!product.description?.trim()) {
      errors.push('Product description is required')
    }

    if (!product.slug?.trim()) {
      errors.push('Product slug is required')
    }

    if (product.name && product.name.length > 200) {
      errors.push('Product name must be 200 characters or less')
    }

    if (product.description && product.description.length > 1000) {
      errors.push('Product description must be 1000 characters or less')
    }

    if (product.slug && !isValidSlug(product.slug)) {
      errors.push(
        'Slug must contain only lowercase letters, numbers, and hyphens'
      )
    }

    if (product.prices && product.prices.length === 0) {
      errors.push('At least one price is required')
    }

    if (product.images) {
      for (const image of product.images) {
        const url = typeof image === 'string' ? image : image.url
        if (!isValidUrl(url)) {
          errors.push('All product images must be valid URLs')
          break
        }
      }
    }

    if (product.features && product.features.length > 20) {
      errors.push('Maximum 20 features allowed')
    }

    if (product.metadata && typeof product.metadata !== 'object') {
      errors.push('Metadata must be an object')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  function isValidSlug(slug: string): boolean {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    return slugRegex.test(slug)
  }

  function isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  function isValidPrice(price: number): boolean {
    return typeof price === 'number' && price >= 0 && price < 999_999_999
  }

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
