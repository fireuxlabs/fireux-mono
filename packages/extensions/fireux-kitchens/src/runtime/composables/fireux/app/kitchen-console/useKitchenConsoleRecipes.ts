import { computed } from 'vue'
import { useKitchenRecipeCollection } from '../../firestore/runtime-kitchen/recipe/fetch/useKitchenRecipeCollection'
import type { Recipe } from '../../../../models/recipe.model'
import { useKitchenConsole } from './useKitchenConsole'
import { useKitchenConsoleReadPage } from './useKitchenConsoleReadPage'

export function useKitchenConsoleRecipes() {
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
  const { recipes: liveRecipes, count: liveCount, pending: livePending, collectionPath } =
    useKitchenRecipeCollection(fetchKitchenId, {
      kitchenCollectionPath: rootCollection,
    })
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
  const debug = computed(() => ({
    mode: selectedMode.value,
    kitchenId: kitchenId.value,
    rootCollection: rootCollection.value,
    collectionPath: collectionPath.value,
    count: count.value,
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
    liveCount,
    recipes,
    count,
    pending,
    debug,
  }
}
