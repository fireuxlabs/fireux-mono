import { serverTimestamp } from 'firebase/firestore'
import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import type { Ref } from 'vue'
import { unref } from 'vue'
import {
  KitchenOrderStorage,
  type KitchenOrder,
} from '../../../../../../../models/kitchen/order.model'
import {
  normalizeString,
  resolveKitchenChildCollectionPath,
} from '../../../../../firestore/kitchen/utils/paths/useKitchenChildCollection'

export function useKitchenOrderDelete(options: {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
} = {}) {
  const { deleteDocument } = useFirestoreDelete({ databaseId: options.databaseId })
  const { updateDocument } = useFirestoreUpdate({ databaseId: options.databaseId })
  const { appId } = useFireUXConfig()

  function ordersCollectionPath(kitchenId: string) {
    const resolvedKitchenId = normalizeString(kitchenId)
    if (!resolvedKitchenId) throw new Error('Kitchen id is required')

    return resolveKitchenChildCollectionPath({
      kitchenCollectionPath: unref(options.kitchenCollectionPath),
      kitchenId: resolvedKitchenId,
      collectionName: KitchenOrderStorage.collection,
      appId,
    })
  }

  async function trashKitchenOrder(kitchenId: string, orderId: string) {
    const resolvedOrderId = normalizeString(orderId)
    if (!resolvedOrderId) throw new Error('Order id is required')

    await updateDocument<KitchenOrder>(
      ordersCollectionPath(kitchenId),
      resolvedOrderId,
      {
        status: 'trashed',
        updated_at: serverTimestamp() as any,
      }
    )
  }

  async function deleteKitchenOrder(kitchenId: string, orderId: string) {
    const resolvedOrderId = normalizeString(orderId)
    if (!resolvedOrderId) throw new Error('Order id is required')

    await deleteDocument(ordersCollectionPath(kitchenId), resolvedOrderId)
  }

  return {
    deleteKitchenOrder,
    trashKitchenOrder,
  }
}
