import { computed, type Ref } from 'vue'
import type { Product } from '../models/product.model.ts'

export function useProductComputed(
  product?: Ref<Product | null | undefined>
) {
  const hasProduct = computed(() => Boolean(product?.value?.id))
  const isPublished = computed(() => product?.value?.active === true)
  const isDraft = computed(() => product?.value?.active === false)
  const displayStatus = computed(() =>
    isPublished.value ? 'Published' : isDraft.value ? 'Draft' : 'Unknown'
  )
  const productTitle = computed(() =>
    String(product?.value?.name || product?.value?.id || '').trim()
  )
  const hasMissingName = computed(() => !productTitle.value)

  return {
    hasProduct,
    isPublished,
    isDraft,
    displayStatus,
    productTitle,
    hasMissingName,
  }
}
