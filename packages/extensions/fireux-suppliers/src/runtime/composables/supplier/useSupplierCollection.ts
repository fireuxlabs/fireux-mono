import { useProfileCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileCollection'
import { supplierConfig } from './supplierConfig'
import type { SupplierCore } from 'fireux-suppliers/runtime/models/supplier/Supplier.model'

export function useSupplierCollection() {
  const {
    globalProfiles,
    localProfiles,
  } = useProfileCollection<SupplierCore>(supplierConfig)

  return {
    coreSuppliers: globalProfiles,
    appSuppliers: localProfiles,
  }
}
