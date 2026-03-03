import type { FirebaseProduct } from '../../../../../models/product.model'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'

/** Lookup a product by slug (server-side friendly). */
export function useProductBySlug() {
  const { firestoreQueryOneByField } = useFirestoreManager()

  const fetchProductBySlug = (slug: string) =>
    firestoreQueryOneByField<FirebaseProduct>('products', 'slug', slug, true)

  return { fetchProductBySlug }
}
