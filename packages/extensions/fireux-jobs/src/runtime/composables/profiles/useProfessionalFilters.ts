import { ref, computed, type Ref } from 'vue'
import type { Professional } from '../../models/profiles/Professional.model'
import type { ProfessionalJobsProfileExtension } from '../../models/profileExtensions'

// Professional-specific filtering composable (boilerplate for now)
export function useProfessionalFilters(profiles: Ref<(Professional & ProfessionalJobsProfileExtension)[]>) {
  const filters = ref({
    search: '',
    // Add professional-specific filters later (salary, completed jobs, etc.)
  })

  const filteredProfiles = computed(() => {
    if (!profiles.value) return []

  return profiles.value.filter((professional: Professional & ProfessionalJobsProfileExtension) => {
      // Filter by search term
      if (filters.value.search) {
        const searchTerm = filters.value.search.toLowerCase()
        const professionalName = professional.professional_name?.toLowerCase() || ''

        if (!professionalName.includes(searchTerm)) {
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
