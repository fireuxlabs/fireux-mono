import { computed } from 'vue'
import { useKitchenChildCollection } from '../../firestore/kitchen/fetch/useKitchenChildCollection'
import type { KitchenStation } from '../../../../models/kitchen-station.model'
import { useKitchenConsole } from './useKitchenConsole'
import { useKitchenConsoleReadPage } from './useKitchenConsoleReadPage'

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
  } = useKitchenChildCollection<KitchenStation>('stations', fetchKitchenId, {
    kitchenCollectionPath: rootCollection,
    databaseId,
  })
  const page = useKitchenConsoleReadPage<KitchenStation>({
    collectionName: 'stations',
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
