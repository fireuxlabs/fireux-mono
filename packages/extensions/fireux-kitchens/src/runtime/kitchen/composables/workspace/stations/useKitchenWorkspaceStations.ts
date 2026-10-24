import {
  computed,
  inject,
  provide,
  ref,
  watchEffect,
  type InjectionKey,
} from 'vue'
import {
  KitchenStationStorage,
  type KitchenStation,
} from '../../../utils/station.ts'
import { useKitchenWorkspace } from '../useKitchenWorkspace'
import { useKitchenWorkspaceReadPage } from '../useKitchenWorkspaceReadPage'
import { useKitchenStationCollection } from '../../useKitchenStationCollection'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'

function createKitchenWorkspaceStations() {
  const workspace = useKitchenWorkspace()
  const selectedKitchen = workspace.data
  const kitchenId = workspace.id
  const rootCollection = computed(() => 'kitchens')
  const databaseId = computed(() => readRuntimeFirestoreDatabaseId() || '')
  const readOnly = computed(() => !canWrite.value)
  const canWrite = computed(
    () =>
      workspace.outcome.value === 'ready' &&
      workspace.data.value?.id === kitchenId.value
  )
  const fetchKitchenId = computed(() =>
    workspace.outcome.value === 'ready' &&
    workspace.data.value?.id === kitchenId.value
      ? kitchenId.value
      : ''
  )
  const {
    kitchenStations: fetchedStations,
    pending: stationsPending,
    outcome: stationsOutcome,
    error: stationsError,
    collectionPath: fetchedCollectionPath,
  } = useKitchenStationCollection(fetchKitchenId, {
    kitchenCollectionPath: rootCollection,
    databaseId,
  })
  const workspaceStations = computed(() =>
    workspace.outcome.value === 'ready' && stationsOutcome.value === 'ready'
      ? fetchedStations.value
      : []
  )
  const selectedStationId = ref('')
  const selectedStation = computed(
    () =>
      workspaceStations.value.find(
        (station) => station.id === selectedStationId.value
      ) ?? null
  )
  watchEffect(() => {
    if (selectedStation.value) return
    selectedStationId.value = workspaceStations.value[0]?.id || ''
  })
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
    selectedStation,
    selectedStationId,
    pending,
    outcome: computed(() =>
      workspace.outcome.value === 'ready'
        ? stationsOutcome.value
        : workspace.outcome.value
    ),
    error: stationsError,
    debug,
  }
}

export type KitchenWorkspaceStations = ReturnType<
  typeof createKitchenWorkspaceStations
>

const kitchenWorkspaceStationsKey: InjectionKey<KitchenWorkspaceStations> =
  Symbol('fireux-kitchen-workspace-stations')

export function provideKitchenWorkspaceStations() {
  const workspace = createKitchenWorkspaceStations()
  provide(kitchenWorkspaceStationsKey, workspace)
  return workspace
}

export function useKitchenWorkspaceStations() {
  return (
    inject(kitchenWorkspaceStationsKey, null) ??
    createKitchenWorkspaceStations()
  )
}
