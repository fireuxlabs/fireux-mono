// Concurrent edit — 2026-07-22 13:15 CEST — Demo World pass: project read-only Demo Stations without Firestore access.
import { computed } from 'vue'
import { useKitchenChildCollection } from '../../../../firestore/kitchen/utils/paths/useKitchenChildCollection'
import {
  KitchenStationStorage,
  type KitchenStation,
} from '../../../../../../models/kitchen/station.model'
import { useKitchenConsole } from '../../core/useKitchenConsole'
import { useKitchenConsoleReadPage } from '../Shared/useKitchenConsoleReadPage'
import {
  findKitchenConsoleDemoScenario,
  useKitchenConsoleDemoData,
} from '../../core/useKitchenConsoleDemoData'

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
  const demoData = useKitchenConsoleDemoData(
    computed(() => runtime.source.value === 'demo')
  )
  const demoScenario = computed(() => findKitchenConsoleDemoScenario(
    demoData.data.value,
    kitchenId.value
  ))
  const fetchKitchenId = computed(() =>
    rootCollection.value && kitchenId.value ? kitchenId.value : ''
  )
  const {
    items: fetchedStations,
    pending: stationsPending,
    collectionPath: fetchedCollectionPath,
  } = useKitchenChildCollection<KitchenStation>(
    KitchenStationStorage.collection,
    fetchKitchenId,
    {
      kitchenCollectionPath: rootCollection,
      databaseId,
    }
  )
  const consoleStations = computed(() =>
    runtime.source.value === 'demo'
      ? demoScenario.value?.stations ?? []
      : fetchedStations.value
  )
  const pending = computed(() =>
    runtime.source.value === 'demo'
      ? demoData.pending.value
      : stationsPending.value
  )
  const collectionPath = computed(() =>
    runtime.source.value === 'demo'
      ? `demo/kitchens/${kitchenId.value}/stations`
      : fetchedCollectionPath.value
  )
  const page = useKitchenConsoleReadPage<KitchenStation>({
    collectionName: KitchenStationStorage.collection,
    selectedKitchen,
    kitchenId,
    items: consoleStations,
    pending,
    collectionPath,
  })
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
