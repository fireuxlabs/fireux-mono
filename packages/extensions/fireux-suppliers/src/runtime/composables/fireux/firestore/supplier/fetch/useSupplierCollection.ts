import { collection, query as fsq, where, type Query } from 'firebase/firestore'
import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { AppStorage } from 'fireux-core/runtime/models/core/app.model'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import {
  readConsoleTargetAuthority,
  targetHasConsoleAccess,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsoleAccess'
import { AppSupplierStorage } from '../../../../../models/supplier/Supplier.model'
import { useSupplierInterface } from '../utils/view/useSupplierInterface'
import {
  DEFAULT_COLLECTION_PATH,
  UNSUPPORTED_TEST_SOURCE_MESSAGE,
  normalizeString,
  resolveSupplierId,
  supplierRootBelongsToApp,
  type AppSupplierRecord,
  type SupplierCollectionDoc,
  type SupplierRootDoc,
  type UseSupplierCollectionOptions,
} from './supplier-collection-contract'
import {
  findDanglingAppSupportError,
  findMalformedAppSupportError,
  findRequestedTargetPairError,
  findRootScopeError,
} from './supplier-collection-diagnostics'
import { useSupplierCollectionSelection } from './supplier-collection-selection'

export type {
  SupplierCollectionFilter,
  SupplierCollectionFilterValue,
  SupplierCollectionSource,
} from './supplier-collection-contract'
export function useSupplierCollection(
  options: UseSupplierCollectionOptions = {}
) {
  const db = useFirestore()
  const { firestoreFetchCollection, firestoreLoadDocsByIds, firestoreQuery } =
    useFirestoreRead()
  const { appId, ecosystem } = useFireUXConfig()
  const { surface } = useSupplierInterface()
  const {
    sourceMode,
    hasFilter,
    filterOperatorId,
    hasOperatorFilter,
    filterIdSet,
    usesTargetedRootRead,
  } = useSupplierCollectionSelection(options)
  const liveRootCollectionPath = computed(() =>
    sourceMode.value === 'live' && !usesTargetedRootRead.value
      ? DEFAULT_COLLECTION_PATH
      : ''
  )
  const liveDocumentCollectionPath = computed(() =>
    sourceMode.value === 'live' && usesTargetedRootRead.value
      ? DEFAULT_COLLECTION_PATH
      : ''
  )
  const resolvedAppId = computed(() => normalizeString(appId))
  const appSupportCollectionPath = computed(() =>
    resolvedAppId.value
      ? `${AppStorage.collection}/${resolvedAppId.value}/${AppSupplierStorage.collection}`
      : ''
  )
  const targetedAppSupportCollectionPath = computed(() =>
    sourceMode.value === 'live' && hasFilter.value && !hasOperatorFilter.value
      ? appSupportCollectionPath.value
      : ''
  )
  const targetedAppSupportSource = firestoreLoadDocsByIds<AppSupplierRecord>({
    collectionPath: targetedAppSupportCollectionPath,
    ids: computed(() => [...filterIdSet.value]),
  })
  const appSupportOperatorQuery = computed<Query<AppSupplierRecord> | null>(
    () => {
      if (sourceMode.value !== 'live' || !resolvedAppId.value) return null

      if (!hasOperatorFilter.value || !filterOperatorId.value) return null

      return fsq(
        collection(
          db,
          AppStorage.collection,
          resolvedAppId.value,
          AppSupplierStorage.collection
        ),
        where('operator_ids', 'array-contains', filterOperatorId.value)
      ) as Query<AppSupplierRecord>
    }
  )
  const appSupportTeamQuery = computed<Query<AppSupplierRecord> | null>(() => {
    if (sourceMode.value !== 'live' || !resolvedAppId.value) return null

    if (!hasOperatorFilter.value || !filterOperatorId.value) return null

    return fsq(
      collection(
        db,
        AppStorage.collection,
        resolvedAppId.value,
        AppSupplierStorage.collection
      ),
      where('team_ids', 'array-contains', filterOperatorId.value)
    ) as Query<AppSupplierRecord>
  })
  const appSupportOperatorSource = firestoreQuery<AppSupplierRecord>(
    appSupportOperatorQuery,
    undefined,
    appSupportCollectionPath
  )
  const appSupportTeamSource = firestoreQuery<AppSupplierRecord>(
    appSupportTeamQuery,
    undefined,
    appSupportCollectionPath
  )
  const appSupportSource = computed<AppSupplierRecord[]>(() => {
    const byId = new Map<string, AppSupplierRecord>()

    for (const appSupport of [
      ...(targetedAppSupportSource.docs.value ?? []),
      ...(appSupportOperatorSource.value ?? []),
      ...(appSupportTeamSource.value ?? []),
    ]) {
      const id = resolveSupplierId(appSupport)
      if (id) byId.set(id, { ...appSupport, id })
    }

    return [...byId.values()]
  })
  const liveRootSource = firestoreFetchCollection<SupplierRootDoc>(
    liveRootCollectionPath
  )
  const allowedSupplierIds = computed(() =>
    (appSupportSource.value ?? [])
      .map((supplier) => resolveSupplierId(supplier))
      .filter(Boolean)
  )
  const targetedSupplierIds = computed(() => {
    const ids = hasOperatorFilter.value
      ? allowedSupplierIds.value
      : [...filterIdSet.value]

    return hasFilter.value ? ids.filter((id) => filterIdSet.value.has(id)) : ids
  })
  const liveRootDocs = firestoreLoadDocsByIds<SupplierRootDoc>({
    collectionPath: liveDocumentCollectionPath,
    ids: targetedSupplierIds,
  })

  const liveItems = computed<SupplierCollectionDoc[]>(() => {
    const rootById = new Map<string, SupplierRootDoc>()
    const appSupportById = new Map<string, AppSupplierRecord>()

    for (const supplier of liveRootDocs.docs.value ?? []) {
      const id = resolveSupplierId(supplier)
      if (!id) continue
      rootById.set(id, {
        ...supplier,
        id,
      })
    }

    for (const appSupport of appSupportSource.value ?? []) {
      const id = resolveSupplierId(appSupport)
      if (!id) continue
      appSupportById.set(id, {
        ...appSupport,
        id,
      })
    }

    const merged: SupplierCollectionDoc[] = []
    for (const supplier of liveRootDocs.docs.value ?? []) {
      const id = resolveSupplierId(supplier)
      if (!id) continue

      const root = {
        ...(rootById.get(id) ?? {}),
        id,
      }
      const appSupport = appSupportById.get(id)
      if (
        !appSupport ||
        !readConsoleTargetAuthority(appSupport) ||
        !resolvedAppId.value ||
        !supplierRootBelongsToApp(root, resolvedAppId.value, ecosystem)
      )
        continue

      const item = surface({
        supplier: root,
        appSupport,
      })
      if (item) merged.push(item)
    }

    return merged
  })

  const normalizeRootItems = (items: SupplierRootDoc[]) =>
    items.reduce<SupplierCollectionDoc[]>((normalized, supplier) => {
      const item = surface({ supplier })
      if (item) normalized.push(item)
      return normalized
    }, [])

  const collectionItems = computed<SupplierCollectionDoc[]>(() => {
    if (sourceMode.value === 'demo') return []
    if (sourceMode.value === 'test') return []
    if (!usesTargetedRootRead.value) {
      return normalizeRootItems(liveRootSource.value ?? [])
    }
    return liveItems.value
  })

  const danglingAppSupportError = computed<Error | undefined>(() => {
    if (
      sourceMode.value !== 'live' ||
      !usesTargetedRootRead.value ||
      (hasOperatorFilter.value && !filterOperatorId.value) ||
      appSupportOperatorSource.pending.value ||
      appSupportTeamSource.pending.value ||
      targetedAppSupportSource.pending.value ||
      liveRootDocs.pending.value ||
      appSupportOperatorSource.error.value ||
      appSupportTeamSource.error.value ||
      targetedAppSupportSource.error.value ||
      liveRootDocs.error.value
    ) {
      return undefined
    }

    return findDanglingAppSupportError(
      liveRootDocs.docs.value ?? [],
      appSupportSource.value
    )
  })
  const malformedAppSupportError = computed<Error | undefined>(() => {
    if (
      sourceMode.value !== 'live' ||
      !usesTargetedRootRead.value ||
      appSupportOperatorSource.pending.value ||
      appSupportTeamSource.pending.value ||
      targetedAppSupportSource.pending.value ||
      appSupportOperatorSource.error.value ||
      appSupportTeamSource.error.value ||
      targetedAppSupportSource.error.value
    )
      return undefined

    return findMalformedAppSupportError(appSupportSource.value)
  })
  const requestedTargetPairError = computed<Error | undefined>(() => {
    if (
      sourceMode.value !== 'live' ||
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

    return findRequestedTargetPairError(
      filterIdSet.value,
      liveRootDocs.docs.value ?? [],
      targetedAppSupportSource.docs.value ?? []
    )
  })
  const rootScopeError = computed<Error | undefined>(() => {
    if (
      sourceMode.value !== 'live' ||
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

    return findRootScopeError(
      liveRootDocs.docs.value ?? [],
      appSupportSource.value,
      resolvedAppId.value,
      ecosystem
    )
  })

  const suppliers = computed<SupplierCollectionDoc[]>(() =>
    collectionItems.value.reduce<SupplierCollectionDoc[]>((acc, supplier) => {
      const id = resolveSupplierId(supplier)
      if (!id) return acc
      if (hasFilter.value && !filterIdSet.value.has(id)) return acc
      if (hasOperatorFilter.value) {
        if (!filterOperatorId.value) return acc
        if (!targetHasConsoleAccess(supplier, filterOperatorId.value))
          return acc
      }

      acc.push({
        ...supplier,
        id,
      })

      return acc
    }, [])
  )

  const count = computed(() => suppliers.value.length)
  const pending = computed(() => {
    if (sourceMode.value === 'demo') return false
    if (sourceMode.value === 'test') return false
    if (!usesTargetedRootRead.value) return liveRootSource.pending.value
    if (hasOperatorFilter.value && !filterOperatorId.value) return false
    return (
      liveRootDocs.pending.value ||
      (hasOperatorFilter.value
        ? appSupportOperatorSource.pending.value ||
          appSupportTeamSource.pending.value
        : targetedAppSupportSource.pending.value)
    )
  })
  const error = computed<unknown | undefined>(() => {
    if (sourceMode.value === 'demo') return undefined
    if (sourceMode.value === 'test') {
      return new Error(UNSUPPORTED_TEST_SOURCE_MESSAGE)
    }
    if (!usesTargetedRootRead.value) return liveRootSource.error.value
    if (hasOperatorFilter.value && !filterOperatorId.value) return undefined
    return (
      (hasOperatorFilter.value
        ? (appSupportOperatorSource.error.value ??
          appSupportTeamSource.error.value)
        : targetedAppSupportSource.error.value) ??
      liveRootDocs.error.value ??
      malformedAppSupportError.value ??
      requestedTargetPairError.value ??
      rootScopeError.value ??
      danglingAppSupportError.value
    )
  })
  const { outcome } = useFirestoreCollectionState({
    active: computed(() => sourceMode.value !== 'demo'),
    count,
    error,
    pending,
  })

  return {
    suppliers,
    count,
    pending,
    error,
    outcome,
  }
}
