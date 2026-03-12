import { useStorage } from '@vueuse/core'
import { onMounted, ref, watch } from 'vue'
import { useRuntimeConfig } from '#imports'
import { useCurrentUser } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import type { FirebaseProduct } from '../../../../../models/product.model'

type ProductDraft = Partial<FirebaseProduct> & {
  main_image?: string
}

const STORAGE_KEY = 'createProduct'
const IMAGE_KEY = 'createProductMainImageData'

function toSlug(name: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return base
}

export function useCreateProductState() {
  const currentUser = useCurrentUser()
  const { appId: tenantId } = useFireUXConfig()
  const cfg = (useRuntimeConfig().public as any)?.fireux?.products ?? {}
  const defaultKind =
    Array.isArray(cfg.productKinds) && cfg.productKinds.length
      ? String(cfg.productKinds[0])
      : 'service'
  const mainImageData = useStorage<string>(IMAGE_KEY, '')

  const product = useStorage<ProductDraft>(STORAGE_KEY, {
    id: '',
    name: '',
    tagline: '',
    Q: '',
    A: '',
    description: '',
    content: '',
    active: true,
    slug: '',
    product_type: defaultKind,
    features: [],
    metadata: {},
    appId: tenantId,
    creator_id: currentUser.value?.uid || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  const applyBlankDefaults = () => {
    product.value = {
      id: '',
      name: '',
      tagline: '',
      Q: '',
      A: '',
      description: '',
      content: '',
      active: true,
      slug: '',
      product_type: defaultKind,
      features: [],
      metadata: {},
      appId: tenantId,
      creator_id: currentUser.value?.uid || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    mainImageData.value = ''
  }

  applyBlankDefaults()

  const isSlugTaken = ref(false)

  watch(
    () => product.value.name,
    (newName: string | undefined) => {
      if (!newName) {
        product.value.slug = ''
        isSlugTaken.value = false
        return
      }

      const slug = toSlug(newName)
      product.value.slug = slug
      isSlugTaken.value = false
    },
    { immediate: true }
  )

  onMounted(() => {
    applyBlankDefaults()
    if (currentUser.value?.uid) {
      product.value.creator_id = currentUser.value.uid
    }
    if (tenantId) {
      product.value.appId = tenantId
    }
  })

  function resetCreateProductState() {
    applyBlankDefaults()
    isSlugTaken.value = false
  }

  function getProductPayload(): ProductDraft {
    if (!product.value.name?.trim()) {
      throw new Error('Product name is required')
    }
    if (!product.value.slug?.trim()) {
      throw new Error('Product slug is required')
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
