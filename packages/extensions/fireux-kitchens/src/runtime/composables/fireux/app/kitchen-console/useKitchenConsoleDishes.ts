import { computed } from 'vue'
import { useKitchenDishCollection } from '../../firestore/runtime-kitchen/dish/fetch/useKitchenDishCollection'
import type { Dish } from '../../../../models/dish.model'
import { useKitchenConsole } from './useKitchenConsole'
import { useKitchenConsoleReadPage } from './useKitchenConsoleReadPage'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useKitchenConsoleDishes() {
  const { selectedKitchen, selectedMode } = useKitchenConsole()
  const kitchenId = computed(() => normalizeString(selectedKitchen.value?.id))
  const fetchKitchenId = computed(() => (selectedMode.value === 'demo' ? '' : kitchenId.value))
  const kitchenCollectionPath = computed(() =>
    selectedMode.value === 'test' ? 'test-kitchens' : undefined
  )
  const { dishes: liveDishes, pending: livePending, collectionPath } =
    useKitchenDishCollection(fetchKitchenId, { kitchenCollectionPath })
  const page = useKitchenConsoleReadPage<Dish>({
    collectionName: 'dishes',
    selectedKitchen,
    selectedMode,
    kitchenId,
    liveItems: liveDishes,
    livePending,
    collectionPath,
  })
  const dishes = computed(() => page.collection.value.items)
  const pending = computed(() => page.collection.value.pending)

  return {
    ...page,
    selectedKitchen,
    selectedMode,
    kitchenId,
    collectionPath,
    dishes,
    pending,
  }
}
