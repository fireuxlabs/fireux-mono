import { computed } from 'vue'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import { useProductCollection } from './useProductCollection'

/**
 * Hydrated/UI-ready products fetch.
 * Currently mirrors the Firestore collection until additional hydration is needed.
 */
export function useProductFetch() {
  const { products, pending } = useProductCollection()
  const items = computed(() => products.value ?? [])
  const { byId: product } = useCollectionById(items)

  return { products: items, product, pending }
}
