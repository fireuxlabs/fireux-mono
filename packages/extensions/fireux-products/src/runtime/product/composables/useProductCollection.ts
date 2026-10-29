import { computed } from 'vue'
import { useAsyncData } from 'nuxt/app'
import { collection, query, type Query } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { ProductStorage, type Product } from '../utils/product.ts'
import { normalizeProduct } from '../utils/normalize-product.ts'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useAppUserRead } from 'fireux-core/runtime/app/composables/membership/useAppUserRead'
import { productReadConstraints } from '../utils/product-read-constraints'

/** Fetches the products collection for the current runtime scope. */
export function useProductCollection(options: { admin?: boolean } = {}) {
  if (options.admin) return useAdminProductCollection()
  const config = useFireUXConfig()
  const source = useAsyncData<Product[]>(
    `public-products:${config.role}:${config.appId}`,
    (_app, { signal }) => $fetch('/api/products', { signal }),
    { default: () => [] }
  )
  const products = computed(() => source.data.value ?? [])
  const count = computed(() => products.value.length)
  const { outcome } = useFirestoreCollectionState({
    count,
    pending: source.pending,
    error: source.error,
  })
  return {
    products,
    count,
    pending: source.pending,
    error: source.error,
    outcome,
  }
}

/** Private catalogue reads remain native Firebase and exact-App scoped. */
function useAdminProductCollection() {
  const fireux = useFireUXConfig()
  const db = useFirestore()
  const { uid } = useAuth()
  const { appUser } = useAppUserRead(fireux.appId, uid)
  const canManage = computed(() =>
    ['admin', 'dev'].includes(appUser.value?.role || '')
  )
  const { firestoreQuery } = useFirestoreRead()
  const scopedQuery = computed<Query<Record<string, unknown>> | null>(() => {
    const root = collection(db, ProductStorage.collection)
    const constraints = productReadConstraints(fireux, canManage.value)
    return canManage.value && constraints
      ? (query(root, ...constraints) as Query<Record<string, unknown>>)
      : null
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
