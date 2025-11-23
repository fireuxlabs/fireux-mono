import { useProfileCollection } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileCollection.ts'
import {
  supplierConfig,
  type SupplierProfile,
} from '../../../../../models/profiles/Supplier.model.ts'

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
