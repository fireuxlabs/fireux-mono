import { normalizeBusiness } from 'fireux-businesses/runtime/business/utils/normalize-business'
import { useAsyncData } from 'nuxt/app'

import { computed } from 'vue'
import type { Business } from 'fireux-businesses/runtime/business/models/business.model'
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
  businesses: Business[]
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
        : Promise.resolve({ suppliers: [], businesses: [], places: [] })
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
  const businessIds = computed(() =>
    sourceMode.value === 'live' &&
    usesTargetedRootRead.value &&
    !rootDocuments.pending.value &&
    !rootDocuments.error.value &&
    !parsedRoots.value.invalidIds.length
      ? [
          ...new Set(
            parsedRoots.value.items.map((supplier) => supplier.business_id)
          ),
        ]
      : []
  )
  const businessDocuments = firestoreLoadDocsByIds<Business>({
    collectionPath: computed(() => businessIds.value.length ? 'businesses' : ''),
    ids: businessIds,
  })
  const parsedBusinesses = computed(() => {
    const items: Business[] = []
    const invalidIds: string[] = []
    for (const source of businessDocuments.docs.value ?? []) {
      const { id, ...value } = source
      const business = normalizeBusiness(id, value)
      if (business) items.push(business)
      else invalidIds.push(id)
    }
    return { items, invalidIds }
  })
  const linkedBusinesses = computed(() => usesTargetedRootRead.value ? parsedBusinesses.value.items : directory.data.value?.businesses ?? [])
  const locationIds = computed(() => [...new Set(linkedBusinesses.value.flatMap((item) => item.place_ids.slice(0, 1)))])
  const businessPlaceDocuments = firestoreLoadDocsByIds<Place>({
    collectionPath: computed(() => (locationIds.value.length ? 'places' : '')),
    ids: locationIds,
  })
  const parsedPlaces = computed(() => {
    const items: Place[] = []
    const invalidIds: string[] = []
    const requested = new Set(locationIds.value)
    for (const source of businessPlaceDocuments.docs.value ?? []) {
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
      const businessPlace = placesById.value.get(linkedBusinesses.value.find((item) => item.id === supplier.business_id)?.place_ids[0] || '')
      return {
        ...supplier,
        ...(businessPlace ? { business_place: businessPlace } : {}),
      }
    })
  )
  const pending = computed(() => {
    if (sourceMode.value !== 'live') return false
    return usesTargetedRootRead.value
      ? rootDocuments.pending.value || businessDocuments.pending.value || businessPlaceDocuments.pending.value
      : directory.pending.value
  })
  const error = computed<unknown | undefined>(() => {
    if (sourceMode.value === 'demo') return undefined
    if (sourceMode.value === 'test') {
      return new Error(UNSUPPORTED_TEST_SOURCE_MESSAGE)
    }
    const bindingError = usesTargetedRootRead.value
      ? rootDocuments.error.value || businessDocuments.error.value || businessPlaceDocuments.error.value
      : directory.error.value
    if (bindingError) return bindingError
    if (usesTargetedRootRead.value && parsedBusinesses.value.invalidIds.length)
      return new Error('Linked Business source is invalid.')
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
  const businesses = computed(() =>
    outcome.value === 'ready'
      ? linkedBusinesses.value
      : []
  )
  const count = computed(() => suppliers.value.length)

  return {
    suppliers,
    roots: computed(() =>
      suppliers.value.map(
        ({ business_place: _place, ...root }) => root as Supplier
      )
    ),
    businesses,
    places,
    count,
    pending,
    error,
    outcome,
  }
}
