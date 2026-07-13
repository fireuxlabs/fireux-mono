import {
  collection,
  query as fsq,
  where,
  type Query,
} from 'firebase/firestore'
import { computed, isRef, type Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { AppStorage } from 'fireux-core/runtime/models/core/app.model'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { targetHasConsoleAccess } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleAccess'
import type { ConsoleSource } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { PropertyStorage, type Property } from '../../../../../models/property.model'

type PropertyCollectionDoc = Partial<Property> & {
  id?: string
  operator_ids?: string[]
  team_ids?: string[]
}

type AppPropertyOverlay = PropertyCollectionDoc & {
  operator_ids?: string[]
  team_ids?: string[]
}

const DEFAULT_COLLECTION_PATH = PropertyStorage.rootCollection
const TEST_COLLECTION_PATH = 'test-properties'

export type PropertyCollectionFilterValue = string | number | null | undefined
export type PropertyCollectionFilter = {
  ids?: PropertyCollectionFilterValue[] | null | undefined
  operatorId?: PropertyCollectionFilterValue
  teamId?: PropertyCollectionFilterValue
}
export type PropertyCollectionShape = 'root' | 'overlay' | 'both'
export type PropertyCollectionSource = ConsoleSource

type UsePropertyCollectionOptions = {
  source?:
    | PropertyCollectionSource
    | Ref<PropertyCollectionSource | null | undefined>
    | null
  shape?:
    | PropertyCollectionShape
    | Ref<PropertyCollectionShape | null | undefined>
    | null
  filter?:
    | PropertyCollectionFilter
    | Ref<PropertyCollectionFilter | null | undefined>
    | null
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

function resolvePropertyId(property: Partial<PropertyCollectionDoc> | null | undefined) {
  return normalizeString(property?.id)
}

export function usePropertyCollection(
  options: UsePropertyCollectionOptions = {}
) {
  const db = useFirestore()
  const { appId } = useFireUXConfig()
  const { firestoreFetchCollection, firestoreLoadDocsByIds, firestoreQuery } =
    useFirestoreRead()
  const sourceMode = computed<PropertyCollectionSource>(() => {
    if (isRef(options.source)) return options.source.value ?? 'live'
    return options.source ?? 'live'
  })
  const rootCollectionPath = computed(() => {
    if (sourceMode.value === 'demo') return ''
    return sourceMode.value === 'test'
      ? TEST_COLLECTION_PATH
      : DEFAULT_COLLECTION_PATH
  })

  const resolvedFilter = computed<PropertyCollectionFilter | undefined>(() => {
    if (isRef(options.filter)) return options.filter.value ?? undefined
    return options.filter ?? undefined
  })
  const resolvedShape = computed<PropertyCollectionShape>(() => {
    const explicitShape = isRef(options.shape)
      ? options.shape.value
      : options.shape
    if (explicitShape) return explicitShape
    return hasOperatorFilter.value ? 'both' : 'root'
  })
  const resolvedAppId = computed(() => normalizeString(appId))
  const hasFilter = computed(() => Array.isArray(resolvedFilter.value?.ids))
  const filterOperatorId = computed(() =>
    normalizeString(resolvedFilter.value?.operatorId ?? resolvedFilter.value?.teamId)
  )
  const hasOperatorFilter = computed(() =>
    Object.prototype.hasOwnProperty.call(resolvedFilter.value ?? {}, 'operatorId') ||
    Object.prototype.hasOwnProperty.call(resolvedFilter.value ?? {}, 'teamId')
  )
  const filterIdSet = computed(
    () =>
      new Set(
        (resolvedFilter.value?.ids ?? [])
          .map((value) => normalizeString(value))
          .filter(Boolean)
      )
  )

  const rootSource = firestoreFetchCollection<PropertyCollectionDoc>(
    rootCollectionPath
  )
  const overlayOperatorQuery = computed<Query<AppPropertyOverlay> | null>(() => {
    if (sourceMode.value !== 'live') return null
    if (!resolvedAppId.value) return null
    if (resolvedShape.value === 'root') return null
    if (hasOperatorFilter.value && !filterOperatorId.value) return null

    const baseCollection = collection(
      db,
      AppStorage.collection,
      resolvedAppId.value,
      PropertyStorage.overlayCollection
    )
    return hasOperatorFilter.value
      ? fsq(
          baseCollection,
          where('operator_ids', 'array-contains', filterOperatorId.value)
        ) as Query<AppPropertyOverlay>
      : fsq(baseCollection) as Query<AppPropertyOverlay>
  })
  const overlayTeamQuery = computed<Query<AppPropertyOverlay> | null>(() => {
    if (sourceMode.value !== 'live') return null
    if (!resolvedAppId.value) return null
    if (resolvedShape.value === 'root') return null
    if (!hasOperatorFilter.value || !filterOperatorId.value) return null

    return fsq(
      collection(
        db,
        AppStorage.collection,
        resolvedAppId.value,
        PropertyStorage.overlayCollection
      ),
      where('team_ids', 'array-contains', filterOperatorId.value)
    ) as Query<AppPropertyOverlay>
  })
  const overlayOperatorSource = firestoreQuery<AppPropertyOverlay>(
    overlayOperatorQuery,
    undefined,
    computed(() =>
      resolvedAppId.value
        ? `${AppStorage.collection}/${resolvedAppId.value}/${PropertyStorage.overlayCollection}`
        : ''
    )
  )
  const overlayTeamSource = firestoreQuery<AppPropertyOverlay>(
    overlayTeamQuery,
    undefined,
    computed(() =>
      resolvedAppId.value
        ? `${AppStorage.collection}/${resolvedAppId.value}/${PropertyStorage.overlayCollection}`
        : ''
    )
  )
  const overlaySource = computed<AppPropertyOverlay[]>(() => {
    const byId = new Map<string, AppPropertyOverlay>()

    for (const overlay of [
      ...(overlayOperatorSource.value ?? []),
      ...(overlayTeamSource.value ?? []),
    ]) {
      const id = resolvePropertyId(overlay)
      if (id) byId.set(id, { ...overlay, id })
    }

    return [...byId.values()]
  })
  const allowedPropertyIds = computed(() =>
    (overlaySource.value ?? [])
      .map((property) => resolvePropertyId(property))
      .filter(Boolean)
  )
  const liveRootDocs = firestoreLoadDocsByIds<PropertyCollectionDoc>({
    collectionPath: computed(() =>
      sourceMode.value === 'live' ? DEFAULT_COLLECTION_PATH : ''
    ),
    ids: allowedPropertyIds,
  })
  const targetItems = computed<PropertyCollectionDoc[]>(() => {
    if (sourceMode.value === 'demo') return []
    if (sourceMode.value === 'test') return rootSource.value ?? []
    if (resolvedShape.value === 'root') return rootSource.value ?? []
    if (resolvedShape.value === 'overlay') return overlaySource.value ?? []
    if (!hasOperatorFilter.value) return rootSource.value ?? []

    const rootById = new Map<string, PropertyCollectionDoc>()
    const overlayById = new Map<string, AppPropertyOverlay>()

    for (const property of liveRootDocs.docs.value ?? []) {
      const id = resolvePropertyId(property)
      if (!id) continue
      rootById.set(id, {
        ...property,
        id,
      })
    }

    for (const overlay of overlaySource.value ?? []) {
      const id = resolvePropertyId(overlay)
      if (!id) continue
      overlayById.set(id, {
        ...overlay,
        id,
      })
    }

    const merged: PropertyCollectionDoc[] = []
    const seen = new Set<string>()

    for (const property of liveRootDocs.docs.value ?? []) {
      const id = resolvePropertyId(property)
      if (!id || seen.has(id)) continue
      seen.add(id)

      merged.push({
        ...(rootById.get(id) ?? {}),
        ...(overlayById.get(id) ?? {}),
        id,
      })
    }

    for (const overlay of overlaySource.value ?? []) {
      const id = resolvePropertyId(overlay)
      if (!id || seen.has(id)) continue
      seen.add(id)

      merged.push({
        ...(rootById.get(id) ?? {}),
        ...(overlayById.get(id) ?? {}),
        id,
      })
    }

    return merged
  })

  const collectionItems = computed<PropertyCollectionDoc[]>(() => targetItems.value)

  const properties = computed<Property[]>(() =>
    collectionItems.value.reduce<Property[]>((acc, property) => {
      const id = resolvePropertyId(property)
      if (!id) return acc
      if (hasFilter.value && !filterIdSet.value.has(id)) return acc
      if (hasOperatorFilter.value) {
        if (!filterOperatorId.value) return acc
        if (!targetHasConsoleAccess(property, filterOperatorId.value)) return acc
      }

      acc.push({
        ...(property as Property),
        id,
      })

      return acc
    }, [])
  )
  const count = computed(() => properties.value.length)
  const pending = computed(() => {
    if (sourceMode.value === 'demo') return false
    if (sourceMode.value === 'test') return rootSource.value === undefined
    if (resolvedShape.value === 'root') return rootSource.value === undefined
    if (resolvedShape.value === 'overlay') {
      return overlayOperatorSource.value === undefined
    }
    if (!hasOperatorFilter.value) return rootSource.value === undefined
    return (
      liveRootDocs.docs.value === undefined ||
      liveRootDocs.pending.value ||
      overlayOperatorSource.value === undefined ||
      overlayTeamSource.value === undefined
    )
  })

  return {
    shape: resolvedShape,
    properties,
    count,
    pending,
  }
}
