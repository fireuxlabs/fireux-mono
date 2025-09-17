import { useProfileCreate } from 'fireux-core/runtime/composables/firestore/profiles/useProfileCreate'
import {
  supplierConfig,
  SupplierMapper,
} from '../../../../models/profiles/Supplier.model'
import type { SupplierCoreProfile } from '../../../../models/profiles/Supplier.model'

export function useSupplierCreate() {
  const { ensure } = useProfileCreate(supplierConfig)

  async function createSupplier(profile?: Partial<SupplierCoreProfile>) {
    const fsPayload = SupplierMapper.toFs(profile ?? {}, { dropNullish: true })
    return ensure(fsPayload)
  }

  return { createSupplier }
}
