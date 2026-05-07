import { useRoute } from '#imports'
import { computed } from 'vue'
import type { Recipe } from '../../../../models/recipe.model'
import { useKitchenConsoleRecipes } from './useKitchenConsoleRecipes'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useKitchenConsoleRecipe() {
  const route = useRoute()
  const {
    selectedKitchen,
    selectedMode,
    kitchenId,
    rootCollection,
    collectionPath,
    databaseId,
    canWrite,
    recipes,
    pending,
    getDishUsageForRecipe,
  } = useKitchenConsoleRecipes()

  const recipeId = computed(() => {
    const raw = route.params.recipeId
    return normalizeString(Array.isArray(raw) ? raw[0] : raw)
  })

  const recipe = computed<Recipe | null>(
    () =>
      recipes.value.find((item) => normalizeString(item?.id) === recipeId.value) ??
      null
  )
  const dishUsage = computed(() => getDishUsageForRecipe(recipeId.value))

  const debug = computed(() => ({
    mode: selectedMode.value,
    kitchenId: kitchenId.value,
    rootCollection: rootCollection.value,
    collectionPath: collectionPath.value,
    recipeId: recipeId.value,
    hasRecipe: Boolean(recipe.value),
    dishUsageCount: dishUsage.value.length,
    pending: pending.value,
    canWrite: canWrite.value,
  }))

  return {
    selectedKitchen,
    selectedMode,
    kitchenId,
    rootCollection,
    collectionPath,
    databaseId,
    canWrite,
    recipes,
    pending,
    recipeId,
    recipe,
    dishUsage,
    debug,
  }
}
