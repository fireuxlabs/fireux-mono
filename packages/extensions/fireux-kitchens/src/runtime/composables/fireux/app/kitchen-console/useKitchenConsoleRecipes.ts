import { computed } from 'vue'
import { useKitchenRecipeCollection } from '../../firestore/runtime-kitchen/recipe/fetch/useKitchenRecipeCollection'
import type { Recipe } from '../../../../models/recipe.model'
import { useKitchenConsole } from './useKitchenConsole'
import { useKitchenConsoleReadPage } from './useKitchenConsoleReadPage'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useKitchenConsoleRecipes() {
  const { selectedKitchen, selectedMode } = useKitchenConsole()
  const kitchenId = computed(() => normalizeString(selectedKitchen.value?.id))
  const fetchKitchenId = computed(() => (selectedMode.value === 'demo' ? '' : kitchenId.value))
  const kitchenCollectionPath = computed(() =>
    selectedMode.value === 'test' ? 'test-kitchens' : undefined
  )
  const { recipes: liveRecipes, count: liveCount, pending: livePending, collectionPath } =
    useKitchenRecipeCollection(fetchKitchenId, { kitchenCollectionPath })
  const page = useKitchenConsoleReadPage<Recipe>({
    collectionName: 'recipes',
    selectedKitchen,
    selectedMode,
    kitchenId,
    liveItems: liveRecipes,
    livePending,
    collectionPath,
  })
  const recipes = computed(() => page.collection.value.items)
  const count = computed(() => page.collection.value.count)
  const pending = computed(() => page.collection.value.pending)

  return {
    ...page,
    selectedKitchen,
    selectedMode,
    kitchenId,
    collectionPath,
    liveCount,
    recipes,
    count,
    pending,
  }
}
