import { computed, type Ref } from 'vue'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import {
  KitchenCostSnapshotStorage,
  type KitchenCostSnapshot,
} from '../../../../../../../models/kitchen-cost.model'
import { useKitchenChildCollection } from '../../collections/useKitchenChildCollection'

export function useKitchenCostSnapshotCollection(
  kitchenId: Ref<string> | string,
  options: {
    kitchenCollectionPath?: string | Ref<string | null | undefined>
    databaseId?: string | Ref<string | null | undefined>
  } = {}
) {
  const {
    items,
    pending,
    collectionPath,
  } = useKitchenChildCollection<KitchenCostSnapshot>(
    KitchenCostSnapshotStorage.collection,
    kitchenId,
    options
  )
  const { byId: kitchenCostSnapshot } = useCollectionById(items)

  return {
    kitchenCostSnapshots: computed(() => items.value),
    kitchenCostSnapshot,
    pending,
    collectionPath,
  }
}
