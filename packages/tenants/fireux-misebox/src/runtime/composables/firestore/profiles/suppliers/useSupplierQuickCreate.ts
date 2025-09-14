import { ref } from 'vue'
import type { Supplier } from '../../../../models/profiles/Supplier.model'

export function useSupplierQuickCreate() {
  const creating = ref(false)
  const createError = ref<Error | null>(null)
  const createdSupplier = ref<Supplier | null>(null)

  const createQuickSupplier = async (business_name: string) => {
    if (!business_name) throw new Error('business_name required')
    creating.value = true
    createError.value = null
    try {
      // Simulate create and return minimal supplier object
      const supplier: Supplier = {
        id: 'supplier-mock-id',
        business_name,
        claimed: false,
        created_by: 'me',
      }
      createdSupplier.value = supplier
      return supplier
    } catch (e: any) {
      createError.value = e instanceof Error ? e : new Error(String(e))
      return null
    } finally {
      creating.value = false
    }
  }

  return { createQuickSupplier, creating, createError, createdSupplier }
}
