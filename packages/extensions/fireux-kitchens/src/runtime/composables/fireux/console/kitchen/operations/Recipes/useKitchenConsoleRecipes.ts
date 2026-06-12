import { computed } from 'vue'
import { useRecipeCollection } from '../../../../firestore/recipe/fetch/useRecipeCollection'
import { RecipeStorage, type Recipe } from '../../../../../../models/recipe.model'
import { useKitchenConsole } from '../../core/useKitchenConsole'
import { useKitchenConsoleReadPage } from '../Shared/useKitchenConsoleReadPage'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export type KitchenRecipeDishUsage = {
  recipeId: string
  dishId: string
  dishName: string
}

export function useKitchenConsoleRecipes() {
  const {
    selection,
    runtime,
  } = useKitchenConsole()
  const selectedKitchen = selection.kitchen
  const kitchenId = selection.kitchenId
  const rootCollection = runtime.rootCollection
  const databaseId = runtime.databaseId
  const canWrite = runtime.canWrite
  const fetchKitchenId = computed(() =>
    rootCollection.value && kitchenId.value ? kitchenId.value : ''
  )
  const { recipes, count: recipeCount, pending: recipesPending, collectionPath } =
    useRecipeCollection(fetchKitchenId, {
      kitchenCollectionPath: rootCollection,
      databaseId,
  })
  const page = useKitchenConsoleReadPage<Recipe>({
    collectionName: RecipeStorage.collection,
    selectedKitchen,
    kitchenId,
    items: recipes,
    pending: recipesPending,
    collectionPath,
  })
  const consoleRecipes = computed(() => page.collection.value.items)
  const dishes = computed(() => [])
  const count = computed(() => page.collection.value.count)
  const pending = computed(() => page.collection.value.pending)
  const dishUsageByRecipeId = computed<Record<string, KitchenRecipeDishUsage[]>>(() => ({}))
  const getDishUsageForRecipe = (recipeId: string) =>
    dishUsageByRecipeId.value[normalizeString(recipeId)] || []
  const debug = computed(() => ({
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
    kitchenId,
    collectionPath,
    rootCollection,
    databaseId,
    canWrite,
    liveCount: recipeCount,
    recipes: consoleRecipes,
    dishes,
    count,
    pending,
    dishUsageByRecipeId,
    getDishUsageForRecipe,
    debug,
  }
}
