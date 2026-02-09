import type { FirebaseProduct } from 'fireux-products/runtime/models/product.model'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'

/** Fetch a single product by id/slug. */
export function useProductRead() {
  const { firestoreFetchDoc, getCollectionPath } = useFirestoreManager()
  const collectionPath = getCollectionPath('products')

  const fetchProduct = (id: string) =>
    firestoreFetchDoc<FirebaseProduct>(collectionPath, id)

  return { fetchProduct }
}
