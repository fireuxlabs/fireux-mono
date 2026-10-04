import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import {
  collection,
  documentId,
  limit,
  or,
  and,
  query,
  where,
  type Query,
} from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useAppUserRead } from 'fireux-core/runtime/app/composables/membership/useAppUserRead'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { resolveReadOutcome } from 'fireux-core/runtime/composables/fireux/firestore/operations/read-outcome'
import {
  ProductStorage,
  ProductPriceStorage,
  type ProductPrice,
} from '../utils/product'
import {
  normalizeProduct,
  normalizeProductPrice,
  joinProductRead,
} from '../utils/normalize-product'
import { productReadConstraints } from '../utils/product-read-constraints'

/** One Product by supported ID/slug, with only that Product's live prices. */
export function useProductRecord(
  locator: MaybeRefOrGetter<string>,
  options: { productType?: string } = {}
) {
  const config = useFireUXConfig()
  const { uid } = useAuth()
  const membership = useAppUserRead(config.appId, uid)
  const db = useFirestore()
  const id = computed(() => String(toValue(locator) || '').trim())
  const { firestoreQuery, firestoreFetchCollection } = useFirestoreRead()
  const source = firestoreQuery<Record<string, unknown>>(
    computed(() => {
      void uid.value
      if (!id.value || membership.pending.value || membership.error.value)
        return null
      const filters = productReadConstraints(
        config,
        ['admin', 'dev'].includes(membership.appUser.value?.role || '')
      )
      if (!filters) return null
      if (options.productType)
        filters.push(where('product_type', '==', options.productType))
      return query(
        collection(db, ProductStorage.collection),
        and(
          ...filters,
          or(where(documentId(), '==', id.value), where('slug', '==', id.value))
        ),
        limit(2)
      ) as Query<Record<string, unknown>>
    }),
    undefined,
    ProductStorage.collection
  )
  const product = computed(() => {
    if (
      source.pending.value ||
      source.error.value ||
      source.value?.length !== 1
    )
      return null
    const raw = source.value[0]!
    return normalizeProduct(raw.id, raw)
  })
  const pricesPath = computed(() =>
    product.value
      ? `${ProductStorage.collection}/${product.value.id}/${ProductPriceStorage.collection}`
      : ''
  )
  const pricesSource =
    firestoreFetchCollection<Record<string, unknown>>(pricesPath)
  const error = computed(
    () =>
      membership.error.value ||
      source.error.value ||
      ((source.value?.length ?? 0) > 1
        ? new Error('Product identity is not unique.')
        : null) ||
      pricesSource.error.value
  )
  const outcome = computed(() =>
    resolveReadOutcome({
      active: Boolean(id.value),
      kind: 'document',
      error: error.value,
      pending:
        membership.pending.value ||
        source.pending.value ||
        (Boolean(product.value) && pricesSource.pending.value),
      present: Boolean(product.value),
    })
  )
  const read = computed(() => {
    if (outcome.value !== 'ready' || !product.value) return null
    const prices = (pricesSource.value ?? [])
      .map((raw) => normalizeProductPrice(product.value!.id, raw.id, raw))
      .filter((price): price is ProductPrice => Boolean(price))
    return joinProductRead(product.value, prices)
  })
  return {
    read,
    outcome,
    pending: computed(() => outcome.value === 'pending'),
    error,
  }
}
