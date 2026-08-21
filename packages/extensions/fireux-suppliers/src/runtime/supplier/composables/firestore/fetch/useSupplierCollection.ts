import { useAsyncData } from '#imports'
import { computed } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { useSupplierInterface } from '../utils/view/useSupplierInterface'
import {
  DEFAULT_COLLECTION_PATH,
  UNSUPPORTED_TEST_SOURCE_MESSAGE,
  resolveSupplierId,
  type SupplierCollectionDoc,
  type SupplierRootDoc,
  type UseSupplierCollectionOptions,
} from './supplier-collection-contract'
import { useSupplierCollectionSelection } from './supplier-collection-selection'

export type {
  SupplierCollectionFilter,
  SupplierCollectionFilterValue,
  SupplierCollectionSource,
} from './supplier-collection-contract'

export function useSupplierCollection(
  options: UseSupplierCollectionOptions = {}
) {
  const { firestoreLoadDocsByIds } = useFirestoreRead()
  const { surface } = useSupplierInterface()
  const { sourceMode, hasFilter, filterIdSet, usesTargetedRootRead } =
    useSupplierCollectionSelection(options)
  const idList = computed(() => [...filterIdSet.value])
  const rootDocumentPath = computed(() =>
    sourceMode.value === 'live' && usesTargetedRootRead.value
      ? DEFAULT_COLLECTION_PATH
      : ''
  )
  const directory = useAsyncData<SupplierRootDoc[]>(
    'supplier-directory',
    () =>
      sourceMode.value === 'live' && !usesTargetedRootRead.value
        ? $fetch<SupplierRootDoc[]>('/api/suppliers')
        : Promise.resolve([]),
    { watch: [sourceMode, usesTargetedRootRead] }
  )
  const rootDocuments = firestoreLoadDocsByIds<SupplierRootDoc>({
    collectionPath: rootDocumentPath,
    ids: idList,
  })
  const source = computed(() =>
    usesTargetedRootRead.value
      ? (rootDocuments.docs.value ?? [])
      : (directory.data.value ?? [])
  )
  const suppliers = computed<SupplierCollectionDoc[]>(() =>
    source.value.reduce<SupplierCollectionDoc[]>((items, supplier) => {
      const id = resolveSupplierId(supplier)
      if (!id || (hasFilter.value && !filterIdSet.value.has(id))) return items
      const item = surface({ supplier: { ...supplier, id } })
      if (item) items.push(item)
      return items
    }, [])
  )
  const count = computed(() => suppliers.value.length)
  const pending = computed(() => {
    if (sourceMode.value !== 'live') return false
    return usesTargetedRootRead.value
      ? rootDocuments.pending.value
      : directory.pending.value
  })
  const error = computed<unknown | undefined>(() => {
    if (sourceMode.value === 'demo') return undefined
    if (sourceMode.value === 'test') {
      return new Error(UNSUPPORTED_TEST_SOURCE_MESSAGE)
    }
    return usesTargetedRootRead.value
      ? rootDocuments.error.value
      : directory.error.value
  })
  const { outcome } = useFirestoreCollectionState({
    active: computed(() => sourceMode.value === 'live'),
    count,
    error,
    pending,
  })

  return { suppliers, count, pending, error, outcome }
}
