// Concurrent edit — 2026-07-22 13:15 CEST — Demo World pass: project read-only Demo mise tasks without Firestore access.
import { computed } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
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

export function useKitchenWorkspaceMise() {
  const { hasIdentity } = useAuth()
  const { selection, runtime } = useKitchenWorkspace()
  const selectedKitchen = selection.kitchen
  const kitchenId = selection.kitchenId
  const rootCollection = runtime.rootCollection
  const databaseId = runtime.databaseId
  const readOnly = runtime.readOnly
  const canWrite = runtime.canWrite
  const fetchKitchenId = computed(() =>
    hasIdentity.value && rootCollection.value && kitchenId.value
      ? kitchenId.value
      : ''
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
  const workspaceMiseTasks = fetchedMiseTasks
  const pending = misePending
  const error = miseError
  const outcome = miseOutcome
  const collectionPath = fetchedCollectionPath
  const stationNames = computed<Readonly<Record<string, string>>>(() => ({}))
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
