// Concurrent edit — 2026-07-20 16:34 CEST — Console Spine pass: avoid eager full-root reads for targeted Property consoles.
// Concurrent edit — 2026-07-20 22:12 CEST — Both-Entity Authority — Property: require canonical roots and allowlist app-overlay deltas.
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
import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { targetHasConsoleAccess } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleAccess'
import type { ConsoleSource } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import {
  PropertyStorage,
  type AppProperty,
  type Property,
} from '../../../../../models/property.model'
import {
  composePropertySurface,
  type PropertySurface,
} from '../utils/view/usePropertyInterface'

type PropertyCollectionDoc = Partial<Property> & {
  id?: string
}

type AppPropertyOverlay = Partial<AppProperty> & {
  id?: string
}

const DEFAULT_COLLECTION_PATH = PropertyStorage.rootCollection
const TEST_COLLECTION_PATH = 'test-properties'

export type PropertyCollectionFilterValue = string | number | null | undefined
export type PropertyCollectionFilter = {
  ids?: PropertyCollectionFilterValue[] | null | undefined
  operatorId?: PropertyCollectionFilterValue
  teamId?: PropertyCollectionFilterValue
}
export type PropertyCollectionShape = 'root' | 'both'
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
  const resolvedFilter = computed<PropertyCollectionFilter | undefined>(() => {
    if (isRef(options.filter)) return options.filter.value ?? undefined
    return options.filter ?? undefined
  })
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
  const resolvedShape = computed<PropertyCollectionShape>(() => {
    const explicitShape = isRef(options.shape)
      ? options.shape.value
      : options.shape
    if (explicitShape) return explicitShape
    return hasOperatorFilter.value ? 'both' : 'root'
  })
  const usesTargetedRootRead = computed(
    () => hasFilter.value || resolvedShape.value === 'both'
  )
  const rootCollectionPath = computed(() => {
    if (sourceMode.value === 'demo') return ''
    if (sourceMode.value === 'test') return TEST_COLLECTION_PATH
    if (usesTargetedRootRead.value) return ''
    return DEFAULT_COLLECTION_PATH
  })
  const liveDocumentCollectionPath = computed(() =>
    sourceMode.value === 'live' && usesTargetedRootRead.value
      ? DEFAULT_COLLECTION_PATH
      : ''
  )
  const resolvedAppId = computed(() => normalizeString(appId))

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
  const targetedPropertyIds = computed(() => {
    const ids = resolvedShape.value === 'both'
      ? allowedPropertyIds.value
      : [...filterIdSet.value]

    return hasFilter.value
      ? ids.filter((id) => filterIdSet.value.has(id))
      : ids
  })
  const liveRootDocs = firestoreLoadDocsByIds<PropertyCollectionDoc>({
    collectionPath: liveDocumentCollectionPath,
    ids: targetedPropertyIds,
  })
  const targetItems = computed<PropertySurface[]>(() => {
    if (sourceMode.value === 'demo') return []
    if (sourceMode.value === 'test') {
      return (rootSource.value ?? []).reduce<PropertySurface[]>((items, property) => {
        const surface = composePropertySurface({ source: property as Property })
        if (surface) items.push(surface)
        return items
      }, [])
    }
    if (!usesTargetedRootRead.value) {
      return (rootSource.value ?? []).reduce<PropertySurface[]>((items, property) => {
        const surface = composePropertySurface({ source: property as Property })
        if (surface) items.push(surface)
        return items
      }, [])
    }

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

    const merged: PropertySurface[] = []
    const seen = new Set<string>()

    for (const property of liveRootDocs.docs.value ?? []) {
      const id = resolvePropertyId(property)
      if (!id || seen.has(id)) continue
      seen.add(id)

      const surface = composePropertySurface({
        source: rootById.get(id) as Property,
        overlay: overlayById.get(id),
      })
      if (surface) merged.push(surface)
    }

    return merged
  })

  const collectionItems = computed<PropertySurface[]>(() => targetItems.value)

  const properties = computed<PropertySurface[]>(() =>
    collectionItems.value.reduce<PropertySurface[]>((acc, property) => {
      const id = resolvePropertyId(property)
      if (!id) return acc
      if (hasFilter.value && !filterIdSet.value.has(id)) return acc
      if (hasOperatorFilter.value) {
        if (!filterOperatorId.value) return acc
        if (!targetHasConsoleAccess(property, filterOperatorId.value)) return acc
      }

      acc.push({ ...property, id })

      return acc
    }, [])
  )
  const count = computed(() => properties.value.length)
  const danglingOverlayIds = computed(() => {
    if (sourceMode.value !== 'live' || resolvedShape.value !== 'both') return []
    if (
      overlayOperatorSource.pending.value ||
      overlayTeamSource.pending.value ||
      liveRootDocs.pending.value ||
      overlayOperatorSource.error.value ||
      overlayTeamSource.error.value ||
      liveRootDocs.error.value
    ) return []

    const rootIds = new Set(
      (liveRootDocs.docs.value ?? [])
        .map((property) => resolvePropertyId(property))
        .filter(Boolean)
    )

    return targetedPropertyIds.value.filter((id) => !rootIds.has(id))
  })
  const pending = computed(() => {
    if (sourceMode.value === 'demo') return false
    if (sourceMode.value === 'test') return rootSource.pending.value
    if (!usesTargetedRootRead.value) return rootSource.pending.value
    if (hasOperatorFilter.value && !filterOperatorId.value) return false
    return (
      liveRootDocs.pending.value ||
      (resolvedShape.value === 'both' && (
        overlayOperatorSource.pending.value ||
        (hasOperatorFilter.value && overlayTeamSource.pending.value)
      ))
    )
  })
  const error = computed<unknown | undefined>(() => {
    if (sourceMode.value === 'demo') return undefined
    if (sourceMode.value === 'test') return rootSource.error.value
    if (!usesTargetedRootRead.value) return rootSource.error.value
    if (hasOperatorFilter.value && !filterOperatorId.value) return undefined
    const sourceError = (resolvedShape.value === 'both'
      ? overlayOperatorSource.error.value ?? overlayTeamSource.error.value
      : undefined) ?? liveRootDocs.error.value

    if (sourceError) return sourceError
    if (danglingOverlayIds.value.length) {
      return new Error(
        `[fireux-properties] AppProperty overlay(s) missing canonical Property root: ${danglingOverlayIds.value.join(', ')}`
      )
    }

    return undefined
  })
  const { outcome } = useFirestoreCollectionState({
    count,
    error,
    pending,
  })

  return {
    shape: resolvedShape,
    properties,
    count,
    pending,
    error,
    outcome,
  }
}
