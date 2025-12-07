import { useStorage } from '@vueuse/core'
import { onMounted, ref, watch } from 'vue'
import { useCurrentUser } from 'vuefire'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/config/FireUXConfig.ts'
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
