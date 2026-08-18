import { computed } from 'vue'
import {
  collection,
  query,
  where,
  type Query,
} from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import {
  ProductStorage,
  type FirebaseProduct,
} from '../../../models/product.model.ts'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'

/** Fetches the products collection for the current runtime scope. */
export function useProductCollection() {
  const fireux = useFireUXConfig()
  const db = useFirestore()
  const { firestoreQuery } = useFirestoreManager()
  const scopedQuery = computed<Query<FirebaseProduct> | null>(() => {
    const root = collection(db, ProductStorage.collection)
    if (!fireux.isTenant) return query(root) as Query<FirebaseProduct>
    if (!fireux.appId) return null
    return query(
      root,
      where('source_app_id', '==', fireux.appId)
    ) as Query<FirebaseProduct>
  })
  const source = firestoreQuery<FirebaseProduct>(
    scopedQuery,
    `products:${fireux.role}:${fireux.appId || 'unscoped'}`,
    ProductStorage.collection
  )
  const products = computed(() => {
    const records = source.value ?? []
    return records.filter((product) =>
      !fireux.isTenant || product.source_app_id === fireux.appId
    )
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
