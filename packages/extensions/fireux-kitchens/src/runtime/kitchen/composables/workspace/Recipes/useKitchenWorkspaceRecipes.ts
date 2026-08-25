import { computed } from 'vue'
import { useKitchenRecipeCollection } from '../../firestore/recipe/fetch/useKitchenRecipeCollection'
import { RecipeStorage, type Recipe } from '../../../utils/recipe.ts'
import { useKitchenWorkspace } from '../core/useKitchenWorkspace'
import { useKitchenWorkspaceReadPage } from '../useKitchenWorkspaceReadPage'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export type KitchenRecipeDishUsage = {
  recipeId: string
  dishId: string
  dishName: string
}

export function useKitchenWorkspaceRecipes() {
  const { selection, runtime } = useKitchenWorkspace()
  const selectedKitchen = selection.kitchen
  const kitchenId = selection.kitchenId
  const rootCollection = runtime.rootCollection
  const databaseId = runtime.databaseId
  const readOnly = runtime.readOnly
  const canWrite = runtime.canWrite
  const fetchKitchenId = computed(() =>
    rootCollection.value && kitchenId.value ? kitchenId.value : ''
  )
  const {
    recipes: fetchedRecipes,
    pending: recipesPending,
    error: recipesError,
    outcome: recipesOutcome,
    collectionPath: fetchedCollectionPath,
  } = useKitchenRecipeCollection(fetchKitchenId, {
    kitchenCollectionPath: rootCollection,
    databaseId,
  })
  const workspaceRecipes = fetchedRecipes
  const pending = recipesPending
  const error = recipesError
  const outcome = recipesOutcome
  const collectionPath = fetchedCollectionPath
  const page = useKitchenWorkspaceReadPage<Recipe>({
    collectionName: RecipeStorage.collection,
    selectedKitchen,
    kitchenId,
    items: workspaceRecipes,
    pending,
    collectionPath,
  })
  const dishes = computed(() => [])
  const count = computed(() => page.collection.value.count)
  const dishUsageByRecipeId = computed<
    Record<string, KitchenRecipeDishUsage[]>
  >(() => ({}))
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
    outcome: outcome.value,
    hasError: Boolean(error.value),
    readOnly: readOnly.value,
    canWrite: canWrite.value,
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
    recipes: workspaceRecipes,
    dishes,
    count,
    pending,
    error,
    outcome,
    dishUsageByRecipeId,
    getDishUsageForRecipe,
    debug,
  }
}
