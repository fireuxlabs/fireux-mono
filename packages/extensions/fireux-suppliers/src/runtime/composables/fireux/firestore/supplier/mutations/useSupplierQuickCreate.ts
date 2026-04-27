import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import { ref } from 'vue'
import type { Supplier } from '../../../../../models/supplier/Supplier.model'

export function useSupplierQuickCreate() {
  const creating = ref(false)
  const createError = ref<Error | null>(null)
  const createdSupplier = ref<Supplier | null>(null)

  const emptyTimestamp: FirebaseTimestamp = { seconds: 0, nanoseconds: 0 }

  const createQuickSupplier = async (name: string) => {
    if (!name) throw new Error('name required')
    creating.value = true
    createError.value = null
    try {
      // Simulate create and return minimal supplier object
      const supplier: Supplier = {
        id: 'supplier-mock-id',
        app_scope_state: 'root_only',
        app_scope_app_id: '',
        company_id: '',
        supplier_organization_name: name,
        supplier_headline: name,
        summary: '',
        supplier_bio: '',
        supplier_image: '',
        supplier_product_categories: [],
        supplier_delivery_areas: [],
        state: 'public',
        catalogue_state: 'public_only',
        linked_ingredient_ids: [],
        created: { at: emptyTimestamp, by: undefined, app_id: undefined },
        updated: { at: emptyTimestamp, by: undefined },
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
