import { useProfile } from 'fireux-core/runtime/composables/firestore/core/profiles/useProfile.ts'
import { supplierConfig } from '../../../../models/profiles/Supplier.model'
import type { SupplierCoreProfile } from '../../../../models/profiles/Supplier.model'

export function useSupplierCreate() {
  const { ensure } = useProfile(supplierConfig) as any

  async function createSupplier(profile?: Partial<SupplierCoreProfile>) {
    return ensure(profile ?? {})
  }

  return { createSupplier }
}
