import { ref, computed, type Ref } from 'vue'
import type { Employer } from '../../models/profiles/Employer.model'

// Employer-specific filtering composable (boilerplate for now)
export function useEmployerFilters(profiles: Ref<Employer[]>) {
  const filters = ref({
    search: '',
    // Add employer-specific filters later
  })

  const filteredProfiles = computed(() => {
    if (!profiles.value) return []

    return profiles.value.filter((employer: Employer) => {
      // Filter by search term
      if (filters.value.search) {
        const searchTerm = filters.value.search.toLowerCase()
        const businessName = employer.company_name?.toLowerCase() || ''

        if (!businessName.includes(searchTerm)) {
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
