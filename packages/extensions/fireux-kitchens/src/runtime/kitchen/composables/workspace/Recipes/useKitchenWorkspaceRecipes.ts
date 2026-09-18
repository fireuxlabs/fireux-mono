import { useKitchenAccess } from '../../useKitchenAccess'
import { computed } from 'vue'
import { useKitchenRecipeCollection } from '../../useKitchenRecipeCollection'
import { RecipeStorage, type Recipe } from '../../../utils/recipe.ts'
import { useKitchenWorkspace } from '../useKitchenWorkspace'
import { useKitchenWorkspaceReadPage } from '../useKitchenWorkspaceReadPage'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export type KitchenRecipeDishUsage = {
  recipeId: string
  dishId: string
  dishName: string
}

export function useKitchenWorkspaceRecipes() {
  const workspace = useKitchenWorkspace()
  const access = useKitchenAccess()
  const selectedKitchen = workspace.data
  const kitchenId = workspace.id
  const rootCollection = computed(() => 'kitchens')
  const databaseId = computed(() => readRuntimeFirestoreDatabaseId() || '')
  const canWrite = computed(
    () =>
      workspace.accountReady.value &&
      workspace.hasAccount.value &&
      Boolean(selectedKitchen.value) &&
      access.ids.value.includes(kitchenId.value)
  )
  const readOnly = computed(() => !canWrite.value)
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
