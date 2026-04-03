import { collection } from 'firebase/firestore'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import { useCollection, useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { computed } from 'vue'
import type { Supplier } from '../../../../../models/supplier/Supplier.model'

type UseSupplierFetchOptions = {
  collectionPath?: string
}

const supplierCollection = 'suppliers'
// Hydrated supplier records for UI use.
export function useSupplierFetch(options: UseSupplierFetchOptions = {}) {
  const db = useFirestore()
  const collectionPath = String(options.collectionPath || supplierCollection).trim() || supplierCollection
  const coreSuppliersRef = useCollection<Supplier>(
    collection(db, collectionPath) as any,
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
