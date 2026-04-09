import { computed, isRef, type Ref } from 'vue'
import type { Supplier } from '../../../../../models/supplier/Supplier.model'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'

type SupplierCollectionDoc = Partial<Supplier> & { id?: string }

type UseSupplierCollectionOptions = {
  collectionPath?: string | Ref<string>
  hydrate?: boolean
}

const DEFAULT_COLLECTION_PATH = 'suppliers'

export function useSupplierCollection(options: UseSupplierCollectionOptions = {}) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const pathRef = isRef(options.collectionPath)
    ? options.collectionPath
    : computed(() => String(options.collectionPath || DEFAULT_COLLECTION_PATH).trim())

  const source = computed(() => {
    const collectionPath = String(pathRef.value || '').trim() || DEFAULT_COLLECTION_PATH
    return firestoreFetchCollection<SupplierCollectionDoc>(collectionPath)
  })

  const suppliers = computed(() =>
    (source.value?.value ?? [])
      .map((supplier) => ({
        ...supplier,
        id: String(supplier?.id || '').trim(),
      }))
      .filter((supplier) => Boolean(supplier.id))
  )

  const count = computed(() => suppliers.value.length)
  const pending = computed(() => source.value?.value === undefined)

  return {
    suppliers,
    count,
    pending,
  }
}
