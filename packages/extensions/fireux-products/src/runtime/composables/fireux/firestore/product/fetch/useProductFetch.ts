import { computed } from 'vue'
import { useProductCollection } from './useProductCollection'

/**
 * Hydrated/UI-ready products fetch.
 * Currently mirrors the Firestore collection until additional hydration is needed.
 */
export function useProductFetch() {
  const { products, pending } = useProductCollection()
  const items = computed(() => products.value ?? [])

  return { products: items, pending }
}
