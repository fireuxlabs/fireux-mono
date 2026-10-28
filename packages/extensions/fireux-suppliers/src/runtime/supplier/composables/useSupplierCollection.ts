import { useAsyncData } from 'nuxt/app'

import { computed } from 'vue'
import type { Company } from 'fireux-companies/runtime/place/models/company.model'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import { normalizePlace } from 'fireux-places/runtime/place/utils/normalize-place'
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
    computed(() =>
      [
        'supplier-collection',
        sourceMode.value,
        usesTargetedRootRead.value ? 'targeted' : 'directory',
      ].join('|')
    ),
    async (_nuxtApp, { signal }) => {
      const fetchRead = $fetch.create({ signal, cache: 'no-store' })
      return sourceMode.value === 'live' && !usesTargetedRootRead.value
        ? fetchRead<SupplierDirectoryResponse>('/api/suppliers')
        : Promise.resolve({ suppliers: [], companies: [], places: [] })
    },
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
  const parsedRoots = computed(() => {
    const items: SupplierCollectionDoc[] = []
    const invalidIds: string[] = []
    for (const supplier of source.value) {
      const id = resolveSupplierId(supplier)
      if (id && hasFilter.value && !filterIdSet.value.has(id)) continue
      const item = surface({ supplier: { ...supplier, id } })
      if (item) items.push(item)
      else invalidIds.push(id || '(missing-id)')
    }
    return { items, invalidIds }
  })
  const companyIds = computed(() =>
    sourceMode.value === 'live' &&
    usesTargetedRootRead.value &&
    !rootDocuments.pending.value &&
    !rootDocuments.error.value &&
    !parsedRoots.value.invalidIds.length
      ? [
          ...new Set(
            parsedRoots.value.items.map((supplier) => supplier.company_id)
          ),
        ]
      : []
  )
  // Bind linked identity once at setup; changing grants or Company links rebinds
  // the exact-document loader and disposes its previous Place subscriptions.
  const companyPlaceDocuments = firestoreLoadDocsByIds<Place>({
    collectionPath: computed(() => (companyIds.value.length ? 'places' : '')),
    ids: companyIds,
  })
  const parsedPlaces = computed(() => {
    const items: Place[] = []
    const invalidIds: string[] = []
    const requested = new Set(companyIds.value)
    for (const source of companyPlaceDocuments.docs.value ?? []) {
      if (!requested.has(source.id)) continue
      const place = normalizePlace(source.id, source)
      if (place) items.push(place)
      else invalidIds.push(source.id)
    }
    return { items, invalidIds }
  })
  const relatedPlaces = computed(() =>
    usesTargetedRootRead.value
      ? parsedPlaces.value.items
      : (directory.data.value?.places ?? [])
  )
  const placesById = computed(
    () =>
      new Map<string, Place>(
        relatedPlaces.value.map((place) => [place.id, place])
      )
  )
  const projected = computed<SupplierCollectionDoc[]>(() =>
    parsedRoots.value.items.map((supplier) => {
      const companyPlace = placesById.value.get(supplier.company_id)
      return {
        ...supplier,
        ...(companyPlace ? { company_place: companyPlace } : {}),
      }
    })
  )
  const pending = computed(() => {
    if (sourceMode.value !== 'live') return false
    return usesTargetedRootRead.value
      ? rootDocuments.pending.value || companyPlaceDocuments.pending.value
      : directory.pending.value
  })
  const error = computed<unknown | undefined>(() => {
    if (sourceMode.value === 'demo') return undefined
    if (sourceMode.value === 'test') {
      return new Error(UNSUPPORTED_TEST_SOURCE_MESSAGE)
    }
    const bindingError = usesTargetedRootRead.value
      ? rootDocuments.error.value || companyPlaceDocuments.error.value
      : directory.error.value
    if (bindingError) return bindingError
    if (parsedRoots.value.invalidIds.length)
      return new Error(
        `[fireux-suppliers] invalid Supplier root(s): ${parsedRoots.value.invalidIds.join(', ')}`
      )
    if (usesTargetedRootRead.value && parsedPlaces.value.invalidIds.length)
      return new Error(
        `[fireux-suppliers] invalid linked Place(s): ${parsedPlaces.value.invalidIds.join(', ')}`
      )
    return undefined
  })
  const { outcome } = useFirestoreCollectionState({
    active: computed(() => sourceMode.value === 'live'),
    count: computed(() => parsedRoots.value.items.length),
    error,
    pending,
  })
  const suppliers = computed(() =>
    outcome.value === 'ready' ? projected.value : []
  )
  const places = computed(() =>
    outcome.value === 'ready' ? relatedPlaces.value : []
  )
  const companies = computed(() =>
    outcome.value === 'ready' && !usesTargetedRootRead.value
      ? (directory.data.value?.companies ?? [])
      : []
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
