import { useStorage } from '@vueuse/core'
import { onMounted, ref, watch } from 'vue'
import { useRuntimeConfig } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import type { FirebaseProduct } from '../../../../models/product.model'

type ProductDraft = Partial<FirebaseProduct> & {
  main_image?: string
}

const STORAGE_KEY = 'createProduct'
const IMAGE_KEY = 'createProductMainImageData'

export function useCreateProductState() {
  const { appId: tenantId } = useFireUXConfig()
  const cfg = (useRuntimeConfig().public as any)?.fireux?.products ?? {}
  const defaultKind =
    Array.isArray(cfg.productKinds) && cfg.productKinds.length
      ? String(cfg.productKinds[0])
      : 'service'
  const mainImageData = useStorage<string>(IMAGE_KEY, '')

  const product = useStorage<ProductDraft>(STORAGE_KEY, {
    id: '',
    source_app_id: tenantId,
    source_ecosystem_id: useFireUXConfig().ecosystem,
    owner_type: 'app',
    owner_id: tenantId,
    visibility: 'app',
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
  })

  const applyBlankDefaults = () => {
    product.value = {
      id: '',
      source_app_id: tenantId,
      source_ecosystem_id: useFireUXConfig().ecosystem,
      owner_type: 'app',
      owner_id: tenantId,
      visibility: 'app',
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

      const slug = normalizeSlug(newName)
      product.value.slug = slug
      isSlugTaken.value = false
    },
    { immediate: true }
  )

  onMounted(() => {
    applyBlankDefaults()
    if (tenantId) {
      product.value.source_app_id = tenantId
      product.value.owner_id = tenantId
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
