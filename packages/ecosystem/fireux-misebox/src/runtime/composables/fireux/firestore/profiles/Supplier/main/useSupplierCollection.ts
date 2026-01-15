import { useProfileCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileCollection'
import {
    supplierConfig,
    type SupplierCore,
} from '../../../../../../models/profiles/Supplier/Supplier.model'

export function useSupplierCollection() {
  const {
    globalProfiles,
    localProfiles,
    globalProfilesWithUser,
    localProfilesWithUser,
  } = useProfileCollection<SupplierCore>(supplierConfig)

  return {
    globalSuppliers: globalProfilesWithUser,
    localSuppliers: localProfilesWithUser,
    rawGlobalSuppliers: globalProfiles,
    rawLocalSuppliers: localProfiles,
  }
}
