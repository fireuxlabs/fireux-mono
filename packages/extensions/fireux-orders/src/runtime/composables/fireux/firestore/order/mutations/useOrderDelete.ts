import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import type { Ref } from 'vue'
import { OrderStorage } from '../../../../../models/order.model'

type UseOrderDeleteOptions = {
  databaseId?: string | Ref<string | null | undefined>
}

const clean = (value: unknown) => String(value ?? '').trim()

export function useOrderDelete(options: UseOrderDeleteOptions = {}) {
  const { deleteDocument } = useFirestoreDelete({
    databaseId: options.databaseId,
  })

  async function deleteOrder(orderId: string) {
    const id = clean(orderId)
    if (!id) throw new Error('[useOrderDelete] order id is required.')
    await deleteDocument(OrderStorage.collection, id)
  }

  return { deleteOrder }
}
