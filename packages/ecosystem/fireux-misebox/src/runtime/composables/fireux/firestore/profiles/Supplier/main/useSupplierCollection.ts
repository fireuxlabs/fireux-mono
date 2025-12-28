import { useProfileCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileCollection.ts'
import {
  supplierConfig,
  type SupplierProfile,
} from '../../../../../../models/profiles/Supplier/Supplier.model.ts'

export function useSupplierCollection() {
  const {
    globalProfiles,
    localProfiles,
    globalProfilesWithUser,
    localProfilesWithUser,
  } = useProfileCollection<SupplierProfile>(supplierConfig)

  return {
    globalSuppliers: globalProfilesWithUser,
    localSuppliers: localProfilesWithUser,
    rawGlobalSuppliers: globalProfiles,
    rawLocalSuppliers: localProfiles,
  }
}
