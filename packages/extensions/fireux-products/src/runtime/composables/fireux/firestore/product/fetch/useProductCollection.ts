import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import {
  ProductStorage,
  type FirebaseProduct,
} from '../../../../../models/product.model'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'

/** Fetches the products collection for the current runtime scope. */
export function useProductCollection() {
  const fireux = useFireUXConfig()
  const { firestoreFetchCollection } = useFirestoreManager()
  const source = firestoreFetchCollection<FirebaseProduct>(ProductStorage.collection)
  const products = computed(() => {
    const records = source.value ?? []
    if (!fireux.isTenant) return records
    if (!fireux.appId) return []

    return records.filter((product) => product.source_app_id === fireux.appId)
  })
  const count = computed(() => products.value.length)
  const pending = computed(() => source.pending.value)
  const error = computed(() => source.error.value)
  const { outcome } = useFirestoreCollectionState({
    count,
    error,
    pending,
  })

  return { products, count, pending, error, outcome }
}
