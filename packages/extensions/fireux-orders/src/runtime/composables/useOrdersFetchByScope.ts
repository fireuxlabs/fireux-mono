import { collection, query, where, type Query } from 'firebase/firestore'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed, isRef, unref, type Ref } from 'vue'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { OrderStorage, type Order } from '../models/order.model'

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

type OrderScopeRef = {
  type: string
  id: string
}

export function useOrdersFetchByScope(scope: Ref<OrderScopeRef | null> | OrderScopeRef | null) {
  const db = useFirestore()
  const { firestoreQuery } = useFirestoreRead()

  const resolvedScopeType = computed(() =>
    String(
      isRef(scope)
        ? unref(scope)?.type || ''
        : (scope as OrderScopeRef | null)?.type || ''
    ).trim()
  )

  const resolvedScopeId = computed(() =>
    String(
      isRef(scope)
        ? unref(scope)?.id || ''
        : (scope as OrderScopeRef | null)?.id || ''
    ).trim()
  )

  const orderQuery = computed<Query<Order> | null>(() =>
    resolvedScopeType.value && resolvedScopeId.value
      ? query(
          collection(db, OrderStorage.collection),
          where('scope_type', '==', resolvedScopeType.value),
          where('scope_id', '==', resolvedScopeId.value)
        ) as Query<Order>
      : null
  )
  const source = firestoreQuery<Order>(orderQuery)

  const orders = computed<Order[]>(() => {
    const base = source.value ?? []
    return [...base].sort(
      (a, b) =>
        toMillis((b as any).updated?.at ?? (b as any).updated_at) -
        toMillis((a as any).updated?.at ?? (a as any).updated_at)
    )
  })

  return {
    scopeType: resolvedScopeType,
    scopeId: resolvedScopeId,
    orders,
  }
}
