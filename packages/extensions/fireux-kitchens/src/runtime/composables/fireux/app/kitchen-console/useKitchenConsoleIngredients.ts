import { computed } from 'vue'
import type { IngredientInterfaceItem } from '../../firestore/ingredient/utils/view/useIngredientInterface'
import { useKitchenIngredientFetch } from '../../firestore/runtime-kitchen/ingredients/fetch/useKitchenIngredientFetch'
import { useKitchenConsole } from './useKitchenConsole'
import { useKitchenConsoleReadPage } from './useKitchenConsoleReadPage'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useKitchenConsoleIngredients() {
  const { selectedKitchen, selectedMode } = useKitchenConsole()
  const kitchenId = computed(() => normalizeString(selectedKitchen.value?.id))
  const fetchKitchenId = computed(() => (selectedMode.value === 'demo' ? '' : kitchenId.value))
  const kitchenCollectionPath = computed(() =>
    selectedMode.value === 'test' ? 'test-kitchens' : undefined
  )
  const { ingredients: liveIngredients, pending: livePending, collectionPath } =
    useKitchenIngredientFetch(fetchKitchenId, { kitchenCollectionPath })
  const page = useKitchenConsoleReadPage<IngredientInterfaceItem>({
    collectionName: 'ingredients',
    selectedKitchen,
    selectedMode,
    kitchenId,
    liveItems: liveIngredients,
    livePending,
    collectionPath,
  })
  const ingredients = computed(() => page.collection.value.items)
  const count = computed(() => page.collection.value.count)
  const pending = computed(() => page.collection.value.pending)

  return {
    ...page,
    selectedKitchen,
    selectedMode,
    kitchenId,
    collectionPath,
    ingredients,
    count,
    pending,
  }
}
