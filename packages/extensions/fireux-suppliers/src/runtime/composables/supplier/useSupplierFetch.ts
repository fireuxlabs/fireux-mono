import { useProfileCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileCollection'
import { computed } from 'vue'
import type { SupplierCore } from '../../models/supplier/Supplier.model'
import { supplierConfig } from './supplierConfig'

// Hydrated supplier records for UI use.
export function useSupplierFetch() {
  const { globalProfilesWithUser } = useProfileCollection<SupplierCore>(supplierConfig)

  const coreSuppliersHydrated = globalProfilesWithUser

  const coreSuppliers = computed(() => coreSuppliersHydrated.value ?? [])

  const pending = computed(() => coreSuppliersHydrated.value === undefined)

  return {
    coreSuppliers,
    pending,
  }
}
