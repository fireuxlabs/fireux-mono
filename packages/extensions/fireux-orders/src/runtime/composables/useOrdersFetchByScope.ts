import { collection, query, where, type Query } from 'firebase/firestore'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed, isRef, shallowRef, unref, watch, type Ref, type ShallowRef } from 'vue'
import { useFirestore } from 'vuefire'
import type { Order } from '../models/order.model'

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

  const sourceRef = shallowRef(null) as ShallowRef<Ref<Order[] | undefined> | null>

  watch(
    [resolvedScopeType, resolvedScopeId],
    ([nextScopeType, nextScopeId]) => {
      if (!nextScopeType || !nextScopeId) {
        sourceRef.value = null
        return
      }

      const q = query(
        collection(db, ORDERS_COLLECTION),
        where('scope_type', '==', nextScopeType),
        where('scope_id', '==', nextScopeId)
      ) as Query<Order>

      sourceRef.value = firestoreQuery<Order>(
        q,
        `${ORDERS_COLLECTION}-${nextScopeType}-${nextScopeId}`
      )
    },
    { immediate: true }
  )

  const orders = computed<Order[]>(() => {
    const base = sourceRef.value?.value ?? []
    return [...base].sort((a, b) => toMillis(b.updated_at) - toMillis(a.updated_at))
  })

  return {
    scopeType: resolvedScopeType,
    scopeId: resolvedScopeId,
    orders,
  }
}
