// Concurrent edit — 2026-07-22 13:15 CEST — Demo World pass: project read-only Demo mise tasks without Firestore access.
import { computed } from 'vue'
import { useKitchenMiseCollection } from './fetch/useKitchenMiseCollection'
import { useKitchenMiseToggleDone } from './mutations/useKitchenMiseToggleDone'
import {
  KitchenMiseTaskStorage,
  type KitchenMiseTask,
} from '../../../../../../models/kitchen/mise.model'
import { useKitchenConsole } from '../../core/useKitchenConsole'
import { useKitchenConsoleReadPage } from '../Shared/useKitchenConsoleReadPage'
import {
  findKitchenConsoleDemoScenario,
  useKitchenConsoleDemoData,
} from '../../core/useKitchenConsoleDemoData'

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
    miseTasks: fetchedMiseTasks,
    pending: misePending,
    collectionPath: fetchedCollectionPath,
  } =
    useKitchenMiseCollection(fetchKitchenId, {
      kitchenCollectionPath: rootCollection,
      databaseId,
  })
  const consoleMiseTasks = computed(() =>
    runtime.source.value === 'demo'
      ? demoScenario.value?.miseTasks ?? []
      : fetchedMiseTasks.value
  )
  const pending = computed(() =>
    runtime.source.value === 'demo'
      ? demoData.pending.value
      : misePending.value
  )
  const collectionPath = computed(() =>
    runtime.source.value === 'demo'
      ? `demo/kitchens/${kitchenId.value}/mise`
      : fetchedCollectionPath.value
  )
  const page = useKitchenConsoleReadPage<KitchenMiseTask>({
    collectionName: KitchenMiseTaskStorage.collection,
    selectedKitchen,
    kitchenId,
    items: consoleMiseTasks,
    pending,
    collectionPath,
  })
  const { toggleKitchenMiseDone } = useKitchenMiseToggleDone()
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
