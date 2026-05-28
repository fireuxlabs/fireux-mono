import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import { OrderStorage } from '../models/order.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useOrderDelete() {
  const { deleteDocument } = useFirestoreDelete()

  async function deleteOrder(orderId: string): Promise<void> {
    const resolvedOrderId = normalizeString(orderId)
    if (!resolvedOrderId) {
      throw new Error('[fireux-orders] order id is required.')
    }

    await deleteDocument(OrderStorage.collection, resolvedOrderId)
  }

  return {
    deleteOrder,
  }
}
