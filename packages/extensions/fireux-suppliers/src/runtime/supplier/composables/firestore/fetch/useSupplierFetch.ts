// Concurrent edit — 2026-07-20 17:17 CEST — Demo Data Spine pass: keep demo payloads outside the Firestore document seam.
// Concurrent edit — 2026-07-20 22:40 CEST — Supplier/Portfolio Authority Hardening: pin single Supplier reads to allowlisted root and App paths.
import { computed, isRef, type Ref } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import {
  SupplierStorage,
  type Supplier,
} from '../../../models/Supplier.model.ts'
import { useSupplierInterface } from '../utils/view/useSupplierInterface'

type SupplierFetchDoc = Partial<Supplier> & {
  id?: string
  name?: string
  short_name?: string
}
export type SupplierFetchSource = 'live' | 'test' | 'demo'
export type SupplierFetchKey = 'id' | 'slug'

type UseSupplierFetchOptions = {
  source?: SupplierFetchSource | Ref<SupplierFetchSource>
  key?: SupplierFetchKey | Ref<SupplierFetchKey>
}

const DEFAULT_COLLECTION_PATH = SupplierStorage.collection
const UNSUPPORTED_TEST_SOURCE_MESSAGE =
  '[fireux-suppliers] Supplier Test source is unsupported: no canonical simulation producer exists.'
export function useSupplierFetch(
  id: string | Ref<string>,
  options: UseSupplierFetchOptions = {}
) {
  const { firestoreFetchDoc } = useFirestoreRead()
  const { surface } = useSupplierInterface()
  const idRef = isRef(id) ? id : computed(() => String(id || '').trim())
  const sourceRef = isRef(options.source)
    ? options.source
    : computed<SupplierFetchSource>(() =>
        typeof options.source === 'string' ? options.source : 'live'
      )
  const documentPath = computed(() =>
    sourceRef.value === 'live' ? DEFAULT_COLLECTION_PATH : ''
  )
  const documentId = computed(() =>
    sourceRef.value !== 'live' ? '' : String(idRef.value || '').trim()
  )
  const source = firestoreFetchDoc<SupplierFetchDoc>(documentPath, documentId)
  const supplier = computed<SupplierFetchDoc | null>(() => {
    const docId = String(idRef.value || '').trim()
    if (sourceRef.value !== 'live') return null

    const entry = source.value
    if (!docId || !entry) return null
    return surface({
      supplier: {
        ...entry,
        id: String(entry?.id || docId).trim(),
      },
    }) as SupplierFetchDoc | null
  })

  const pending = computed(() => {
    const docId = String(idRef.value || '').trim()
    if (sourceRef.value !== 'live') return false
    if (!docId) return false
    return source.pending.value
  })
  const error = computed(() => {
    if (sourceRef.value === 'demo') return undefined
    if (sourceRef.value === 'test') {
      return new Error(UNSUPPORTED_TEST_SOURCE_MESSAGE)
    }
    return source.error.value
  })

  return {
    supplier,
    pending,
    error,
  }
}
