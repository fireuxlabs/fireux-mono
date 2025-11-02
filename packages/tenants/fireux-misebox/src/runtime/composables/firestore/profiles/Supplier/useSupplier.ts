import { useProfile } from 'fireux-core/runtime/composables/firestore/core/profile/useProfile.ts'
import {
  supplierConfig,
  type SupplierCoreProfile,
  type SupplierAppProfile,
} from '../../../../models/profiles/Supplier.model'

export function useSupplier() {
  const { profile } = useProfile<SupplierCoreProfile, SupplierAppProfile>(
    supplierConfig
  )
  return { profile }
}
