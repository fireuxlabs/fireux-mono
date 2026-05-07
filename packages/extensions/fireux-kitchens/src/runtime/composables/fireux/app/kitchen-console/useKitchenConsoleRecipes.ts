import { computed } from 'vue'
import { useKitchenDishCollection } from '../../firestore/runtime-kitchen/dish/fetch/useKitchenDishCollection'
import { useRecipeCollection } from '../../firestore/recipe/fetch/useRecipeCollection'
import type { Dish } from '../../../../models/dish.model'
import type { Recipe } from '../../../../models/recipe.model'
import { useKitchenConsole } from './useKitchenConsole'
import { useKitchenConsoleReadPage } from './useKitchenConsoleReadPage'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export type KitchenRecipeDishUsage = {
  recipeId: string
  dishId: string
  dishName: string
  dishImageUrl: string
  active: boolean
  isPrimary: boolean
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
  const {
    dishes: liveDishes,
    pending: liveDishesPending,
    collectionPath: dishesCollectionPath,
  } = useKitchenDishCollection(fetchKitchenId, {
    kitchenCollectionPath: rootCollection,
    databaseId,
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
  const dishesPage = useKitchenConsoleReadPage<Dish>({
    collectionName: 'dishes',
    selectedKitchen,
    selectedMode,
    kitchenId,
    liveItems: liveDishes,
    livePending: liveDishesPending,
    collectionPath: dishesCollectionPath,
  })
  const recipes = computed(() => page.collection.value.items)
  const dishes = computed(() => dishesPage.collection.value.items)
  const count = computed(() => page.collection.value.count)
  const pending = computed(() => page.collection.value.pending)
  const dishUsageByRecipeId = computed<Record<string, KitchenRecipeDishUsage[]>>(() => {
    const recipeIdsInScope = new Set(
      recipes.value
        .map((recipe) => normalizeString(recipe?.id))
        .filter(Boolean)
    )

    const usage = dishes.value.reduce<Record<string, KitchenRecipeDishUsage[]>>(
      (acc, dish) => {
        const dishId = normalizeString(dish?.id)
        if (!dishId) return acc

        const primaryRecipeId = normalizeString(dish?.primary_recipe_id)
        const recipeIds = new Set(
          [
            primaryRecipeId,
            ...(Array.isArray(dish?.recipe_ids) ? dish.recipe_ids : []),
          ]
            .map((recipeId) => normalizeString(recipeId))
            .filter((recipeId) => recipeIdsInScope.has(recipeId))
        )

        recipeIds.forEach((recipeId) => {
          const entry: KitchenRecipeDishUsage = {
            recipeId,
            dishId,
            dishName:
              normalizeString(dish?.name) ||
              normalizeString(dish?.short_name) ||
              dishId,
            dishImageUrl: normalizeString(dish?.image_url),
            active: dish?.active !== false,
            isPrimary: recipeId === primaryRecipeId,
          }

          acc[recipeId] = [...(acc[recipeId] || []), entry]
        })

        return acc
      },
      {}
    )

    Object.values(usage).forEach((entries) => {
      entries.sort((a, b) => {
        if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1
        return a.dishName.localeCompare(b.dishName)
      })
    })

    return usage
  })
  const getDishUsageForRecipe = (recipeId: string) =>
    dishUsageByRecipeId.value[normalizeString(recipeId)] || []
  const debug = computed(() => ({
    mode: selectedMode.value,
    kitchenId: kitchenId.value,
    rootCollection: rootCollection.value,
    databaseId: databaseId.value,
    collectionPath: collectionPath.value,
    dishesCollectionPath: dishesCollectionPath.value,
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
