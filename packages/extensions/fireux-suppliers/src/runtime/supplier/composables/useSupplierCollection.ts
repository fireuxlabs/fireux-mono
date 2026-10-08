import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import { computed } from 'vue'
import type { Company } from 'fireux-companies/runtime/place/models/company.model'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { useSupplierInterface } from './firestore/utils/view/useSupplierInterface'
import {
  DEFAULT_COLLECTION_PATH,
  UNSUPPORTED_TEST_SOURCE_MESSAGE,
  resolveSupplierId,
  type SupplierCollectionDoc,
  type SupplierRootDoc,
  type UseSupplierCollectionOptions,
} from './firestore/fetch/supplier-collection-contract'
import { useSupplierCollectionSelection } from './firestore/fetch/supplier-collection-selection'
import type { Supplier } from '../models/Supplier.model'

type SupplierDirectoryResponse = {
  suppliers: Supplier[]
  companies: Company[]
  places: Place[]
}

export type {
  SupplierCollectionFilter,
  SupplierCollectionFilterValue,
  SupplierCollectionSource,
} from './firestore/fetch/supplier-collection-contract'

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
  const directory = useLiveAsyncData<SupplierDirectoryResponse>(
    'supplier-collection',
    (liveFetch) =>
      sourceMode.value === 'live' && !usesTargetedRootRead.value
        ? liveFetch<SupplierDirectoryResponse>('/api/suppliers')
        : Promise.resolve({ suppliers: [], companies: [], places: [] }),
    { watch: [sourceMode, usesTargetedRootRead] }
  )
  const rootDocuments = firestoreLoadDocsByIds<SupplierRootDoc>({
    collectionPath: rootDocumentPath,
    ids: idList,
  })
  const source = computed(() =>
    usesTargetedRootRead.value
      ? (rootDocuments.docs.value ?? [])
      : (directory.data.value?.suppliers ?? [])
  )
  const places = computed(() => directory.data.value?.places ?? [])
  const companies = computed(() => directory.data.value?.companies ?? [])
  const placesById = computed(
    () =>
      new Map<string, Place>(
        places.value.map((place: Place) => [place.id, place])
      )
  )
  const parsed = computed(() => {
    const items: SupplierCollectionDoc[] = []
    const invalidIds: string[] = []
    for (const supplier of source.value) {
      const id = resolveSupplierId(supplier)
      if (id && hasFilter.value && !filterIdSet.value.has(id)) continue
      const companyId =
        typeof supplier.company_id === 'string' ? supplier.company_id : ''
      const item = surface({
        supplier: { ...supplier, id },
        companyPlace: placesById.value.get(companyId),
      })
      if (item) items.push(item)
      else invalidIds.push(id || '(missing-id)')
    }
    return { items, invalidIds }
  })
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
    const bindingError = usesTargetedRootRead.value
      ? rootDocuments.error.value
      : directory.error.value
    if (bindingError) return bindingError
    if (parsed.value.invalidIds.length)
      return new Error(
        `[fireux-suppliers] invalid Supplier root(s): ${parsed.value.invalidIds.join(', ')}`
      )
    return undefined
  })
  const { outcome } = useFirestoreCollectionState({
    active: computed(() => sourceMode.value === 'live'),
    count: computed(() => parsed.value.items.length),
    error,
    pending,
  })

  const suppliers = computed(() =>
    outcome.value === 'ready' ? parsed.value.items : []
  )
  const count = computed(() => suppliers.value.length)

  return {
    suppliers,
    roots: computed(() =>
      suppliers.value.map(
        ({ company_place: _place, ...root }) => root as Supplier
      )
    ),
    companies,
    places,
    count,
    pending,
    error,
    outcome,
  }
}
