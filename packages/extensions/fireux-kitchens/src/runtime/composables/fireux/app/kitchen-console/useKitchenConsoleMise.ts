import { computed } from 'vue'
import { useKitchenMiseCollection } from '../../firestore/runtime-kitchen/mise/fetch/useKitchenMiseCollection'
import type { KitchenMiseTask } from '../../../../models/kitchen-mise.model'
import { useKitchenConsole } from './useKitchenConsole'
import { useKitchenConsoleReadPage } from './useKitchenConsoleReadPage'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useKitchenConsoleMise() {
  const { selectedKitchen, selectedMode } = useKitchenConsole()
  const kitchenId = computed(() => normalizeString(selectedKitchen.value?.id))
  const fetchKitchenId = computed(() => (selectedMode.value === 'demo' ? '' : kitchenId.value))
  const kitchenCollectionPath = computed(() =>
    selectedMode.value === 'test' ? 'test-kitchens' : undefined
  )
  const { miseTasks: liveMiseTasks, pending: livePending, collectionPath } =
    useKitchenMiseCollection(fetchKitchenId, { kitchenCollectionPath })
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

  return {
    ...page,
    selectedKitchen,
    selectedMode,
    kitchenId,
    collectionPath,
    miseTasks,
    pending,
  }
}
