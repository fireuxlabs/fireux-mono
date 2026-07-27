import { computed } from 'vue'
import { useKitchenRecipeCollection } from '../../../../firestore/recipe/fetch/useKitchenRecipeCollection'
import { RecipeStorage, type Recipe } from '../../../../../../models/kitchen/recipe.model'
import { useKitchenConsole } from '../../core/useKitchenConsole'
import {
  findKitchenConsoleDemoScenario,
  useKitchenConsoleDemoData,
} from '../../core/useKitchenConsoleDemoData'
import { useKitchenConsoleReadPage } from '../Shared/useKitchenConsoleReadPage'
import { useKitchenConsoleDemoMenuService } from '../../core/useKitchenConsoleDemoMenuService'

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
  const readOnly = runtime.readOnly
  const canWrite = runtime.canWrite
  const demoData = useKitchenConsoleDemoData(
    runtime.isDemo
  )
  const demoScenario = computed(() => findKitchenConsoleDemoScenario(
    demoData.data.value,
    kitchenId.value
  ))
  const demoMenuService = useKitchenConsoleDemoMenuService(demoScenario)
  const fetchKitchenId = computed(() =>
    rootCollection.value && kitchenId.value ? kitchenId.value : ''
  )
  const {
    recipes: fetchedRecipes,
    pending: recipesPending,
    error: recipesError,
    outcome: recipesOutcome,
    collectionPath: fetchedCollectionPath,
  } =
    useKitchenRecipeCollection(fetchKitchenId, {
      kitchenCollectionPath: rootCollection,
      databaseId,
  })
  const consoleRecipes = computed(() =>
    runtime.isDemo.value
      ? demoScenario.value?.recipes ?? []
      : fetchedRecipes.value
  )
  const pending = computed(() =>
    runtime.isDemo.value
      ? demoData.pending.value
      : recipesPending.value
  )
  const error = computed(() =>
    runtime.isDemo.value
      ? demoData.error.value
      : recipesError.value
  )
  const outcome = computed(() =>
    runtime.isDemo.value
      ? demoData.outcome.value
      : recipesOutcome.value
  )
  const collectionPath = computed(() =>
    runtime.isDemo.value
      ? `demo/kitchens/${kitchenId.value}/recipes`
      : fetchedCollectionPath.value
  )
  const page = useKitchenConsoleReadPage<Recipe>({
    collectionName: RecipeStorage.collection,
    selectedKitchen,
    kitchenId,
    items: consoleRecipes,
    pending,
    collectionPath,
  })
  const dishes = computed(() => [])
  const count = computed(() => page.collection.value.count)
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
    recipes: consoleRecipes,
    dishes,
    count,
    pending,
    error,
    outcome,
    demoScenario,
    dishUsageByRecipeId,
    getDishUsageForRecipe,
    isRecipeInService: (recipeId: string) =>
      !runtime.isDemo.value
      || demoMenuService.isEntityInService('recipes', recipeId),
    debug,
  }
}
