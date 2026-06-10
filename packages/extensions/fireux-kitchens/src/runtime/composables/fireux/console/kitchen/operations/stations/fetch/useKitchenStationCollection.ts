import type { Ref } from 'vue'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import {
  KitchenStationStorage,
  type KitchenStation,
} from '../../../../../../../models/kitchen-station.model'
import { useKitchenChildCollection } from '../../../../../firestore/kitchen/utils/paths/useKitchenChildCollection'

export function useKitchenStationCollection(
  kitchenId: Ref<string> | string,
  options: {
    kitchenCollectionPath?: string | Ref<string | null | undefined>
    databaseId?: string | Ref<string | null | undefined>
  } = {}
) {
  const state = useKitchenChildCollection<KitchenStation>(
    KitchenStationStorage.collection,
    kitchenId,
    options
  )
  const { byId: kitchenStation } = useCollectionById(state.items)

  return {
    kitchenId: state.kitchenId,
    kitchenCollectionPath: state.kitchenCollectionPath,
    collectionPath: state.collectionPath,
    kitchenStations: state.items,
    kitchenStation,
    pending: state.pending,
  }
}
