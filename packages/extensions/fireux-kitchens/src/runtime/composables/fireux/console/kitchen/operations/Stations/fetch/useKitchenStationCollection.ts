import { computed, type Ref } from 'vue'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import {
  KitchenStationStorage,
  normalizeKitchenStation,
  type KitchenStation,
} from '../../../../../../../models/kitchen/station.model'
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
  const kitchenStations = computed(() =>
    state.items.value.map(item => normalizeKitchenStation(item))
  )
  const { byId: kitchenStation } = useCollectionById(kitchenStations)

  return {
    kitchenId: state.kitchenId,
    kitchenCollectionPath: state.kitchenCollectionPath,
    collectionPath: state.collectionPath,
    kitchenStations,
    kitchenStation,
    pending: state.pending,
  }
}
