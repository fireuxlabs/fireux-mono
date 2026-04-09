import { computed, isRef, type Ref } from 'vue'
import type { Supplier } from '../../../../../models/supplier/Supplier.model'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'

type SupplierFetchDoc = Partial<Supplier> & { id?: string }

type UseSupplierFetchOptions = {
  collectionPath?: string | Ref<string>
  hydrate?: boolean
}

const DEFAULT_COLLECTION_PATH = 'suppliers'

export function useSupplierFetch(
  id: string | Ref<string>,
  options: UseSupplierFetchOptions = {}
) {
  const { firestoreFetchDoc } = useFirestoreRead()
  const idRef = isRef(id) ? id : computed(() => String(id || '').trim())
  const pathRef = isRef(options.collectionPath)
    ? options.collectionPath
    : computed(() => String(options.collectionPath || DEFAULT_COLLECTION_PATH).trim())

  const source = computed(() => {
    const collectionPath = String(pathRef.value || '').trim() || DEFAULT_COLLECTION_PATH
    const docId = String(idRef.value || '').trim()
    if (!docId) return null
    return firestoreFetchDoc<SupplierFetchDoc>(collectionPath, docId)
  })

  const supplier = computed<SupplierFetchDoc | null>(() => {
    const docId = String(idRef.value || '').trim()
    const entry = source.value?.value
    if (!docId || !entry) return null
    return {
      ...entry,
      id: String(entry?.id || docId).trim(),
    }
  })

  const pending = computed(() => {
    const docId = String(idRef.value || '').trim()
    if (!docId) return false
    return source.value?.value === undefined
  })

  return {
    supplier,
    pending,
  }
}
