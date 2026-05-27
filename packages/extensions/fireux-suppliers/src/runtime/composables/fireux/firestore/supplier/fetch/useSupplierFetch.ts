import { computed, isRef, shallowRef, watch, type Ref, type ShallowRef } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import {
  SupplierStorage,
  type Supplier,
} from '../../../../../models/supplier/Supplier.model'
import { getDemoSupplier } from '../../../app/utils/supplier-demo-scenarios'
import { useSupplierInterface } from '../utils/view/useSupplierInterface'

type SupplierFetchDoc = Partial<Supplier> & {
  id?: string
  name?: string
  short_name?: string
}
export type SupplierFetchSource = 'live' | 'test' | 'demo'

type UseSupplierFetchOptions = {
  source?: SupplierFetchSource | Ref<SupplierFetchSource>
  collectionPath?: string | Ref<string>
  hydrate?: boolean
}

const DEFAULT_COLLECTION_PATH = SupplierStorage.rootCollection
const TEST_COLLECTION_PATH = 'test-suppliers'

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
  const pathRef = computed(() => {
    const configuredPath = isRef(options.collectionPath)
      ? options.collectionPath.value
      : options.collectionPath

    const explicitPath = String(configuredPath || '').trim()
    if (explicitPath) return explicitPath
    return sourceRef.value === 'test' ? TEST_COLLECTION_PATH : DEFAULT_COLLECTION_PATH
  })

  const source = shallowRef(null) as ShallowRef<Ref<SupplierFetchDoc | undefined> | null>
  watch(
    [sourceRef, pathRef, idRef],
    ([nextSource, nextPath, nextId]) => {
      const collectionPath = String(nextPath || '').trim() || DEFAULT_COLLECTION_PATH
      const docId = String(nextId || '').trim()

      source.value =
        nextSource === 'demo' || !docId
          ? null
          : firestoreFetchDoc<SupplierFetchDoc>(collectionPath, docId)
    },
    { immediate: true }
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

    const entry = source.value?.value
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
    return source.value?.value === undefined
  })

  return {
    supplier,
    pending,
  }
}
