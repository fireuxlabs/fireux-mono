import { ref, computed, type Ref } from 'vue'
import type { Ingredient } from '../../models/objects/Ingredient.model'

// Ingredient-specific filtering composable
export function useIngredientFilters(ingredients: Ref<Ingredient[]>) {
  const filters = ref({
    search: '',
    category: '',
    allergens: [] as string[],
    organic: false,
    seasonal: false,
    local: false,
  })

  const filteredIngredients = computed(() => {
    if (!ingredients.value) return []

    return ingredients.value.filter((ingredient: Ingredient) => {
      // Filter by search term
      if (filters.value.search) {
        const searchTerm = filters.value.search.toLowerCase()
        const matchesName = ingredient.name.toLowerCase().includes(searchTerm)
        const matchesDescription = ingredient.description
          ?.toLowerCase()
          .includes(searchTerm)
        const matchesTags = ingredient.tags?.some((tag) =>
          tag.toLowerCase().includes(searchTerm)
        )
        const matchesCategories = ingredient.categories?.some((cat) =>
          cat.toLowerCase().includes(searchTerm)
        )

        if (
          !matchesName &&
          !matchesDescription &&
          !matchesTags &&
          !matchesCategories
        ) {
          return false
        }
      }

      // Filter by category
      if (filters.value.category) {
        const hasCategory =
          ingredient.category === filters.value.category ||
          ingredient.categories?.includes(filters.value.category)
        if (!hasCategory) return false
      }

      // Filter by allergens (exclude ingredients with selected allergens)
      if (filters.value.allergens.length > 0) {
        const hasAllergen = ingredient.allergens?.some((allergen) =>
          filters.value.allergens.includes(allergen)
        )
        if (hasAllergen) return false
      }

      // Filter by organic
      if (filters.value.organic && !ingredient.organic) {
        return false
      }

      // Filter by seasonal
      if (filters.value.seasonal && !ingredient.seasonal) {
        return false
      }

      // Filter by local
      if (filters.value.local && !ingredient.local) {
        return false
      }

      return true
    })
  })

  // Available filter options derived from ingredients
  const availableCategories = computed(() => {
    const categories = new Set<string>()
    ingredients.value?.forEach((ingredient) => {
      if (ingredient.category) categories.add(ingredient.category)
      ingredient.categories?.forEach((cat) => categories.add(cat))
    })
    return Array.from(categories).sort()
  })

  const availableAllergens = computed(() => {
    const allergens = new Set<string>()
    ingredients.value?.forEach((ingredient) => {
      ingredient.allergens?.forEach((allergen) => allergens.add(allergen))
    })
    return Array.from(allergens).sort()
  })

  // Reset filters
  const resetFilters = () => {
    filters.value = {
      search: '',
      category: '',
      allergens: [],
      organic: false,
      seasonal: false,
      local: false,
    }
  }

  return {
    filters,
    filteredIngredients,
    availableCategories,
    availableAllergens,
    resetFilters,
  }
}
