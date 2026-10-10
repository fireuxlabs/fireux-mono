import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { computed } from 'vue'
import type { Recipe } from '../../../utils/recipe.ts'
import { useKitchenWorkspaceRecipes } from './useKitchenWorkspaceRecipes'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useKitchenWorkspaceRecipe() {
  const {
    selectedKitchen,
    kitchenId,
    storageKitchenId,
    rootCollection,
    collectionPath,
    databaseId,
    readOnly,
    canWrite,
    recipes,
    outcome: collectionOutcome,
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
  const outcome = computed(() => {
    if (!storageKitchenId.value) return collectionOutcome.value
    if (collectionOutcome.value === 'empty') return 'missing'
    if (collectionOutcome.value !== 'ready') return collectionOutcome.value
    return recipe.value ? 'ready' : 'missing'
  })
  const pending = computed(() => outcome.value === 'pending')
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
    storageKitchenId,
    rootCollection,
    collectionPath,
    databaseId,
    readOnly,
    canWrite,
    recipes,
    pending,
    outcome,
    error,
    recipeId,
    recipe,
    dishUsage,
    debug,
  }
}
