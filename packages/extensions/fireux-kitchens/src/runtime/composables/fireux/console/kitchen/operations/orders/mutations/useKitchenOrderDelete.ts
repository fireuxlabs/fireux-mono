import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import type { Ref } from 'vue'
import { unref } from 'vue'
import { KitchenOrderStorage } from '../../../../../../../models/order.model'
import {
  normalizeString,
  resolveKitchenChildCollectionPath,
} from '../../Collections/useKitchenChildCollection'

export function useKitchenOrderDelete(options: {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
} = {}) {
  const { deleteDocument } = useFirestoreDelete({ databaseId: options.databaseId })
  const { appId } = useFireUXConfig()

  async function deleteKitchenOrder(kitchenId: string, orderId: string) {
    const resolvedKitchenId = normalizeString(kitchenId)
    const resolvedOrderId = normalizeString(orderId)
    if (!resolvedKitchenId) throw new Error('Kitchen id is required')
    if (!resolvedOrderId) throw new Error('Order id is required')

    const collectionPath = resolveKitchenChildCollectionPath({
      kitchenCollectionPath: unref(options.kitchenCollectionPath),
      kitchenId: resolvedKitchenId,
      collectionName: KitchenOrderStorage.collection,
      appId,
    })

    await deleteDocument(collectionPath, resolvedOrderId)
  }

  return { deleteKitchenOrder }
}
