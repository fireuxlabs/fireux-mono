import { collection, query, where, type Query } from 'firebase/firestore'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { computed, isRef, unref, type Ref } from 'vue'
import { OrderStorage, type Order } from '../../../../../models/order.model'

export type OrderScopeRef = {
  type: string
  id: string
}

type UseOrderCollectionOptions = {
  scope?: Ref<OrderScopeRef | null> | OrderScopeRef | null
  databaseId?: string | Ref<string | null | undefined>
}

const clean = (value: unknown) => String(value ?? '').trim()

export function useOrderCollection(options: UseOrderCollectionOptions = {}) {
  const db = useFirestore()
  const { firestoreFetchCollection, firestoreQuery } = useFirestoreRead({
    databaseId: options.databaseId,
  })
  const scope = computed(() =>
    isRef(options.scope) ? unref(options.scope) : options.scope
  )
  const scopeType = computed(() => clean(scope.value?.type))
  const scopeId = computed(() => clean(scope.value?.id))
  const collectionPath = computed(() => OrderStorage.collection)
  const scopedQuery = computed<Query<Order> | null>(() => {
    if (!scopeType.value || !scopeId.value) return null

    return query(
      collection(db, OrderStorage.collection),
      where('scope_type', '==', scopeType.value),
      where('scope_id', '==', scopeId.value)
    ) as Query<Order>
  })
  const scopedOrders = firestoreQuery<Order>(scopedQuery)
  const allOrders = firestoreFetchCollection<Order>(collectionPath)
  const source = computed(() =>
    scopeType.value && scopeId.value ? scopedOrders.value : allOrders.value
  )
  const orders = computed(() =>
    sortOrders(source.value ?? [])
  )
  const pending = computed(() => source.value === undefined)

  return {
    collectionPath,
    scopeType,
    scopeId,
    orders,
    pending,
  }
}

function sortOrders(orders: Order[]) {
  return [...orders].sort((a, b) =>
    timestampMs((b as any).updated?.at ?? (b as any).updated_at) -
      timestampMs((a as any).updated?.at ?? (a as any).updated_at)
  )
}

function timestampMs(value: unknown) {
  if (!value) return 0
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (value instanceof Date) return value.getTime()

  const source = value as { seconds?: number, toDate?: () => Date } | null
  if (typeof source?.seconds === 'number') return source.seconds * 1000
  if (typeof source?.toDate === 'function') {
    const date = source.toDate()
    return date instanceof Date ? date.getTime() : 0
  }

  return 0
}
