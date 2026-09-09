import { computed, type Ref } from 'vue'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import {
  KitchenStationStorage,
  normalizeKitchenStation,
  type KitchenStation,
} from '../utils/station.ts'
import { useKitchenChildCollection } from './useKitchenChildCollection'

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
    state.items.value.map((item) => normalizeKitchenStation(item))
  )
  const { byId: kitchenStation } = useCollectionById(kitchenStations)

  return {
    kitchenId: state.kitchenId,
    kitchenCollectionPath: state.kitchenCollectionPath,
    collectionPath: state.collectionPath,
    kitchenStations,
    kitchenStation,
    count: computed(() => kitchenStations.value.length),
    error: state.error,
    outcome: state.outcome,
    pending: state.pending,
  }
}
