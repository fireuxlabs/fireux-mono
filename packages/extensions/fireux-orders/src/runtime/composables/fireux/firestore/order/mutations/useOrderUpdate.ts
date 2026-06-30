import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import type { Ref } from 'vue'
import {
  OrderStorage,
  type Order,
  type OrderStatus,
} from '../../../../../models/order.model'

type UseOrderUpdateOptions = {
  databaseId?: string | Ref<string | null | undefined>
}

const clean = (value: unknown) => String(value ?? '').trim()

export function useOrderUpdate(options: UseOrderUpdateOptions = {}) {
  const { updateDocument } = useFirestoreUpdate({
    databaseId: options.databaseId,
  })

  async function updateOrder(orderId: string, patch: Partial<Order>) {
    const id = clean(orderId)
    if (!id) throw new Error('[useOrderUpdate] order id is required.')
    await updateDocument<Order>(OrderStorage.collection, id, patch)
  }

  async function setOrderStatus(orderId: string, status: OrderStatus) {
    await updateOrder(orderId, { status })
  }

  return {
    updateOrder,
    setOrderStatus,
  }
}
