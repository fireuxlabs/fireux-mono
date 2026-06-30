import { computed } from 'vue'
import { useKitchenMiseCollection } from './fetch/useKitchenMiseCollection'
import { useKitchenMiseToggleDone } from './mutations/useKitchenMiseToggleDone'
import {
  KitchenMiseTaskStorage,
  type KitchenMiseTask,
} from '../../../../../../models/kitchen/mise.model'
import { useKitchenConsole } from '../../core/useKitchenConsole'
import { useKitchenConsoleReadPage } from '../Shared/useKitchenConsoleReadPage'

export function useKitchenConsoleMise() {
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
  const { miseTasks, pending: misePending, collectionPath } =
    useKitchenMiseCollection(fetchKitchenId, {
      kitchenCollectionPath: rootCollection,
      databaseId,
  })
  const page = useKitchenConsoleReadPage<KitchenMiseTask>({
    collectionName: KitchenMiseTaskStorage.collection,
    selectedKitchen,
    kitchenId,
    items: miseTasks,
    pending: misePending,
    collectionPath,
  })
  const { toggleKitchenMiseDone } = useKitchenMiseToggleDone()
  const consoleMiseTasks = computed(() => page.collection.value.items)
  const pending = computed(() => page.collection.value.pending)
  const canToggleMise = computed(
    () => canWrite.value && Boolean(rootCollection.value && kitchenId.value)
  )
  const isDone = (task: KitchenMiseTask) => {
    const source = task as Record<string, unknown>
    if (task.status === 'done') return true
    return Boolean(
      source.done ||
        source.checked ||
        source.complete ||
        source.completed
    )
  }
  const toggleDone = async (task: KitchenMiseTask) => {
    const taskId = String(task?.id || '').trim()
    if (!canToggleMise.value || !taskId) return

    await toggleKitchenMiseDone({
      kitchenId: kitchenId.value,
      taskId,
      done: !isDone(task),
      kitchenCollectionPath: rootCollection.value,
    })
  }
  const debug = computed(() => ({
    kitchenId: kitchenId.value,
    rootCollection: rootCollection.value,
    databaseId: databaseId.value,
    collectionPath: collectionPath.value,
    count: consoleMiseTasks.value.length,
    pending: pending.value,
    readOnly: readOnly.value,
    canWrite: canWrite.value,
    canToggleMise: canToggleMise.value,
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
    canToggleMise,
    miseTasks: consoleMiseTasks,
    pending,
    toggleDone,
    debug,
  }
}
