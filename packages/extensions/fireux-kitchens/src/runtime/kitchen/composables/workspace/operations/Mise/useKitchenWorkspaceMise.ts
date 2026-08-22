// Concurrent edit — 2026-07-22 13:15 CEST — Demo World pass: project read-only Demo mise tasks without Firestore access.
import { computed } from 'vue'
import { useKitchenMiseCollection } from './fetch/useKitchenMiseCollection'
import { useKitchenMiseStatusUpdate } from './mutations/useKitchenMiseStatusUpdate'
import {
  KitchenMiseTaskStorage,
  normalizeKitchenMiseStatus,
  type KitchenMiseStatus,
  type KitchenMiseTask,
} from '../../../../utils/mise.ts'
import { useKitchenWorkspace } from '../../core/useKitchenWorkspace'
import { useKitchenWorkspaceReadPage } from '../Shared/useKitchenWorkspaceReadPage'
import {
  findKitchenWorkspaceDemoScenario,
  useKitchenWorkspaceDemoData,
} from '../../core/useKitchenWorkspaceDemoData'
import { useKitchenWorkspaceDemoMenuService } from '../../core/useKitchenWorkspaceDemoMenuService'

export function useKitchenWorkspaceMise() {
  const { selection, runtime } = useKitchenWorkspace()
  const selectedKitchen = selection.kitchen
  const kitchenId = selection.kitchenId
  const rootCollection = runtime.rootCollection
  const databaseId = runtime.databaseId
  const readOnly = runtime.readOnly
  const canWrite = runtime.canWrite
  const demoData = useKitchenWorkspaceDemoData(runtime.isDemo)
  const demoScenario = computed(() =>
    findKitchenWorkspaceDemoScenario(demoData.data.value, kitchenId.value)
  )
  const stationNames = computed<Readonly<Record<string, string>>>(() =>
    Object.fromEntries(
      (demoScenario.value?.stations ?? [])
        .map((station) => [
          String(station.id || '').trim(),
          String(station.name || '').trim(),
        ])
        .filter(([stationId, stationName]) => Boolean(stationId && stationName))
    )
  )
  const demoMenuService = useKitchenWorkspaceDemoMenuService(demoScenario)
  const fetchKitchenId = computed(() =>
    rootCollection.value && kitchenId.value ? kitchenId.value : ''
  )
  const {
    miseTasks: fetchedMiseTasks,
    pending: misePending,
    error: miseError,
    outcome: miseOutcome,
    collectionPath: fetchedCollectionPath,
  } = useKitchenMiseCollection(fetchKitchenId, {
    kitchenCollectionPath: rootCollection,
    databaseId,
  })
  const workspaceMiseTasks = computed(() =>
    runtime.isDemo.value
      ? (demoScenario.value?.miseTasks ?? []).filter((task) => {
          return demoMenuService.isTaskInService(task)
        })
      : fetchedMiseTasks.value
  )
  const pending = computed(() =>
    runtime.isDemo.value ? demoData.pending.value : misePending.value
  )
  const error = computed(() =>
    runtime.isDemo.value ? demoData.error.value : miseError.value
  )
  const outcome = computed(() => {
    if (pending.value) return 'pending' as const
    if (error.value) return 'error' as const
    if (!kitchenId.value) return 'idle' as const
    if (!runtime.isDemo.value) return miseOutcome.value
    return workspaceMiseTasks.value.length
      ? ('ready' as const)
      : ('empty' as const)
  })
  const collectionPath = computed(() =>
    runtime.isDemo.value
      ? `demo/kitchens/${kitchenId.value}/mise`
      : fetchedCollectionPath.value
  )
  const page = useKitchenWorkspaceReadPage<KitchenMiseTask>({
    collectionName: KitchenMiseTaskStorage.collection,
    selectedKitchen,
    kitchenId,
    items: workspaceMiseTasks,
    pending,
    collectionPath,
  })
  const { updateKitchenMiseStatus } = useKitchenMiseStatusUpdate()
  const canUpdateMiseStatus = computed(
    () => canWrite.value && Boolean(rootCollection.value && kitchenId.value)
  )
  const setStatus = async (
    task: KitchenMiseTask,
    nextStatus: KitchenMiseStatus
  ) => {
    const taskId = String(task?.id || '').trim()
    if (!canUpdateMiseStatus.value || !taskId) return

    await updateKitchenMiseStatus({
      kitchenId: kitchenId.value,
      taskId,
      status: normalizeKitchenMiseStatus(nextStatus),
      kitchenCollectionPath: rootCollection.value,
    })
  }
  const debug = computed(() => ({
    kitchenId: kitchenId.value,
    rootCollection: rootCollection.value,
    databaseId: databaseId.value,
    collectionPath: collectionPath.value,
    count: workspaceMiseTasks.value.length,
    demoMenuAvailability:
      demoMenuService.cascade.value?.menus.map((menu) => ({
        ...menu,
        inService: demoMenuService.isMenuInService(menu.id),
      })) ?? [],
    pending: pending.value,
    outcome: outcome.value,
    loadError: Boolean(error.value),
    readOnly: readOnly.value,
    canWrite: canWrite.value,
    canUpdateMiseStatus: canUpdateMiseStatus.value,
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
    canUpdateMiseStatus,
    miseTasks: workspaceMiseTasks,
    stationNames,
    pending,
    error,
    outcome,
    setStatus,
    debug,
  }
}
