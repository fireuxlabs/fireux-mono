import { collection, query, where, type Query } from 'firebase/firestore'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed, shallowRef, watch, type Ref, type ShallowRef } from 'vue'
import { useFirestore } from 'vuefire'
import type { Order } from '../models/order.model'
import { useOrdersFetchByScope } from './useOrdersFetchByScope'

const ORDERS_COLLECTION = 'orders'

const toMillis = (value: unknown): number => {
  if (!value) return 0
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (value instanceof Date) return value.getTime()

  if (typeof value === 'object') {
    const source = value as Record<string, unknown>
    if (typeof source.seconds === 'number') {
      return source.seconds * 1000
    }
    if (typeof source.toDate === 'function') {
      const maybeDate = source.toDate as () => Date
      const asDate = maybeDate()
      return asDate instanceof Date ? asDate.getTime() : 0
    }
  }

  return 0
}

export function useOrdersForKitchenFetch(kitchenId: Ref<string> | string) {
  const db = useFirestore()
  const { firestoreQuery } = useFirestoreRead()

  const resolvedKitchenId = computed(() =>
    String(typeof kitchenId === 'string' ? kitchenId : kitchenId.value || '').trim()
  )

  const sourceRef = shallowRef(null) as ShallowRef<Ref<Order[] | undefined> | null>
  const { orders: scopeOrders } = useOrdersFetchByScope(
    computed(() =>
      resolvedKitchenId.value
        ? {
            type: 'kitchen',
            id: resolvedKitchenId.value,
          }
        : null
    )
  )

  watch(
    resolvedKitchenId,
    (nextKitchenId) => {
      if (!nextKitchenId) {
        sourceRef.value = null
        return
      }

      const q = query(
        collection(db, ORDERS_COLLECTION),
        where('kitchen_id', '==', nextKitchenId)
      ) as Query<Order>

      sourceRef.value = firestoreQuery<Order>(q, `${ORDERS_COLLECTION}-${nextKitchenId}`)
    },
    { immediate: true }
  )

  const orders = computed<Order[]>(() => {
    const scoped = scopeOrders.value ?? []
    const legacy = sourceRef.value?.value ?? []
    const deduped = new Map<string, Order>()

    for (const order of [...scoped, ...legacy]) {
      const id = String(order?.id || '').trim()
      if (!id) continue
      if (!deduped.has(id)) deduped.set(id, order)
    }

    return [...deduped.values()].sort(
      (a, b) =>
        toMillis((b as any).updated?.at ?? (b as any).updated_at) -
        toMillis((a as any).updated?.at ?? (a as any).updated_at)
    )
  })

  return {
    kitchenId: resolvedKitchenId,
    orders,
  }
}
