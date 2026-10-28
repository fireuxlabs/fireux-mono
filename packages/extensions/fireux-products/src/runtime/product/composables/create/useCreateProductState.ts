import { useStorage } from '@vueuse/core'
import { onMounted, ref, watch } from 'vue'
import { useRuntimeConfig } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalize-slug'
import type { Product } from '../../utils/product.ts'

type ProductDraft = Partial<Product> & {
  main_image?: string
}

const STORAGE_KEY = 'createProduct'
const IMAGE_KEY = 'createProductMainImageData'

export function useCreateProductState() {
  const { appId } = useFireUXConfig()
  const cfg = (useRuntimeConfig().public as any)?.fireux?.products ?? {}
  const defaultKind =
    Array.isArray(cfg.productKinds) && cfg.productKinds.length
      ? String(cfg.productKinds[0])
      : 'service'
  const mainImageData = useStorage<string>(IMAGE_KEY, '')

  const product = useStorage<ProductDraft>(STORAGE_KEY, {
    id: '',
    source_app_id: appId,
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
    categories: [],
    brands: [],
    source_url: '',
    requires_template: false,
    fulfillment_requirements: [],
  })

  const applyBlankDefaults = () => {
    product.value = {
      id: '',
      source_app_id: appId,
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
      categories: [],
      brands: [],
      source_url: '',
      requires_template: false,
      fulfillment_requirements: [],
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
    if (appId) {
      product.value.source_app_id = appId
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
