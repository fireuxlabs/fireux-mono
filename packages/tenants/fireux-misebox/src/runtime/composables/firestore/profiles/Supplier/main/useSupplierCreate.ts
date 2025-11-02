import { useProfileEnsure } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileEnsure.ts'
import { supplierConfig } from '../../../../models/profiles/Supplier.model'

export function useSupplierCreate() {
  const { ensure } = useProfileEnsure(null, supplierConfig)

  async function createSupplier() {
    return ensure({ domain: 'supplier' })
  }

  return { createSupplier }
}
