import { computed } from 'vue'
import { useKitchenMiseCollection } from '../../firestore/runtime-kitchen/mise/fetch/useKitchenMiseCollection'
import type { KitchenMiseTask } from '../../../../models/kitchen-mise.model'
import { useKitchenConsole } from './useKitchenConsole'
import { useKitchenConsoleReadPage } from './useKitchenConsoleReadPage'

export function useKitchenConsoleMise() {
  const {
    selectedKitchen,
    selectedMode,
    kitchenId,
    rootCollection,
    canWrite,
  } = useKitchenConsole()
  const fetchKitchenId = computed(() =>
    rootCollection.value && kitchenId.value ? kitchenId.value : ''
  )
  const { miseTasks: liveMiseTasks, pending: livePending, collectionPath } =
    useKitchenMiseCollection(fetchKitchenId, {
      kitchenCollectionPath: rootCollection,
    })
  const page = useKitchenConsoleReadPage<KitchenMiseTask>({
    collectionName: 'mise',
    selectedKitchen,
    selectedMode,
    kitchenId,
    liveItems: liveMiseTasks,
    livePending,
    collectionPath,
  })
  const miseTasks = computed(() => page.collection.value.items)
  const pending = computed(() => page.collection.value.pending)
  const debug = computed(() => ({
    mode: selectedMode.value,
    kitchenId: kitchenId.value,
    rootCollection: rootCollection.value,
    collectionPath: collectionPath.value,
    count: miseTasks.value.length,
    pending: pending.value,
    canWrite: canWrite.value,
  }))

  return {
    ...page,
    selectedKitchen,
    selectedMode,
    kitchenId,
    collectionPath,
    rootCollection,
    canWrite,
    miseTasks,
    pending,
    debug,
  }
}
