import { useProfile } from 'fireux-core/runtime/composables/firestore/core/profile/useProfile.ts'
import {
  supplierConfig,
  type SupplierCoreProfile,
} from '../../../../models/profiles/Supplier.model.ts'
import { useSupplierComputed } from './main/useSupplierComputed.ts'
import { useSupplierInterface } from './main/useSupplierInterface.ts'
import { useSupplierCreate } from './main/useSupplierCreate.ts'
import { useSupplierUpdate } from './main/useSupplierUpdate.ts'
import { useSupplierDelete } from './main/useSupplierDelete.ts'

export function useSupplier() {
  const { profile } = useProfile<SupplierCoreProfile>(supplierConfig)
  return {
    profile,
    ...useSupplierComputed(profile),
    ...useSupplierInterface(profile),
    ...useSupplierCreate(),
    ...useSupplierUpdate(profile),
    ...useSupplierDelete(profile),
  }
}
