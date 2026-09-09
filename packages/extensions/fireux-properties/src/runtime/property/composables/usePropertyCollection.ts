import { computed } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { useTargetCollectionSelection } from '../../composables/fireux/firestore/collection-selection'
import {
  canonicalPropertyRoot,
  type PropertySurface,
} from './firestore/utils/view/usePropertyInterface'
import {
  DEFAULT_COLLECTION_PATH,
  UNSUPPORTED_TEST_SOURCE_MESSAGE,
  resolvePropertyId,
  type PropertyCollectionDoc,
  type UsePropertyCollectionOptions,
} from './firestore/fetch/property-collection-contract'

export type {
  PropertyCollectionFilter,
  PropertyCollectionFilterValue,
  PropertyCollectionShape,
  PropertyCollectionSource,
} from './firestore/fetch/property-collection-contract'

export function usePropertyCollection(
  options: UsePropertyCollectionOptions = {}
) {
  const { sourceMode, hasFilter, filterIdSet, hasOperatorFilter } =
    useTargetCollectionSelection(options, 'live')
  const { firestoreFetchCollection, firestoreLoadDocsByIds } =
    useFirestoreRead()
  const targeted = computed(() => hasFilter.value || hasOperatorFilter.value)
  const collection = firestoreFetchCollection<PropertyCollectionDoc>(
    computed(() =>
      sourceMode.value === 'live' && !targeted.value
        ? DEFAULT_COLLECTION_PATH
        : ''
    )
  )
  const documents = firestoreLoadDocsByIds<PropertyCollectionDoc>({
    collectionPath: computed(() =>
      sourceMode.value === 'live' && targeted.value
        ? DEFAULT_COLLECTION_PATH
        : ''
    ),
    ids: computed(() => [...filterIdSet.value]),
  })
  const source = computed(() =>
    targeted.value ? (documents.docs.value ?? []) : (collection.value ?? [])
  )
  const properties = computed<PropertySurface[]>(() =>
    source.value.reduce<PropertySurface[]>((items, property) => {
      const id = resolvePropertyId(property)
      if (!id || (hasFilter.value && !filterIdSet.value.has(id))) return items
      const canonical = canonicalPropertyRoot({ ...property, id } as never)
      if (canonical) items.push(canonical)
      return items
    }, [])
  )
  const count = computed(() => properties.value.length)
  const pending = computed(() =>
    sourceMode.value === 'live'
      ? targeted.value
        ? documents.pending.value
        : collection.pending.value
      : false
  )
  const error = computed<unknown | undefined>(() => {
    if (sourceMode.value === 'demo') return undefined
    if (sourceMode.value === 'test') {
      return new Error(UNSUPPORTED_TEST_SOURCE_MESSAGE)
    }
    return targeted.value ? documents.error.value : collection.error.value
  })
  const { outcome } = useFirestoreCollectionState({ count, error, pending })

  return {
    shape: computed(() => 'root' as const),
    properties,
    count,
    pending,
    error,
    outcome,
  }
}
