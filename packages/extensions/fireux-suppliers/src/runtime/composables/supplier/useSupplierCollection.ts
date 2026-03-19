import { useProfileCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileCollection'
import type { SupplierCore } from '../../models/supplier/Supplier.model'
import { supplierConfig } from './supplierConfig'

export function useSupplierCollection() {
  const { globalProfiles } = useProfileCollection<SupplierCore>(supplierConfig)

  return {
    coreSuppliers: globalProfiles,
  }
}
