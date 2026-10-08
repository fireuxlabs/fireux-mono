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
  const parsed = computed(() => {
    const items: PropertySurface[] = []
    const invalidIds: string[] = []
    for (const property of source.value) {
      const id = resolvePropertyId(property)
      if (id && hasFilter.value && !filterIdSet.value.has(id)) continue
      const canonical = canonicalPropertyRoot({ ...property, id })
      if (canonical) items.push(canonical)
      else invalidIds.push(id || '(missing-id)')
    }
    return { items, invalidIds }
  })
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
    const bindingError = targeted.value
      ? documents.error.value
      : collection.error.value
    if (bindingError) return bindingError
    if (parsed.value.invalidIds.length) {
      return new Error(
        `[fireux-properties] invalid Property root(s): ${parsed.value.invalidIds.join(', ')}`
      )
    }
    return undefined
  })
  const { outcome } = useFirestoreCollectionState({
    count: computed(() => parsed.value.items.length),
    error,
    pending,
  })
  const properties = computed<PropertySurface[]>(() =>
    outcome.value === 'ready' ? parsed.value.items : []
  )
  const count = computed(() => properties.value.length)

  return {
    shape: computed(() => 'root' as const),
    properties,
    count,
    pending,
    error,
    outcome,
  }
}
