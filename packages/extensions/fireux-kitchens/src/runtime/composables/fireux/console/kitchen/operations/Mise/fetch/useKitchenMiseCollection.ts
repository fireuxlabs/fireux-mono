import type { Ref } from 'vue'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import {
  KitchenMiseTaskStorage,
  type KitchenMiseTask,
} from '../../../../../../../models/kitchen/mise.model'
import { useKitchenChildCollection } from '../../../../../firestore/kitchen/utils/paths/useKitchenChildCollection'

type UseKitchenMiseCollectionOptions = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
}

export function useKitchenMiseCollection(
  kitchenId: Ref<string> | string,
  options: UseKitchenMiseCollectionOptions = {}
) {
  const state = useKitchenChildCollection<KitchenMiseTask>(
    KitchenMiseTaskStorage.collection,
    kitchenId,
    options
  )
  const { byId: miseTask } = useCollectionById(state.items)

  return {
    kitchenId: state.kitchenId,
    kitchenCollectionPath: state.kitchenCollectionPath,
    collectionPath: state.collectionPath,
    miseTasks: state.items,
    miseTask,
    pending: state.pending,
  }
}
