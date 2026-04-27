import type { FirebaseProduct } from '../../../../../models/product.model'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'

/** Lookup a public product by route slug. Canonically, slug equals document id. */
export function useProductBySlug() {
  const { firestoreFetchDoc, getCollectionPath } = useFirestoreManager()
  const collectionPath = getCollectionPath('products', false)

  const fetchProductBySlug = (slug: string) =>
    firestoreFetchDoc<FirebaseProduct>(collectionPath, slug)

  return { fetchProductBySlug }
}
