// Concurrent edit — 2026-07-22 13:15 CEST — Demo World pass: project read-only Demo Stations without Firestore access.
import { computed } from 'vue'
import {
  KitchenStationStorage,
  type KitchenStation,
} from '../../../../utils/station.ts'
import { useKitchenWorkspace } from '../../core/useKitchenWorkspace'
import { useKitchenWorkspaceReadPage } from '../Shared/useKitchenWorkspaceReadPage'
import { useKitchenStationCollection } from './fetch/useKitchenStationCollection'

export function useKitchenWorkspaceStations() {
  const { selection, runtime } = useKitchenWorkspace()
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
    kitchenStations: fetchedStations,
    pending: stationsPending,
    collectionPath: fetchedCollectionPath,
  } = useKitchenStationCollection(fetchKitchenId, {
    kitchenCollectionPath: rootCollection,
    databaseId,
  })
  const workspaceStations = fetchedStations
  const pending = stationsPending
  const collectionPath = fetchedCollectionPath
  const page = useKitchenWorkspaceReadPage<KitchenStation>({
    collectionName: KitchenStationStorage.collection,
    selectedKitchen,
    kitchenId,
    items: workspaceStations,
    pending,
    collectionPath,
  })
  const debug = computed(() => ({
    kitchenId: kitchenId.value,
    rootCollection: rootCollection.value,
    databaseId: databaseId.value,
    collectionPath: collectionPath.value,
    count: workspaceStations.value.length,
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
    stations: workspaceStations,
    pending,
    debug,
  }
}
