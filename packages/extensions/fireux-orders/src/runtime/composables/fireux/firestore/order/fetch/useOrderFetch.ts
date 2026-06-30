import { doc, type DocumentSnapshot } from 'firebase/firestore'
import { attachDevCollectionMeta } from 'fireux-core/runtime/composables/dev/useDevCollectionJson'
import {
  useDocument,
  useFirestoreResolver,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { computed, unref, type Ref } from 'vue'
import { OrderStorage, type Order } from '../../../../../models/order.model'

type UseOrderFetchOptions = {
  databaseId?: string | Ref<string | null | undefined>
}

const clean = (value: unknown) => String(value ?? '').trim()

export function useOrderFetch(
  orderId: string | Ref<string | null | undefined>,
  options: UseOrderFetchOptions = {}
) {
  const resolveDb = useFirestoreResolver(options.databaseId)
  const resolvedOrderId = computed(() => clean(unref(orderId)))
  const docRef = computed(() =>
    resolvedOrderId.value
      ? doc(resolveDb(), OrderStorage.collection, resolvedOrderId.value)
      : null
  )
  const order = import.meta.server
    ? computed<Order | undefined>(() => undefined)
    : (useDocument<Order>(docRef, {
        ssrKey: computed(() =>
          resolvedOrderId.value
            ? `${OrderStorage.collection}-${resolvedOrderId.value}`
            : 'order-empty'
        ),
        transform: (docSnap: DocumentSnapshot<Order>) => {
          const raw = docSnap.data()
          if (!raw) return undefined
          const value = { ...(raw as Order), id: docSnap.id }
          return attachDevCollectionMeta(
            value,
            OrderStorage.collection,
            docSnap.id
          ) as Order
        },
      } as any) as any).data as Ref<Order | undefined>
  const exists = computed(() => Boolean(order.value))

  return {
    orderId: resolvedOrderId,
    collectionPath: computed(() => OrderStorage.collection),
    order,
    exists,
  }
}
