import { useProfileCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileCollection'
import {
    supplierConfig,
    type SupplierCore,
} from '../../../../../../models/profiles/Supplier/Supplier.model'

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
