import { computed } from 'vue'
import { useAsyncData } from 'nuxt/app'
import { collection, query, type Query } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import {
  ProductStorage,
  type Product,
  type ProductRead,
} from '../utils/product.ts'
import {
  joinProductRead,
  normalizeProduct,
} from '../utils/normalize-product.ts'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useAppUserRead } from 'fireux-core/runtime/app/app-user/composables/useAppUserRead'
import { productReadConstraints } from '../utils/product-read-constraints'

/** One reader owns the complete requested catalogue, including optional prices. */
export function useProductCollection(options: {
  admin: true
}): ReturnType<typeof useAdminProductCollection>
export function useProductCollection(options?: {
  admin?: false
  prices?: boolean
}): ReturnType<typeof usePublicProductCollection>
export function useProductCollection(
  options: { admin?: boolean; prices?: boolean } = {}
) {
  return options.admin
    ? useAdminProductCollection()
    : usePublicProductCollection(options.prices ?? false)
}

function usePublicProductCollection(prices: boolean) {
  const config = useFireUXConfig()
  const source = useAsyncData<ProductRead[]>(
    `public-products:${config.role}:${config.appId}:${prices ? 'prices' : 'records'}`,
    async (_app, { signal }) => {
      const products = await $fetch<Product[]>('/api/products', { signal })
      if (!prices)
        return products.map((product) => joinProductRead(product, []))
      return Promise.all(
        products.map((product) =>
          $fetch<ProductRead>(
            `/api/products/${encodeURIComponent(product.id)}`,
            { signal }
          )
        )
      )
    },
    { default: () => [] }
  )
  const productReads = computed(() => source.data.value ?? [])
  const products = computed(() =>
    productReads.value.map((read) => read.product)
  )
  const count = computed(() => products.value.length)
  const { outcome } = useFirestoreCollectionState({
    count,
    pending: source.pending,
    error: source.error,
  })
  return {
    products,
    productReads,
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
