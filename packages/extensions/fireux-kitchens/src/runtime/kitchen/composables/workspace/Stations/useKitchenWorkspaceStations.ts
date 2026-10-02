import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import {
  computed,
  inject,
  provide,
  ref,
  watch,
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
  const readOnly = computed(() => false)
  const canWrite = computed(() => Boolean(workspace.data.value))
  const fetchKitchenId = computed(() =>
    rootCollection.value && kitchenId.value ? kitchenId.value : ''
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
  const { currentUser } = useAuth()
  const defaultStationError = ref('')
  watch(
    [fetchKitchenId, canWrite, () => currentUser.value?.uid || ''],
    async ([id, writable], _, onCleanup) => {
      let current = true
      onCleanup(() => {
        current = false
      })
      defaultStationError.value = ''
      const user = currentUser.value
      if (!import.meta.client || !id || !writable || !user) return
      try {
        const token = await user.getIdToken()
        if (!current) return
        await $fetch('/api/workspace/kitchen/stations/ensure-default', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + token },
          body: { kitchenId: id },
        })
      } catch {
        if (current)
          defaultStationError.value =
            'Could not set up the Pass station. Reload to retry.'
      }
    },
    { immediate: true, flush: 'sync' }
  )
  const workspaceStations = computed(() =>
    stationsOutcome.value === 'ready' ? fetchedStations.value : []
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
    defaultStationError,
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
    outcome: stationsOutcome,
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
