import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import type { Ref } from 'vue'
import { useKitchenChildCollection } from '../../firestore/useKitchenChildCollection'
import {
  KitchenOrderStorage,
  type KitchenOrder,
} from '../../../utils/order.ts'

type UseKitchenOrderFetchOptions = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
}

export function useKitchenOrderFetch(
  kitchenId: Ref<string> | string,
  options: UseKitchenOrderFetchOptions = {}
) {
  const state = useKitchenChildCollection<KitchenOrder>(
    KitchenOrderStorage.collection,
    kitchenId,
    options
  )
  const orders = state.items
  const { byId: order } = useCollectionById(orders)

  return {
    kitchenId: state.kitchenId,
    kitchenCollectionPath: state.kitchenCollectionPath,
    ordersPath: state.collectionPath,
    orders,
    order,
    pending: state.pending,
  }
}
