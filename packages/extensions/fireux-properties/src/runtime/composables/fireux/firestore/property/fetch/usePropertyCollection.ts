// Concurrent edit — 2026-07-20 16:34 CEST — Console Spine pass: avoid eager full-root reads for targeted Property consoles.
// Concurrent edit — 2026-07-20 22:57 CEST — Both-Entity Authority — Property: expose only canonical, current-App pairs without private manual data.
// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: name App access-record joins and read shape directly.
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
  canonicalPropertyRoot,
  composePropertySurface,
  type PropertySurface,
} from '../utils/view/usePropertyInterface'

type PropertyCollectionDoc = Partial<Property> & {
  id?: string
}

type AppPropertyRecord = Partial<AppProperty> & {
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
export type PropertyCollectionShape = 'root' | 'root-with-app-support'
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
    return hasOperatorFilter.value ? 'root-with-app-support' : 'root'
  })
  const usesTargetedRootRead = computed(
    () => hasFilter.value || resolvedShape.value === 'root-with-app-support'
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
  const appSupportCollectionPath = computed(() =>
    resolvedAppId.value
      ? `${AppStorage.collection}/${resolvedAppId.value}/${PropertyStorage.appSupportCollection}`
      : ''
  )
  const targetedAppSupportCollectionPath = computed(() =>
    sourceMode.value === 'live' &&
    resolvedShape.value === 'root-with-app-support' &&
    hasFilter.value &&
    !hasOperatorFilter.value
      ? appSupportCollectionPath.value
      : ''
  )

  const rootSource = firestoreFetchCollection<PropertyCollectionDoc>(
    rootCollectionPath
  )
  const targetedAppSupportSource = firestoreLoadDocsByIds<AppPropertyRecord>({
    collectionPath: targetedAppSupportCollectionPath,
    ids: computed(() => [...filterIdSet.value]),
  })
  const appSupportOperatorQuery = computed<Query<AppPropertyRecord> | null>(() => {
    if (sourceMode.value !== 'live') return null
    if (!resolvedAppId.value) return null
    if (resolvedShape.value === 'root') return null
    if (!hasOperatorFilter.value || !filterOperatorId.value) return null

    const baseCollection = collection(
      db,
      AppStorage.collection,
      resolvedAppId.value,
      PropertyStorage.appSupportCollection
    )
    return fsq(
      baseCollection,
      where('operator_ids', 'array-contains', filterOperatorId.value)
    ) as Query<AppPropertyRecord>
  })
  const appSupportTeamQuery = computed<Query<AppPropertyRecord> | null>(() => {
    if (sourceMode.value !== 'live') return null
    if (!resolvedAppId.value) return null
    if (resolvedShape.value === 'root') return null
    if (!hasOperatorFilter.value || !filterOperatorId.value) return null

    return fsq(
      collection(
        db,
        AppStorage.collection,
        resolvedAppId.value,
        PropertyStorage.appSupportCollection
      ),
      where('team_ids', 'array-contains', filterOperatorId.value)
    ) as Query<AppPropertyRecord>
  })
  const appSupportOperatorSource = firestoreQuery<AppPropertyRecord>(
    appSupportOperatorQuery,
    undefined,
    appSupportCollectionPath
  )
  const appSupportTeamSource = firestoreQuery<AppPropertyRecord>(
    appSupportTeamQuery,
    undefined,
    appSupportCollectionPath
  )
  const appSupportSource = computed<AppPropertyRecord[]>(() => {
    const byId = new Map<string, AppPropertyRecord>()

    for (const appSupport of [
      ...(targetedAppSupportSource.docs.value ?? []),
      ...(appSupportOperatorSource.value ?? []),
      ...(appSupportTeamSource.value ?? []),
    ]) {
      const id = resolvePropertyId(appSupport)
      if (id) byId.set(id, { ...appSupport, id })
    }

    return [...byId.values()]
  })
  const allowedPropertyIds = computed(() =>
    (appSupportSource.value ?? [])
      .map((property) => resolvePropertyId(property))
      .filter(Boolean)
  )
  const targetedPropertyIds = computed(() => {
    const ids = hasOperatorFilter.value
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
    const appSupportById = new Map<string, AppPropertyRecord>()

    for (const property of liveRootDocs.docs.value ?? []) {
      const id = resolvePropertyId(property)
      if (!id) continue
      rootById.set(id, {
        ...property,
        id,
      })
    }

    for (const appSupport of appSupportSource.value ?? []) {
      const id = resolvePropertyId(appSupport)
      if (!id) continue
      appSupportById.set(id, {
        ...appSupport,
        id,
      })
    }

    const merged: PropertySurface[] = []
    const seen = new Set<string>()

    for (const property of liveRootDocs.docs.value ?? []) {
      const id = resolvePropertyId(property)
      if (!id || seen.has(id)) continue
      seen.add(id)

      const root = canonicalPropertyRoot({
        ...(rootById.get(id) ?? {}),
        id,
      } as Property)
      if (!root) continue

      const appSupport = appSupportById.get(id)
      if (
        resolvedShape.value === 'root-with-app-support' &&
        (
          !appSupport ||
          !resolvedAppId.value ||
          (root.app_scope_state !== 'parent_app' &&
            root.app_scope_state !== 'tenant_app') ||
          root.app_scope_app_id !== resolvedAppId.value
        )
      ) continue

      const surface = composePropertySurface({
        source: root,
        appSupport,
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
  const danglingAppSupportIds = computed(() => {
    if (
      sourceMode.value !== 'live' ||
      resolvedShape.value !== 'root-with-app-support'
    ) return []
    if (
      appSupportOperatorSource.pending.value ||
      appSupportTeamSource.pending.value ||
      targetedAppSupportSource.pending.value ||
      liveRootDocs.pending.value ||
      appSupportOperatorSource.error.value ||
      appSupportTeamSource.error.value ||
      targetedAppSupportSource.error.value ||
      liveRootDocs.error.value
    ) return []

    const rootIds = new Set(
      (liveRootDocs.docs.value ?? [])
        .map((property) => canonicalPropertyRoot(property as Property))
        .filter((property): property is Property => Boolean(property))
        .map((property) => resolvePropertyId(property))
        .filter(Boolean)
    )

    return appSupportSource.value
      .map((appSupport) => resolvePropertyId(appSupport))
      .filter(Boolean)
      .filter((id) => !rootIds.has(id))
  })
  const invalidRootIds = computed(() => {
    if (sourceMode.value !== 'live') return []
    const roots = usesTargetedRootRead.value
      ? liveRootDocs.docs.value ?? []
      : rootSource.value ?? []

    return roots.reduce<string[]>((ids, property) => {
      if (canonicalPropertyRoot(property as Property)) return ids
      ids.push(resolvePropertyId(property) || '(missing-id)')
      return ids
    }, [])
  })
  const requestedTargetPairError = computed<Error | undefined>(() => {
    if (
      sourceMode.value !== 'live' ||
      resolvedShape.value !== 'root-with-app-support' ||
      !hasFilter.value ||
      hasOperatorFilter.value ||
      !filterIdSet.value.size ||
      targetedAppSupportSource.pending.value ||
      liveRootDocs.pending.value ||
      targetedAppSupportSource.error.value ||
      liveRootDocs.error.value
    ) {
      return undefined
    }

    const rootIds = new Set(
      (liveRootDocs.docs.value ?? [])
        .map((property) => resolvePropertyId(property))
        .filter(Boolean)
    )
    const appSupportIds = new Set(
      (targetedAppSupportSource.docs.value ?? [])
        .map((appSupport) => resolvePropertyId(appSupport))
        .filter(Boolean)
    )
    const missingRoots = [...filterIdSet.value].filter((id) => !rootIds.has(id))
    const missingAppRecords = [...filterIdSet.value].filter(
      (id) => !appSupportIds.has(id)
    )
    if (!missingRoots.length && !missingAppRecords.length) return undefined

    return new Error(
      `[fireux-properties] incomplete requested Property target pair; missing root: ${missingRoots.join(', ') || 'none'}; missing AppProperty: ${missingAppRecords.join(', ') || 'none'}`
    )
  })
  const rootScopeError = computed<Error | undefined>(() => {
    if (
      sourceMode.value !== 'live' ||
      resolvedShape.value !== 'root-with-app-support' ||
      !resolvedAppId.value ||
      liveRootDocs.pending.value ||
      targetedAppSupportSource.pending.value ||
      appSupportOperatorSource.pending.value ||
      appSupportTeamSource.pending.value ||
      liveRootDocs.error.value ||
      targetedAppSupportSource.error.value ||
      appSupportOperatorSource.error.value ||
      appSupportTeamSource.error.value
    ) {
      return undefined
    }

    const appSupportIds = new Set(
      appSupportSource.value
        .map((appSupport) => resolvePropertyId(appSupport))
        .filter(Boolean)
    )
    const mismatches = (liveRootDocs.docs.value ?? [])
      .map((property) => canonicalPropertyRoot(property as Property))
      .filter((property): property is Property => Boolean(property))
      .filter((property) => appSupportIds.has(resolvePropertyId(property)))
      .filter(
        (property) =>
          (property.app_scope_state !== 'parent_app' &&
            property.app_scope_state !== 'tenant_app') ||
          property.app_scope_app_id !== resolvedAppId.value
      )
      .map((property) => property.id)
    if (!mismatches.length) return undefined

    return new Error(
      `[fireux-properties] Property root/AppProperty scope mismatch: ${mismatches.join(', ')}`
    )
  })
  const pending = computed(() => {
    if (sourceMode.value === 'demo') return false
    if (sourceMode.value === 'test') return rootSource.pending.value
    if (!usesTargetedRootRead.value) return rootSource.pending.value
    if (hasOperatorFilter.value && !filterOperatorId.value) return false
    return (
      liveRootDocs.pending.value ||
      (resolvedShape.value === 'root-with-app-support' && (
        hasOperatorFilter.value
          ? appSupportOperatorSource.pending.value || appSupportTeamSource.pending.value
          : targetedAppSupportSource.pending.value
      ))
    )
  })
  const error = computed<unknown | undefined>(() => {
    if (sourceMode.value === 'demo') return undefined
    if (sourceMode.value === 'test') return rootSource.error.value
    if (hasOperatorFilter.value && !filterOperatorId.value) return undefined
    if (!usesTargetedRootRead.value && rootSource.error.value) {
      return rootSource.error.value
    }
    const sourceError = (resolvedShape.value === 'root-with-app-support'
      ? hasOperatorFilter.value
        ? appSupportOperatorSource.error.value ?? appSupportTeamSource.error.value
        : targetedAppSupportSource.error.value
      : undefined) ?? (usesTargetedRootRead.value
      ? liveRootDocs.error.value
      : undefined)

    if (sourceError) return sourceError
    if (invalidRootIds.value.length) {
      return new Error(
        `[fireux-properties] invalid canonical Property root(s): ${invalidRootIds.value.join(', ')}`
      )
    }
    if (requestedTargetPairError.value) return requestedTargetPairError.value
    if (rootScopeError.value) return rootScopeError.value
    if (danglingAppSupportIds.value.length) {
      return new Error(
        `[fireux-properties] AppProperty support record(s) missing canonical Property root: ${danglingAppSupportIds.value.join(', ')}`
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
