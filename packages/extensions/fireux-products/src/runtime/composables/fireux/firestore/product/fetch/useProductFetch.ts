import type { FirebaseProduct } from '../../../../../models/product.model'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'

export function useProductFetch() {
  const { firestoreFetchDoc, getCollectionPath } = useFirestoreManager()
  const collectionPath = getCollectionPath('products', false)

  const fetchProduct = (id: string) =>
    firestoreFetchDoc<FirebaseProduct>(collectionPath, id)

  const fetchProductBySlug = (slug: string) =>
    firestoreFetchDoc<FirebaseProduct>(collectionPath, slug)

  return { fetchProduct, fetchProductBySlug }
}
