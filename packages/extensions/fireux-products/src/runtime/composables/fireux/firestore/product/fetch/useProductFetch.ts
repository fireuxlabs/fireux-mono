import {
  ProductStorage,
  type FirebaseProduct,
} from '../../../../../models/product.model'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'

export function useProductFetch() {
  const { firestoreFetchDoc } = useFirestoreManager()

  const fetchProduct = (id: string) =>
    firestoreFetchDoc<FirebaseProduct>(ProductStorage.collection, id)

  const fetchProductBySlug = (slug: string) =>
    firestoreFetchDoc<FirebaseProduct>(ProductStorage.collection, slug)

  return { fetchProduct, fetchProductBySlug }
}
