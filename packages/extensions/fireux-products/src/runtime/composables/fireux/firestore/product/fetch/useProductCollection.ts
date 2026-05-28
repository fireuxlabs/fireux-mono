import { computed } from 'vue'
import {
  ProductStorage,
  type FirebaseProduct,
} from '../../../../../models/product.model'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'

/** Fetches the products collection for the current runtime scope. */
export function useProductCollection() {
  const { firestoreFetchCollection } = useFirestoreManager()
  const products = firestoreFetchCollection<FirebaseProduct>(ProductStorage.collection)
  const pending = computed(() => products.value === undefined)
  return { products, pending }
}
