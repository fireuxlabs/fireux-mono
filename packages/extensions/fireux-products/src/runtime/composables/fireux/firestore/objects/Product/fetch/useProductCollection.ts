import { computed } from 'vue'
import type { FirebaseProduct } from '#fireux-products/models/objects/product.model.ts'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'

/** Fetches the products collection for the current runtime scope. */
export function useProductCollection() {
  const { firestoreFetchCollection, getCollectionPath } = useFirestoreManager()
  const collectionPath = getCollectionPath('products')
  const products = firestoreFetchCollection<FirebaseProduct>(collectionPath)
  const pending = computed(() => products.value === undefined)
  return { products, pending }
}
