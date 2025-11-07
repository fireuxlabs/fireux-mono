import { useProfileCollection } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileCollection.ts'
import {
  supplierConfig,
  type SupplierProfile,
} from '../../../../../models/profiles/Supplier.model.ts'

export function useSupplierCollection() {
  const { profiles, global, local } =
    useProfileCollection<SupplierProfile>(supplierConfig)

  return { suppliers: profiles, global, local }
}
