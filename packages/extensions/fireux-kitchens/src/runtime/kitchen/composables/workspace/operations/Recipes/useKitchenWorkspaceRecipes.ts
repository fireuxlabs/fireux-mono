import { computed } from 'vue'
import { useKitchenRecipeCollection } from '../../../firestore/recipe/fetch/useKitchenRecipeCollection'
import {
  normalizeRecipe,
  RecipeStorage,
  type Recipe,
} from '../../../../models/recipe.model.ts'
import { useKitchenWorkspace } from '../../core/useKitchenWorkspace'
import {
  findKitchenWorkspaceDemoScenario,
  useKitchenWorkspaceDemoData,
} from '../../core/useKitchenWorkspaceDemoData'
import { useKitchenWorkspaceReadPage } from '../Shared/useKitchenWorkspaceReadPage'
import { useKitchenWorkspaceDemoMenuService } from '../../core/useKitchenWorkspaceDemoMenuService'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export type KitchenRecipeDishUsage = {
  recipeId: string
  dishId: string
  dishName: string
}

export function useKitchenWorkspaceRecipes() {
  const {
    selection,
    runtime,
  } = useKitchenWorkspace()
  const selectedKitchen = selection.kitchen
  const kitchenId = selection.kitchenId
  const rootCollection = runtime.rootCollection
  const databaseId = runtime.databaseId
  const readOnly = runtime.readOnly
  const canWrite = runtime.canWrite
  const demoData = useKitchenWorkspaceDemoData(
    runtime.isDemo
  )
  const demoScenario = computed(() => findKitchenWorkspaceDemoScenario(
    demoData.data.value,
    kitchenId.value
  ))
  const demoRecipes = computed<Recipe[]>(() =>
    (demoScenario.value?.recipes ?? []).map(recipe =>
      normalizeRecipe({
        id: recipe.id,
        name: recipe.name,
        slug: recipe.id,
        description: recipe.method.join(' '),
        source_language: 'en',
        names: { en: recipe.name },
        descriptions: {
          en: recipe.method.join(' '),
        },
        kitchen_id: kitchenId.value,
      })
    )
  )
  const demoMenuService = useKitchenWorkspaceDemoMenuService(demoScenario)
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
  const workspaceRecipes = computed<Recipe[]>(() =>
    runtime.isDemo.value
      ? demoRecipes.value
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
  const page = useKitchenWorkspaceReadPage<Recipe>({
    collectionName: RecipeStorage.collection,
    selectedKitchen,
    kitchenId,
    items: workspaceRecipes,
    pending,
    collectionPath,
  })
  const dishes = computed(() =>
    runtime.isDemo.value ? demoScenario.value?.dishes ?? [] : []
  )
  const count = computed(() => page.collection.value.count)
  const dishUsageByRecipeId = computed<Record<string, KitchenRecipeDishUsage[]>>(
    () => {
      if (!runtime.isDemo.value || !demoScenario.value) return {}
      const dishById = new Map(
        demoScenario.value.dishes.map(dish => [normalizeString(dish.id), dish])
      )
      const usage: Record<string, KitchenRecipeDishUsage[]> = {}
      for (const spec of demoScenario.value.dishSpecs) {
        const dish = dishById.get(normalizeString(spec.dishId))
        if (!dish) continue
        for (const component of spec.components) {
          if (component.source !== 'recipe') continue
          const recipeId = normalizeString(component.recipeId)
          const entries = usage[recipeId] ?? []
          if (!entries.some(entry => entry.dishId === dish.id)) {
            entries.push({
              recipeId,
              dishId: dish.id,
              dishName: normalizeString(dish.name) || dish.id,
            })
          }
          usage[recipeId] = entries
        }
      }
      return usage
    }
  )
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
    demoScenario,
    dishUsageByRecipeId,
    getDishUsageForRecipe,
    isRecipeInService: (recipeId: string) =>
      !runtime.isDemo.value
      || demoMenuService.isEntityInService('recipes', recipeId),
    debug,
  }
}
