// Concurrent edit — 2026-07-20 16:34 CEST — Console Spine pass: avoid eager full-root reads for targeted Supplier consoles.
// Concurrent edit — 2026-07-20 17:17 CEST — Demo Data Spine pass: remove console fixtures from the Firestore collection seam.
// Concurrent edit — 2026-07-20 22:57 CEST — Both-Entity Authority — Supplier: expose only complete, current-App root/support target pairs.
// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: name exact App access-record joins directly.
// Concurrent edit — 2026-07-21 23:18 CEST — Console family alignment: fail closed on malformed AppSupplier authority.
import {
  collection,
  query as fsq,
  where,
  type Query,
} from 'firebase/firestore'
import { computed, isRef, type Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { AppStorage } from 'fireux-core/runtime/models/core/app.model'
import { normalizeFireuxAppScopeState } from 'fireux-core/runtime/models/core/meta.model'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import {
  readConsoleTargetAuthority,
  targetHasConsoleAccess,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsoleAccess'
import type { ConsoleSource } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import {
  SupplierStorage,
  type AppSupplier,
  type Supplier,
} from '../../../../../models/supplier/Supplier.model'
import {
  useSupplierInterface,
  type SupplierSurface,
} from '../utils/view/useSupplierInterface'

type SupplierRootDoc = Partial<Supplier> & {
  id?: string
}

type SupplierCollectionDoc = SupplierRootDoc & SupplierSurface

type AppSupplierRecord = Partial<AppSupplier> & {
  id?: string
}

const DEFAULT_COLLECTION_PATH = SupplierStorage.rootCollection
const TEST_COLLECTION_PATH = 'test-suppliers'

export type SupplierCollectionFilterValue = string | number | null | undefined
export type SupplierCollectionFilter = {
  ids?: SupplierCollectionFilterValue[] | null | undefined
  operatorId?: SupplierCollectionFilterValue
  teamId?: SupplierCollectionFilterValue
}
export type SupplierCollectionSource = ConsoleSource

type UseSupplierCollectionOptions = {
  source?:
    | SupplierCollectionSource
    | Ref<SupplierCollectionSource | null | undefined>
    | null
  filter?:
    | SupplierCollectionFilter
    | Ref<SupplierCollectionFilter | null | undefined>
    | null
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

function resolveSupplierId(supplier: { id?: unknown } | null | undefined) {
  return normalizeString(supplier?.id)
}

function supplierRootBelongsToApp(
  supplier: SupplierRootDoc,
  appId: string
) {
  const state = normalizeFireuxAppScopeState(supplier.app_scope_state)
  return (
    (state === 'parent_app' || state === 'tenant_app') &&
    normalizeString(supplier.app_scope_app_id) === appId
  )
}

export function useSupplierCollection(
  options: UseSupplierCollectionOptions = {}
) {
  const db = useFirestore()
  const { firestoreFetchCollection, firestoreLoadDocsByIds, firestoreQuery } = useFirestoreRead()
  const { appId } = useFireUXConfig()
  const { surface } = useSupplierInterface()
  const sourceMode = computed<SupplierCollectionSource>(() => {
    if (isRef(options.source)) return options.source.value ?? 'live'
    return options.source ?? 'live'
  })
  const resolvedFilter = computed<SupplierCollectionFilter | undefined>(() => {
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
  const usesTargetedRootRead = computed(
    () => hasFilter.value || hasOperatorFilter.value
  )
  const testCollectionPath = computed(() =>
    sourceMode.value === 'test' ? TEST_COLLECTION_PATH : ''
  )
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
  const testSource = firestoreFetchCollection<SupplierCollectionDoc>(
    testCollectionPath
  )
  const resolvedAppId = computed(() => normalizeString(appId))
  const appSupportCollectionPath = computed(() =>
    resolvedAppId.value
      ? `${AppStorage.collection}/${resolvedAppId.value}/${SupplierStorage.appSupportCollection}`
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
  const appSupportOperatorQuery = computed<Query<AppSupplierRecord> | null>(() => {
    if (sourceMode.value !== 'live' || !resolvedAppId.value) return null

    if (!hasOperatorFilter.value || !filterOperatorId.value) return null

    return fsq(
      collection(db, AppStorage.collection, resolvedAppId.value, SupplierStorage.appSupportCollection),
      where('operator_ids', 'array-contains', filterOperatorId.value)
    ) as Query<AppSupplierRecord>
  })
  const appSupportTeamQuery = computed<Query<AppSupplierRecord> | null>(() => {
    if (sourceMode.value !== 'live' || !resolvedAppId.value) return null

    if (!hasOperatorFilter.value || !filterOperatorId.value) return null

    return fsq(
      collection(db, AppStorage.collection, resolvedAppId.value, SupplierStorage.appSupportCollection),
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

    return hasFilter.value
      ? ids.filter((id) => filterIdSet.value.has(id))
      : ids
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
        !supplierRootBelongsToApp(root, resolvedAppId.value)
      ) continue

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
    if (sourceMode.value === 'test') {
      return normalizeRootItems(testSource.value ?? [])
    }
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

    const rootIds = new Set(
      (liveRootDocs.docs.value ?? [])
        .map((supplier) => resolveSupplierId(supplier))
        .filter(Boolean)
    )
    const danglingCount = appSupportSource.value
      .map((appSupport) => resolveSupplierId(appSupport))
      .filter(Boolean)
      .filter(
      (id) => !rootIds.has(id)
      ).length

    if (!danglingCount) return undefined

    return new Error(
      `[useSupplierCollection] ${danglingCount} AppSupplier support record(s) have no canonical root Supplier`
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
    ) return undefined

    const ids = appSupportSource.value
      .filter(appSupport => !readConsoleTargetAuthority(appSupport))
      .map(appSupport => resolveSupplierId(appSupport))
      .filter(Boolean)
    if (!ids.length) return undefined
    return new Error(
      `[useSupplierCollection] malformed AppSupplier authority: ${ids.join(', ')}`
    )
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

    const rootIds = new Set(
      (liveRootDocs.docs.value ?? [])
        .map((supplier) => resolveSupplierId(supplier))
        .filter(Boolean)
    )
    const appSupportIds = new Set(
      (targetedAppSupportSource.docs.value ?? [])
        .map((appSupport) => resolveSupplierId(appSupport))
        .filter(Boolean)
    )
    const missingRoots = [...filterIdSet.value].filter((id) => !rootIds.has(id))
    const missingAppRecords = [...filterIdSet.value].filter(
      (id) => !appSupportIds.has(id)
    )
    if (!missingRoots.length && !missingAppRecords.length) return undefined

    return new Error(
      `[useSupplierCollection] incomplete requested Supplier target pair; missing root: ${missingRoots.join(', ') || 'none'}; missing AppSupplier: ${missingAppRecords.join(', ') || 'none'}`
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

    const appSupportIds = new Set(
      appSupportSource.value
        .map((appSupport) => resolveSupplierId(appSupport))
        .filter(Boolean)
    )
    const mismatches = (liveRootDocs.docs.value ?? [])
      .filter((supplier) => appSupportIds.has(resolveSupplierId(supplier)))
      .filter(
        (supplier) => !supplierRootBelongsToApp(supplier, resolvedAppId.value)
      )
      .map((supplier) => resolveSupplierId(supplier))
      .filter(Boolean)
    if (!mismatches.length) return undefined

    return new Error(
      `[useSupplierCollection] Supplier root/AppSupplier scope mismatch: ${mismatches.join(', ')}`
    )
  })

  const suppliers = computed<SupplierCollectionDoc[]>(() =>
    collectionItems.value.reduce<SupplierCollectionDoc[]>((acc, supplier) => {
      const id = resolveSupplierId(supplier)
      if (!id) return acc
      if (hasFilter.value && !filterIdSet.value.has(id)) return acc
      if (hasOperatorFilter.value) {
        if (!filterOperatorId.value) return acc
        if (!targetHasConsoleAccess(supplier, filterOperatorId.value)) return acc
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
    if (sourceMode.value === 'test') return testSource.pending.value
    if (!usesTargetedRootRead.value) return liveRootSource.pending.value
    if (hasOperatorFilter.value && !filterOperatorId.value) return false
    return (
      liveRootDocs.pending.value ||
      (hasOperatorFilter.value
        ? appSupportOperatorSource.pending.value || appSupportTeamSource.pending.value
        : targetedAppSupportSource.pending.value)
    )
  })
  const error = computed<unknown | undefined>(() => {
    if (sourceMode.value === 'demo') return undefined
    if (sourceMode.value === 'test') return testSource.error.value
    if (!usesTargetedRootRead.value) return liveRootSource.error.value
    if (hasOperatorFilter.value && !filterOperatorId.value) return undefined
    return (hasOperatorFilter.value
      ? appSupportOperatorSource.error.value ?? appSupportTeamSource.error.value
      : targetedAppSupportSource.error.value) ??
      liveRootDocs.error.value ??
      malformedAppSupportError.value ??
      requestedTargetPairError.value ??
      rootScopeError.value ??
      danglingAppSupportError.value
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
