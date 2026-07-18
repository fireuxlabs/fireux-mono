import {
  collection,
  limit,
  query as fsq,
  where,
  type Query,
} from 'firebase/firestore'
import { computed, isRef, type Ref } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import {
  SupplierStorage,
  type Supplier,
} from '../../../../../models/supplier/Supplier.model'
import { getDemoSupplier } from '../../../demo/supplier/scenarios'
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
  collectionPath?: string | Ref<string>
  hydrate?: boolean
}

const DEFAULT_COLLECTION_PATH = SupplierStorage.rootCollection
const TEST_COLLECTION_PATH = 'test-suppliers'

export function useSupplierFetch(
  id: string | Ref<string>,
  options: UseSupplierFetchOptions = {}
) {
  const db = useFirestore()
  const { firestoreFetchDoc, firestoreQuery } = useFirestoreRead()
  const { surface } = useSupplierInterface()
  const idRef = isRef(id) ? id : computed(() => String(id || '').trim())
  const keyRef = isRef(options.key)
    ? options.key
    : computed<SupplierFetchKey>(() =>
        typeof options.key === 'string' ? options.key : 'id'
      )
  const sourceRef = isRef(options.source)
    ? options.source
    : computed<SupplierFetchSource>(() =>
        typeof options.source === 'string' ? options.source : 'live'
      )
  const pathRef = computed(() => {
    const configuredPath = isRef(options.collectionPath)
      ? options.collectionPath.value
      : options.collectionPath

    const explicitPath = String(configuredPath || '').trim()
    if (explicitPath) return explicitPath
    return sourceRef.value === 'test' ? TEST_COLLECTION_PATH : DEFAULT_COLLECTION_PATH
  })

  const documentPath = computed(() =>
    sourceRef.value === 'demo' || keyRef.value === 'slug'
      ? ''
      : String(pathRef.value || '').trim() || DEFAULT_COLLECTION_PATH
  )
  const documentId = computed(() =>
    sourceRef.value === 'demo' || keyRef.value === 'slug'
      ? ''
      : String(idRef.value || '').trim()
  )
  const source = firestoreFetchDoc<SupplierFetchDoc>(
    documentPath,
    documentId
  )
  const slugQuery = computed<Query<SupplierFetchDoc> | null>(() => {
    const slug = String(idRef.value || '').trim()
    if (sourceRef.value !== 'live' || keyRef.value !== 'slug' || !slug) return null

    return fsq(
      collection(db, DEFAULT_COLLECTION_PATH),
      where('slug', '==', slug),
      limit(1)
    ) as Query<SupplierFetchDoc>
  })
  const slugSource = firestoreQuery<SupplierFetchDoc>(
    slugQuery,
    undefined,
    DEFAULT_COLLECTION_PATH
  )

  const supplier = computed<SupplierFetchDoc | null>(() => {
    const docId = String(idRef.value || '').trim()
    if (sourceRef.value === 'demo') {
      const demoSupplier = getDemoSupplier(docId)
      if (!demoSupplier) return null

      return surface({
        supplier: {
          ...demoSupplier,
          id: String(demoSupplier.id || docId).trim(),
        },
      }) as SupplierFetchDoc | null
    }

    if (keyRef.value === 'slug') {
      const entry = slugSource.value?.[0]
      if (!docId || !entry || String(entry.slug || '').trim() !== docId) return null

      return surface({ supplier: entry }) as SupplierFetchDoc | null
    }

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
    if (sourceRef.value === 'demo') return false
    if (!docId) return false
    if (keyRef.value === 'slug') return slugSource.pending.value
    return source.pending.value
  })
  const error = computed(() => {
    if (sourceRef.value === 'demo') return undefined
    return keyRef.value === 'slug'
      ? slugSource.error.value
      : source.error.value
  })

  return {
    supplier,
    pending,
    error,
  }
}
