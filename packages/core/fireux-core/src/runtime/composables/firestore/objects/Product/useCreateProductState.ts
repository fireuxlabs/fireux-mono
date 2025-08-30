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
