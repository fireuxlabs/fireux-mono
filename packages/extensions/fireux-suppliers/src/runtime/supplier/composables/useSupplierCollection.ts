import { useAsyncData } from '#imports'
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
  const directory = useAsyncData<SupplierDirectoryResponse>(
    'supplier-collection',
    () =>
      sourceMode.value === 'live' && !usesTargetedRootRead.value
        ? $fetch<SupplierDirectoryResponse>('/api/suppliers')
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
    () => new Map<string, Place>(places.value.map((place: Place) => [place.id, place]))
  )
  const suppliers = computed<SupplierCollectionDoc[]>(() =>
    source.value.reduce<SupplierCollectionDoc[]>((items: SupplierCollectionDoc[], supplier: SupplierRootDoc) => {
      const id = resolveSupplierId(supplier)
      if (!id || (hasFilter.value && !filterIdSet.value.has(id))) return items
      const companyId = String(supplier.company_id ?? '').trim()
      const item = surface({
        supplier: { ...supplier, id },
        companyPlace: placesById.value.get(companyId),
      })
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

  return {
    suppliers,
    roots: computed(() => source.value as Supplier[]),
    companies,
    places,
    count,
    pending,
    error,
    outcome,
  }
}
