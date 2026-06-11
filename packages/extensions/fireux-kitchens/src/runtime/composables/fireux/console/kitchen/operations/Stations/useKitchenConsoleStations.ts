import { computed } from 'vue'
import { useKitchenChildCollection } from '../../../../firestore/kitchen/utils/paths/useKitchenChildCollection'
import {
  KitchenStationStorage,
  type KitchenStation,
} from '../../../../../models/kitchen-station.model'
import { useKitchenConsole } from '../../core/useKitchenConsole'
import { useKitchenConsoleReadPage } from '../Shared/useKitchenConsoleReadPage'

export function useKitchenConsoleStations() {
  const {
    selectedKitchen,
    selectedMode,
    kitchenId,
    rootCollection,
    databaseId,
    canWrite,
  } = useKitchenConsole()
  const fetchKitchenId = computed(() =>
    rootCollection.value && kitchenId.value ? kitchenId.value : ''
  )
  const {
    items: liveStations,
    pending: livePending,
    collectionPath,
  } = useKitchenChildCollection<KitchenStation>(
    KitchenStationStorage.collection,
    fetchKitchenId,
    {
      kitchenCollectionPath: rootCollection,
      databaseId,
    }
  )
  const page = useKitchenConsoleReadPage<KitchenStation>({
    collectionName: KitchenStationStorage.collection,
    selectedKitchen,
    selectedMode,
    kitchenId,
    liveItems: liveStations,
    livePending,
    collectionPath,
  })
  const stations = computed(() => page.collection.value.items)
  const pending = computed(() => page.collection.value.pending)
  const debug = computed(() => ({
    mode: selectedMode.value,
    kitchenId: kitchenId.value,
    rootCollection: rootCollection.value,
    databaseId: databaseId.value,
    collectionPath: collectionPath.value,
    count: stations.value.length,
    pending: pending.value,
    canWrite: canWrite.value,
  }))

  return {
    ...page,
    selectedKitchen,
    selectedMode,
    kitchenId,
    collectionPath,
    rootCollection,
    databaseId,
    canWrite,
    stations,
    pending,
    debug,
  }
}
