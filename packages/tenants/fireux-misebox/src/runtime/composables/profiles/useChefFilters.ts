import { ref, computed, type Ref } from 'vue'
import type { Chef } from '../../models/profiles/Chef.model'

// Chef-specific filtering composable
export function useChefFilters(profiles: Ref<Chef[]>) {
  const filters = ref({
    recipes: {
      min: 0,
      max: 100,
    },
    search: '',
  })

  const filteredProfiles = computed(() => {
    if (!profiles.value) return []

    return profiles.value.filter((chef: Chef) => {
      // Filter by number of recipes
      if (
        filters.value.recipes.min &&
        (chef.total_recipes || 0) < filters.value.recipes.min
      ) {
        return false
      }
      if (
        filters.value.recipes.max &&
        (chef.total_recipes || 0) > filters.value.recipes.max
      ) {
        return false
      }

      // Filter by search term
      if (filters.value.search) {
        const searchTerm = filters.value.search.toLowerCase()
        const chefName = chef.chef_name?.toLowerCase() || ''
        const specialties = chef.specialties?.join(' ').toLowerCase() || ''

        if (
          !chefName.includes(searchTerm) &&
          !specialties.includes(searchTerm)
        ) {
          return false
        }
      }

      return true
    })
  })

  const applyFilter = (filterType: string, value: any) => {
    if (filterType in filters.value) {
      ;(filters.value as any)[filterType] = value
    }
  }

  return {
    filteredProfiles,
    filters,
    applyFilter,
  }
}
