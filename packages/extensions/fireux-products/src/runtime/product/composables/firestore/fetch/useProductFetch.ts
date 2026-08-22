import {
  ProductStorage,
  type Product,
} from '../../../models/product.model.ts'
import { normalizeProduct } from '../../../utils/normalize-product.ts'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'
import { computed } from 'vue'

export function useProductFetch() {
  const { firestoreFetchDoc } = useFirestoreManager()

  const fetchProduct = (id: string) => {
    const raw = firestoreFetchDoc<Record<string, unknown>>(ProductStorage.collection, id)
    return computed<Product | undefined>(() => normalizeProduct(id, raw.value) || undefined)
  }

  const fetchProductBySlug = (slug: string) => fetchProduct(slug)

  return { fetchProduct, fetchProductBySlug }
}
