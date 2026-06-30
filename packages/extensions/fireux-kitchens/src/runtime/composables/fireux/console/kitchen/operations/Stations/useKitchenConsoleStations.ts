import { computed } from 'vue'
import { useKitchenChildCollection } from '../../../../firestore/kitchen/utils/paths/useKitchenChildCollection'
import {
  KitchenStationStorage,
  type KitchenStation,
} from '../../../../../../models/kitchen/station.model'
import { useKitchenConsole } from '../../core/useKitchenConsole'
import { useKitchenConsoleReadPage } from '../Shared/useKitchenConsoleReadPage'

export function useKitchenConsoleStations() {
  const {
    selection,
    runtime,
  } = useKitchenConsole()
  const selectedKitchen = selection.kitchen
  const kitchenId = selection.kitchenId
  const rootCollection = runtime.rootCollection
  const databaseId = runtime.databaseId
  const readOnly = runtime.readOnly
  const canWrite = runtime.canWrite
  const fetchKitchenId = computed(() =>
    rootCollection.value && kitchenId.value ? kitchenId.value : ''
  )
  const {
    items: stations,
    pending: stationsPending,
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
    kitchenId,
    items: stations,
    pending: stationsPending,
    collectionPath,
  })
  const consoleStations = computed(() => page.collection.value.items)
  const pending = computed(() => page.collection.value.pending)
  const debug = computed(() => ({
    kitchenId: kitchenId.value,
    rootCollection: rootCollection.value,
    databaseId: databaseId.value,
    collectionPath: collectionPath.value,
    count: consoleStations.value.length,
    pending: pending.value,
    readOnly: readOnly.value,
    canWrite: canWrite.value,
  }))

  return {
    ...page,
    selectedKitchen,
    kitchenId,
    collectionPath,
    rootCollection,
    databaseId,
    readOnly,
    canWrite,
    stations: consoleStations,
    pending,
    debug,
  }
}
