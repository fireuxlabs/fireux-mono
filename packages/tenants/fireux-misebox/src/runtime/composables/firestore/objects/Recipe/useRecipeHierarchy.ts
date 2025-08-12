import { useRecipes } from './useRecipes'
import { useCurrentUser } from 'vuefire'
import { computed } from 'vue'

/**
 * Composable for managing hierarchical recipes
 * Handles both global MiseBox recipes and app-specific recipes (like Niederhorn)
 */
export async function useRecipeHierarchy(appId?: string) {
  const {
    data: recipes,
    loading,
    error,
    create,
    update,
    remove,
  } = await useRecipes()
  const user = useCurrentUser()

  // Filter recipes based on scope
  const globalRecipes = computed(() => {
    return recipes.value?.filter((recipe) => recipe.source === 'global') || []
  })

  const appSpecificRecipes = computed(() => {
    if (!appId) return []
    return (
      recipes.value?.filter(
        (recipe) =>
          recipe.source === 'app_specific' && recipe.parent_app_id === appId
      ) || []
    )
  })

  const allAvailableRecipes = computed(() => {
    // For search: combine global recipes + app-specific recipes
    return [...globalRecipes.value, ...appSpecificRecipes.value]
  })

  const myRecipes = computed(() => {
    if (!user.value) return []
    return (
      recipes.value?.filter((recipe) => recipe.creator_id === user.value.uid) ||
      []
    )
  })

  // Create global recipe (for MiseBox)
  const createGlobalRecipe = async (recipeData: any) => {
    return await create({
      ...recipeData,
      source: 'global',
      parent_app_id: undefined,
    })
  }

  // Create app-specific recipe (for apps like Niederhorn)
  const createAppRecipe = async (recipeData: any, targetAppId: string) => {
    return await create({
      ...recipeData,
      source: 'app_specific',
      parent_app_id: targetAppId,
    })
  }

  // Search across available recipes
  const searchRecipes = (query: string) => {
    const searchTerm = query.toLowerCase()
    return allAvailableRecipes.value.filter(
      (recipe) =>
        recipe.title.toLowerCase().includes(searchTerm) ||
        recipe.description.toLowerCase().includes(searchTerm) ||
        recipe.tags.some((tag) => tag.toLowerCase().includes(searchTerm)) ||
        recipe.cuisine_type.some((cuisine) =>
          cuisine.toLowerCase().includes(searchTerm)
        )
    )
  }

  // Filter by criteria
  const filterRecipes = (filters: {
    cuisine?: string[]
    difficulty?: string
    maxTime?: number
    dietaryRestrictions?: string[]
  }) => {
    return allAvailableRecipes.value.filter((recipe) => {
      if (
        filters.cuisine?.length &&
        !filters.cuisine.some((c) => recipe.cuisine_type.includes(c))
      ) {
        return false
      }
      if (
        filters.difficulty &&
        recipe.difficulty_level !== filters.difficulty
      ) {
        return false
      }
      if (filters.maxTime && recipe.total_time_minutes > filters.maxTime) {
        return false
      }
      if (
        filters.dietaryRestrictions?.length &&
        !filters.dietaryRestrictions.every((dr) =>
          recipe.dietary_restrictions.includes(dr)
        )
      ) {
        return false
      }
      return true
    })
  }

  return {
    // Data
    recipes,
    globalRecipes,
    appSpecificRecipes,
    allAvailableRecipes,
    myRecipes,
    loading,
    error,

    // CRUD operations
    create,
    update,
    remove,
    createGlobalRecipe,
    createAppRecipe,

    // Search & Filter
    searchRecipes,
    filterRecipes,
  }
}
