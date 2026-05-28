import { computed } from 'vue'
import { useRecipeCollection } from '../../../firestore/recipe/fetch/useRecipeCollection'
import { RecipeStorage, type Recipe } from '../../../../../models/recipe.model'
import { useKitchenConsole } from '../useKitchenConsole'
import { useKitchenConsoleReadPage } from './useKitchenConsoleReadPage'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export type KitchenRecipeDishUsage = {
  recipeId: string
  dishId: string
  dishName: string
}

export function useKitchenConsoleRecipes() {
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
  const { recipes: liveRecipes, count: liveCount, pending: livePending, collectionPath } =
    useRecipeCollection(fetchKitchenId, {
      kitchenCollectionPath: rootCollection,
      databaseId,
  })
  const page = useKitchenConsoleReadPage<Recipe>({
    collectionName: RecipeStorage.collection,
    selectedKitchen,
    selectedMode,
    kitchenId,
    liveItems: liveRecipes,
    livePending,
    collectionPath,
  })
  const recipes = computed(() => page.collection.value.items)
  const dishes = computed(() => [])
  const count = computed(() => page.collection.value.count)
  const pending = computed(() => page.collection.value.pending)
  const dishUsageByRecipeId = computed<Record<string, KitchenRecipeDishUsage[]>>(() => ({}))
  const getDishUsageForRecipe = (recipeId: string) =>
    dishUsageByRecipeId.value[normalizeString(recipeId)] || []
  const debug = computed(() => ({
    mode: selectedMode.value,
    kitchenId: kitchenId.value,
    rootCollection: rootCollection.value,
    databaseId: databaseId.value,
    collectionPath: collectionPath.value,
    count: count.value,
    dishesCount: dishes.value.length,
    dishUsageRecipeCount: Object.keys(dishUsageByRecipeId.value).length,
    dishUsageCount: Object.values(dishUsageByRecipeId.value).reduce(
      (total, entries) => total + entries.length,
      0
    ),
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
    databaseId,
    canWrite,
    liveCount,
    recipes,
    dishes,
    count,
    pending,
    dishUsageByRecipeId,
    getDishUsageForRecipe,
    debug,
  }
}
