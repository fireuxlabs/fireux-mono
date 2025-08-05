import { ref, computed, type Ref } from 'vue'
import type { Supplier } from '../../models/profiles/Supplier.model'

// Supplier-specific filtering composable (boilerplate for now)
export function useSupplierFilters(profiles: Ref<Supplier[]>) {
  const filters = ref({
    search: '',
    // Add supplier-specific filters later
  })

  const filteredProfiles = computed(() => {
    if (!profiles.value) return []

    return profiles.value.filter((supplier: Supplier) => {
      // Filter by search term
      if (filters.value.search) {
        const searchTerm = filters.value.search.toLowerCase()
        const businessName = supplier.business_name?.toLowerCase() || ''

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
