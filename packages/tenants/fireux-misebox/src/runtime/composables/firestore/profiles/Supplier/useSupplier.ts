import { useProfile } from 'fireux-core/runtime/composables/firestore/core/profile/useProfile.ts'
import {
  supplierConfig,
  type SupplierCoreProfile,
} from '../../../../models/profiles/Supplier.model.ts'

export function useSupplier() {
  const { profile } = useProfile<SupplierCoreProfile>(supplierConfig)
  return { profile }
}
