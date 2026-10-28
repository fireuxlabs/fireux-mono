import { ProductStorage, type Product } from '../../../utils/product.ts'
import { normalizeProduct } from '../../../utils/normalize-product.ts'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed } from 'vue'

export function useProductFetch() {
  const { firestoreFetchDoc } = useFirestoreRead()

  const fetchProduct = (id: string) => {
    const raw = firestoreFetchDoc<Record<string, unknown>>(
      ProductStorage.collection,
      id
    )
    return computed<Product | undefined>(
      () => normalizeProduct(id, raw.value) || undefined
    )
  }

  const fetchProductBySlug = (slug: string) => fetchProduct(slug)

  return { fetchProduct, fetchProductBySlug }
}
