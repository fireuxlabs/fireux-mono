import { computed } from 'vue'
import { useKitchenMiseCollection } from './fetch/useKitchenMiseCollection'
import { useKitchenMiseToggleDone } from './mutations/useKitchenMiseToggleDone'
import { KitchenStorage } from '../../../../../../models/kitchen.model'
import {
  KitchenMiseTaskStorage,
  type KitchenMiseTask,
} from '../../../../../../models/kitchen-mise.model'
import { useKitchenConsole } from '../../core/useKitchenConsole'
import { useKitchenConsoleReadPage } from '../Shared/useKitchenConsoleReadPage'

export function useKitchenConsoleMise() {
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
  const { miseTasks: liveMiseTasks, pending: livePending, collectionPath } =
    useKitchenMiseCollection(fetchKitchenId, {
      kitchenCollectionPath: rootCollection,
      databaseId,
  })
  const page = useKitchenConsoleReadPage<KitchenMiseTask>({
    collectionName: KitchenMiseTaskStorage.collection,
    selectedKitchen,
    selectedMode,
    kitchenId,
    liveItems: liveMiseTasks,
    livePending,
    collectionPath,
  })
  const { toggleKitchenMiseDone } = useKitchenMiseToggleDone()
  const miseTasks = computed(() => page.collection.value.items)
  const pending = computed(() => page.collection.value.pending)
  const canToggleMise = computed(
    () =>
      canWrite.value &&
      selectedMode.value === 'test' &&
      rootCollection.value === KitchenStorage.rootCollection
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
    mode: selectedMode.value,
    kitchenId: kitchenId.value,
    rootCollection: rootCollection.value,
    databaseId: databaseId.value,
    collectionPath: collectionPath.value,
    count: miseTasks.value.length,
    pending: pending.value,
    canWrite: canWrite.value,
    canToggleMise: canToggleMise.value,
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
    canToggleMise,
    miseTasks,
    pending,
    toggleDone,
    debug,
  }
}
