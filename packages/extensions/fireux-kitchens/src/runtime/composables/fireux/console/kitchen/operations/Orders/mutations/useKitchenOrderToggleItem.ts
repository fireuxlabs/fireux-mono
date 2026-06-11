import { serverTimestamp } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { resolveKitchenScopeCollectionPath } from '../../../../../firestore/kitchen/utils/paths/useKitchenChildCollection'
import {
  KitchenOrderStorage,
  type KitchenOrder,
} from '../../../../../../../models/order.model'

type CloseKitchenOrderInput = {
  kitchenId: string
  orderId: string
  kitchenCollectionPath?: string
}

export function useKitchenOrderToggleItem() {
  const { updateDocument } = useFirestoreUpdate()
  const { appId } = useFireUXConfig()

  const closeOrder = async (input: CloseKitchenOrderInput) => {
    const kitchenId = String(input.kitchenId || '').trim()
    const orderId = String(input.orderId || '').trim()
    if (!kitchenId) throw new Error('Missing kitchenId')
    if (!orderId) throw new Error('Missing orderId')

    const kitchenCollectionPath = String(
      input.kitchenCollectionPath || ''
    ).trim() || resolveKitchenScopeCollectionPath(appId)

    await updateDocument<KitchenOrder>(
      `${kitchenCollectionPath}/${kitchenId}/${KitchenOrderStorage.collection}`,
      orderId,
      {
        status: 'closed',
        updated_at: serverTimestamp() as any,
      }
    )
  }

  return { closeOrder }
}
