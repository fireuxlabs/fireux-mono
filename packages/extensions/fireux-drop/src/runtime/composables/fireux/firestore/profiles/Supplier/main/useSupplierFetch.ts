import { useProfileCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileCollection'
import { computed } from 'vue'
import { supplierConfig } from '../config/supplierConfig'
import type { SupplierCore } from '../../../../../../models/profiles/Supplier/Supplier.model'

// Hydrated (user-attached) supplier profiles for UI use.
export function useSupplierFetch() {
  const { globalProfilesWithUser, localProfilesWithUser } =
    useProfileCollection<SupplierCore>(supplierConfig)

  const coreSuppliersHydrated = globalProfilesWithUser
  const appSuppliersHydrated = localProfilesWithUser

  const coreSuppliers = computed(() => coreSuppliersHydrated.value ?? [])
  const appSuppliers = computed(() => appSuppliersHydrated?.value ?? [])

  const pending = computed(() =>
    coreSuppliersHydrated.value === undefined ||
    appSuppliersHydrated?.value === undefined
  )

  return {
    coreSuppliers,
    appSuppliers,
    pending,
  }
}
