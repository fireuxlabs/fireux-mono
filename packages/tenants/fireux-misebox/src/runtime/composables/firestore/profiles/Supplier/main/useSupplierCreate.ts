import { useProfileEnsure } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileEnsure.ts'
import { supplierConfig } from '../../../../../models/profiles/Supplier.model.ts'

export function useSupplierCreate() {
  const { ensure } = useProfileEnsure(supplierConfig)

  async function createSupplier() {
    return ensure({ domain: 'supplier' })
  }

  return { createSupplier }
}
