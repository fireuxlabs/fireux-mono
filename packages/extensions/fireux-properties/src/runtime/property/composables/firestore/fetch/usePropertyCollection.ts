import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import {
  readFireuxEntityManagement,
  resolveFireuxEntityManagementAppId,
} from 'fireux-core/runtime/utils/entity-management'
import { readWorkspaceTargetAuthority, targetHasWorkspaceAccess } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceAccess'
import { PropertyStorage, type Property } from '../../../models/property.model.ts'
import {
  canonicalPropertyRoot,
  type PropertySurface,
} from '../utils/view/usePropertyInterface'
import { composePropertyCollectionTargets } from './property-collection-projection'
import { useAppSupportAccessQueries } from '../../../../composables/fireux/firestore/app-support-collection'
import { useTargetCollectionSelection } from '../../../../composables/fireux/firestore/collection-selection'
import {
  DEFAULT_COLLECTION_PATH,
  UNSUPPORTED_TEST_SOURCE_MESSAGE,
  normalizeString,
  resolvePropertyCollectionShape,
  resolvePropertyId,
  type AppPropertyRecord,
  type PropertyCollectionDoc,
  type PropertyCollectionShape,
  type UsePropertyCollectionOptions,
} from './property-collection-contract'
export type {
  PropertyCollectionFilter,
  PropertyCollectionFilterValue,
  PropertyCollectionShape,
  PropertyCollectionSource,
} from './property-collection-contract'

export function usePropertyCollection(
  options: UsePropertyCollectionOptions = {}
) {
  const db = useFirestore()
  const {
    sourceMode,
    hasFilter,
    filterOperatorId,
    hasOperatorFilter,
    filterIdSet,
  } = useTargetCollectionSelection(options, 'live')
  const { appId, ecosystem } = useFireUXConfig()
  const { firestoreFetchCollection, firestoreLoadDocsByIds, firestoreQuery } =
    useFirestoreRead()

  const resolvedShape = computed<PropertyCollectionShape>(() => {
    return resolvePropertyCollectionShape(
      options.shape,
      hasOperatorFilter.value
    )
  })
  const usesTargetedRootRead = computed(
    () => hasFilter.value || resolvedShape.value === 'root-with-app-support'
  )
  const rootCollectionPath = computed(() => {
    if (sourceMode.value === 'demo') return ''
    if (sourceMode.value === 'test') return ''
    if (usesTargetedRootRead.value) return ''
    return DEFAULT_COLLECTION_PATH
  })
  const liveDocumentCollectionPath = computed(() =>
    sourceMode.value === 'live' && usesTargetedRootRead.value
      ? DEFAULT_COLLECTION_PATH
      : ''
  )
  const resolvedAppId = computed(() => normalizeString(appId))
  const acceptsAppSupport = (
    root: Property,
    appSupport: AppPropertyRecord | undefined
  ) => {
    const management = readFireuxEntityManagement(root.management)
    if (
      resolvedShape.value === 'root-with-app-support' &&
      (!appSupport ||
        !readWorkspaceTargetAuthority(appSupport) ||
        !resolvedAppId.value ||
        !management ||
        management.mode === 'root' ||
        resolveFireuxEntityManagementAppId(management, ecosystem) !==
          resolvedAppId.value)
    ) {
      return false
    }
    return true
  }
  const appSupportAccessEnabled = computed(
    () =>
      sourceMode.value === 'live' &&
      resolvedShape.value !== 'root' &&
      hasOperatorFilter.value &&
      Boolean(filterOperatorId.value)
  )
  const {
    collectionPath: appSupportCollectionPath,
    operatorQuery: appSupportOperatorQuery,
    teamQuery: appSupportTeamQuery,
  } = useAppSupportAccessQueries<AppPropertyRecord>({
    db,
    appId: resolvedAppId,
    collectionName: PropertyStorage.appSupportCollection,
    accessId: filterOperatorId,
    enabled: appSupportAccessEnabled,
  })
  const targetedAppSupportCollectionPath = computed(() =>
    sourceMode.value === 'live' &&
    resolvedShape.value === 'root-with-app-support' &&
    hasFilter.value &&
    !hasOperatorFilter.value
      ? appSupportCollectionPath.value
      : ''
  )

  const rootSource =
    firestoreFetchCollection<PropertyCollectionDoc>(rootCollectionPath)
  const targetedAppSupportSource = firestoreLoadDocsByIds<AppPropertyRecord>({
    collectionPath: targetedAppSupportCollectionPath,
    ids: computed(() => [...filterIdSet.value]),
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

    return hasFilter.value ? ids.filter((id) => filterIdSet.value.has(id)) : ids
  })
  const liveRootDocs = firestoreLoadDocsByIds<PropertyCollectionDoc>({
    collectionPath: liveDocumentCollectionPath,
    ids: targetedPropertyIds,
  })
  const targetItems = computed<PropertySurface[]>(() =>
    composePropertyCollectionTargets({
      source: sourceMode.value,
      usesTargetedRead: usesTargetedRootRead.value,
      roots: usesTargetedRootRead.value
        ? (liveRootDocs.docs.value ?? [])
        : (rootSource.value ?? []),
      appSupport: appSupportSource.value ?? [],
      acceptAppSupport: acceptsAppSupport,
    })
  )

  const collectionItems = computed<PropertySurface[]>(() => targetItems.value)

  const properties = computed<PropertySurface[]>(() =>
    collectionItems.value.reduce<PropertySurface[]>((acc, property) => {
      const id = resolvePropertyId(property)
      if (!id) return acc
      if (hasFilter.value && !filterIdSet.value.has(id)) return acc
      if (hasOperatorFilter.value) {
        if (!filterOperatorId.value) return acc
        if (!targetHasWorkspaceAccess(property, filterOperatorId.value))
          return acc
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
    )
      return []
    if (
      appSupportOperatorSource.pending.value ||
      appSupportTeamSource.pending.value ||
      targetedAppSupportSource.pending.value ||
      liveRootDocs.pending.value ||
      appSupportOperatorSource.error.value ||
      appSupportTeamSource.error.value ||
      targetedAppSupportSource.error.value ||
      liveRootDocs.error.value
    )
      return []

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
  const malformedAppSupportIds = computed(() => {
    if (
      sourceMode.value !== 'live' ||
      resolvedShape.value !== 'root-with-app-support' ||
      appSupportOperatorSource.pending.value ||
      appSupportTeamSource.pending.value ||
      targetedAppSupportSource.pending.value ||
      appSupportOperatorSource.error.value ||
      appSupportTeamSource.error.value ||
      targetedAppSupportSource.error.value
    )
      return []

    return appSupportSource.value
      .filter((appSupport) => !readWorkspaceTargetAuthority(appSupport))
      .map((appSupport) => resolvePropertyId(appSupport))
      .filter(Boolean)
  })
  const invalidRootIds = computed(() => {
    if (sourceMode.value !== 'live') return []
    const roots = usesTargetedRootRead.value
      ? (liveRootDocs.docs.value ?? [])
      : (rootSource.value ?? [])

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
      .filter((property) => {
        const management = readFireuxEntityManagement(property.management)
        return (
          !management ||
          management.mode === 'root' ||
          resolveFireuxEntityManagementAppId(management, ecosystem) !== resolvedAppId.value
        )
      })
      .map((property) => property.id)
    if (!mismatches.length) return undefined

    return new Error(
      `[fireux-properties] Property root/AppProperty scope mismatch: ${mismatches.join(', ')}`
    )
  })
  const pending = computed(() => {
    if (sourceMode.value === 'demo') return false
    if (sourceMode.value === 'test') return false
    if (!usesTargetedRootRead.value) return rootSource.pending.value
    if (hasOperatorFilter.value && !filterOperatorId.value) return false
    return (
      liveRootDocs.pending.value ||
      (resolvedShape.value === 'root-with-app-support' &&
        (hasOperatorFilter.value
          ? appSupportOperatorSource.pending.value ||
            appSupportTeamSource.pending.value
          : targetedAppSupportSource.pending.value))
    )
  })
  const error = computed<unknown | undefined>(() => {
    if (sourceMode.value === 'demo') return undefined
    if (sourceMode.value === 'test') {
      return new Error(UNSUPPORTED_TEST_SOURCE_MESSAGE)
    }
    if (hasOperatorFilter.value && !filterOperatorId.value) return undefined
    if (!usesTargetedRootRead.value && rootSource.error.value) {
      return rootSource.error.value
    }
    const sourceError =
      (resolvedShape.value === 'root-with-app-support'
        ? hasOperatorFilter.value
          ? (appSupportOperatorSource.error.value ??
            appSupportTeamSource.error.value)
          : targetedAppSupportSource.error.value
        : undefined) ??
      (usesTargetedRootRead.value ? liveRootDocs.error.value : undefined)

    if (sourceError) return sourceError
    if (malformedAppSupportIds.value.length) {
      return new Error(
        `[fireux-properties] malformed AppProperty authority: ${malformedAppSupportIds.value.join(', ')}`
      )
    }
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
