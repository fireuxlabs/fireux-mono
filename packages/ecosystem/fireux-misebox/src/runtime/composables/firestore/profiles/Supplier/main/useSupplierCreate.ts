import { useRouter } from 'vue-router'
import { useProfileEnsure } from 'fireux-core/runtime/composables/firestore/core/profile/core/useProfileEnsure.ts'
import { supplierConfig } from '../../../../../models/profiles/Supplier.model.ts'

export function useSupplierCreate() {
  const { ensure } = useProfileEnsure(supplierConfig)
  const router = useRouter()

  const createSupplier = async () => {
    const result = await ensure()
    if (import.meta.client) router.push('/dashboard/supplier-profile')
    return result
  }

  return { createSupplier }
}
