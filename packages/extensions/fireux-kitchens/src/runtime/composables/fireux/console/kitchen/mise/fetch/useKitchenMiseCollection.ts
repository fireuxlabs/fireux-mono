import type { Ref } from 'vue'
import type { KitchenMiseTask } from '../../../../../../models/kitchen-mise.model'
import { useKitchenChildCollection } from '../../collections/useKitchenChildCollection'

type UseKitchenMiseCollectionOptions = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
}

export function useKitchenMiseCollection(
  kitchenId: Ref<string> | string,
  options: UseKitchenMiseCollectionOptions = {}
) {
  const state = useKitchenChildCollection<KitchenMiseTask>('mise', kitchenId, options)

  return {
    kitchenId: state.kitchenId,
    kitchenCollectionPath: state.kitchenCollectionPath,
    collectionPath: state.collectionPath,
    miseTasks: state.items,
    pending: state.pending,
  }
}
