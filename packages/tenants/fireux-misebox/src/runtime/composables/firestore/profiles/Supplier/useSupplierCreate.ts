import { useProfile } from 'fireux-core/runtime/composables/firestore/profiles/useProfile'
import { supplierConfig } from '../../../../models/profiles/Supplier.model'
import type { SupplierCoreProfile } from '../../../../models/profiles/Supplier.model'

export function useSupplierCreate() {
  const { ensure } = useProfile(supplierConfig) as any

  async function createSupplier(profile?: Partial<SupplierCoreProfile>) {
    // With unified models, pass the partial profile directly; the ensure helper
    // will handle timestamps and defaults.
    return ensure(profile ?? {})
  }

  return { createSupplier }
}
