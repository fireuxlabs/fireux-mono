import { ref, computed, type Ref } from 'vue'
import type { ChefCoreProfile as Chef } from '../../../../models/profiles/Chef.model'

// Chef-specific filtering composable
export function useChefFilters(profiles: Ref<Chef[]>) {
  const filters = ref({
    search: '',
  })

  const filteredProfiles = computed(() => {
    if (!profiles.value) return []

    return profiles.value.filter((chef: Chef) => {
      // Filter by search term
      if (filters.value.search) {
        const searchTerm = filters.value.search.toLowerCase()
        const chefName = chef.display_name?.toLowerCase() || ''
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
