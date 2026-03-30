import { collection } from 'firebase/firestore'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import { useCollection, useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { computed } from 'vue'
import type { Supplier } from '../../../../../models/supplier/Supplier.model'

const supplierCollection = 'suppliers'
// Hydrated supplier records for UI use.
export function useSupplierFetch() {
  const db = useFirestore()
  const coreSuppliersRef = useCollection<Supplier>(
    collection(db, supplierCollection) as any,
    { idField: 'id' } as any
  )

  const coreSuppliers = computed(() =>
    (coreSuppliersRef.value ?? [])
      .map((supplier) => ({
        ...supplier,
        id: String(supplier?.id || '').trim(),
      }))
      .filter((supplier) => Boolean(supplier.id))
  )

  const { byId: supplier } = useCollectionById(coreSuppliers)
  const pending = computed(() => coreSuppliersRef.value === undefined)

  return {
    coreSuppliers,
    supplier,
    pending,
  }
}
