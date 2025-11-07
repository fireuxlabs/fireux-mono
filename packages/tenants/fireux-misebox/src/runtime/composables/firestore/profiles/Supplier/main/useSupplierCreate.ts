import { ref, type Ref } from 'vue'
import { useProfileEnsure } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileEnsure.ts'
import { supplierConfig } from '../../../../../models/profiles/Supplier.model.ts'

type CreateSupplierHandler = ((
  patch?: Record<string, unknown>
) => Promise<unknown>) & {
  readonly state: Ref<boolean>
}

export function useSupplierCreate() {
  const { ensure } = useProfileEnsure(supplierConfig)
  const creating = ref(false)

  const createSupplier = (async (patch: Record<string, unknown> = {}) => {
    if (creating.value) return undefined
    creating.value = true
    try {
      return await ensure({ domain: 'supplier', ...patch })
    } finally {
      creating.value = false
    }
  }) as CreateSupplierHandler

  Object.defineProperty(createSupplier, 'state', {
    get: () => creating,
    enumerable: true,
  })

  return { createSupplier }
}
