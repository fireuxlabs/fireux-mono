import { computed, type Ref } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { OrderStorage, type Order } from '../models/order.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useOrderFetch(orderId: string | Ref<string | null | undefined>) {
  const { firestoreFetchDoc } = useFirestoreRead()
  const resolvedOrderId = computed(() =>
    normalizeString(typeof orderId === 'string' ? orderId : orderId.value)
  )
  const source = computed(() =>
    resolvedOrderId.value
      ? firestoreFetchDoc<Order>(OrderStorage.collection, resolvedOrderId.value)
      : null
  )
  const order = computed(() => source.value?.value ?? null)

  return {
    order,
    exists: computed(() => Boolean(order.value)),
  }
}
