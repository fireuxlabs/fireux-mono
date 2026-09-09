import { computed } from 'vue'
import { collection, query, where, type Query } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { ProductStorage, type Product } from '../utils/product.ts'
import { normalizeProduct } from '../utils/normalize-product.ts'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'

/** Fetches the products collection for the current runtime scope. */
export function useProductCollection() {
  const fireux = useFireUXConfig()
  const db = useFirestore()
  const { firestoreQuery } = useFirestoreRead()
  const scopedQuery = computed<Query<Record<string, unknown>> | null>(() => {
    const root = collection(db, ProductStorage.collection)
    if (!fireux.isTenant) return query(root) as Query<Record<string, unknown>>
    if (!fireux.appId) return null
    return query(root, where('source_app_id', '==', fireux.appId)) as Query<
      Record<string, unknown>
    >
  })
  const source = firestoreQuery<Record<string, unknown>>(
    scopedQuery,
    `products:${fireux.role}:${fireux.appId || 'unscoped'}`,
    ProductStorage.collection
  )
  const products = computed(() => {
    return (source.value ?? [])
      .map((raw) => normalizeProduct(raw.id, raw))
      .filter((product): product is Product => Boolean(product))
      .filter(
        (product) => !fireux.isTenant || product.source_app_id === fireux.appId
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
