import type { FirebaseProduct } from '../../../../../models/product.model'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'

/** Fetch a single product by id/slug. */
export function useProductRead() {
  const { firestoreFetchDoc, getCollectionPath } = useFirestoreManager()
  const collectionPath = getCollectionPath('products', false)

  const fetchProduct = (id: string) =>
    firestoreFetchDoc<FirebaseProduct>(collectionPath, id)

  return { fetchProduct }
}
