import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { computed } from 'vue'
import type { Recipe } from '../../../utils/recipe.ts'
import { useKitchenWorkspaceRecipes } from './useKitchenWorkspaceRecipes'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useKitchenWorkspaceRecipe() {
  const {
    selectedKitchen,
    kitchenId,
    rootCollection,
    collectionPath,
    databaseId,
    readOnly,
    canWrite,
    recipes,
    pending,
    error,
    getDishUsageForRecipe,
  } = useKitchenWorkspaceRecipes()

  const recipeId = useRouteParam('recipeId')

  const recipe = computed<Recipe | null>(
    () =>
      recipes.value.find(
        (item) => normalizeString(item?.id) === recipeId.value
      ) ?? null
  )
  const dishUsage = computed(() => getDishUsageForRecipe(recipeId.value))

  const debug = computed(() => ({
    kitchenId: kitchenId.value,
    rootCollection: rootCollection.value,
    collectionPath: collectionPath.value,
    recipeId: recipeId.value,
    hasRecipe: Boolean(recipe.value),
    dishUsageCount: dishUsage.value.length,
    pending: pending.value,
    readOnly: readOnly.value,
    canWrite: canWrite.value,
  }))

  return {
    selectedKitchen,
    kitchenId,
    rootCollection,
    collectionPath,
    databaseId,
    readOnly,
    canWrite,
    recipes,
    pending,
    error,
    recipeId,
    recipe,
    dishUsage,
    debug,
  }
}
