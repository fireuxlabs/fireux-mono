import type { Ref } from 'vue'
import type { KitchenMiseTask } from '../../../../../../models/kitchen-mise.model'
import { useKitchenConsoleCollection } from '../../fetch/useKitchenConsoleCollection'

type UseKitchenMiseCollectionOptions = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
}

export function useKitchenMiseCollection(
  kitchenId: Ref<string> | string,
  options: UseKitchenMiseCollectionOptions = {}
) {
  const state = useKitchenConsoleCollection<KitchenMiseTask>('mise', kitchenId, options)

  return {
    kitchenId: state.kitchenId,
    kitchenCollectionPath: state.kitchenCollectionPath,
    collectionPath: state.collectionPath,
    miseTasks: state.items,
    pending: state.pending,
  }
}
