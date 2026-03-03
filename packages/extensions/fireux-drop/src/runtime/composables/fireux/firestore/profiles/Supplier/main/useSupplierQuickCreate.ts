import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import { ref } from 'vue'
import type { SupplierCore } from '../../../../../../models/profiles/Supplier/Supplier.model'

export function useSupplierQuickCreate() {
  const creating = ref(false)
  const createError = ref<Error | null>(null)
  const createdSupplier = ref<SupplierCore | null>(null)

  const emptyTimestamp: FirebaseTimestamp = { seconds: 0, nanoseconds: 0 }

  const createQuickSupplier = async (name: string) => {
    if (!name) throw new Error('name required')
    creating.value = true
    createError.value = null
    try {
      // Simulate create and return minimal supplier object
      const supplier: SupplierCore = {
        id: 'supplier-mock-id',
        supplier_headline: name,
        supplier_bio: '',
        supplier_image: '',
        supplier_product_categories: [],
        supplier_delivery_areas: [],
        supplier_organization_name: name,
        title: name,
        subtitle: '',
        tags: [],
        tagline: '',
        summary: '',
        bio_long: '',
        specialties: [],
        categories: [],
        organization_name: name,
        business_type: '',
        locations: [],
        years_in_business: 0,
        products_offered: [],
        employee_count: 0,
        certifications: [],
        delivery_range: 0,
        created: { at: emptyTimestamp, by: undefined },
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
