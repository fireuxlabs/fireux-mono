// Concurrent edit — 2026-07-20 16:34 CEST — Console Spine pass: avoid eager full-root reads for targeted Supplier consoles.
// Concurrent edit — 2026-07-20 17:17 CEST — Demo Data Spine pass: remove console fixtures from the Firestore collection seam.
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
  SupplierStorage,
  type Supplier,
} from '../../../../../models/supplier/Supplier.model'
import { useSupplierInterface } from '../utils/view/useSupplierInterface'

type SupplierCollectionDoc = Partial<Supplier> & {
  id?: string
  operator_ids?: string[]
  team_ids?: string[]
}

type AppSupplierOverlay = SupplierCollectionDoc & {
  operator_ids?: string[]
  team_ids?: string[]
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

function resolveSupplierId(supplier: Partial<SupplierCollectionDoc> | null | undefined) {
  return normalizeString(supplier?.id)
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
  const overlayOperatorQuery = computed<Query<AppSupplierOverlay> | null>(() => {
    if (sourceMode.value !== 'live' || !resolvedAppId.value) return null

    if (!hasOperatorFilter.value || !filterOperatorId.value) return null

    return fsq(
      collection(db, AppStorage.collection, resolvedAppId.value, SupplierStorage.overlayCollection),
      where('operator_ids', 'array-contains', filterOperatorId.value)
    ) as Query<AppSupplierOverlay>
  })
  const overlayTeamQuery = computed<Query<AppSupplierOverlay> | null>(() => {
    if (sourceMode.value !== 'live' || !resolvedAppId.value) return null

    if (!hasOperatorFilter.value || !filterOperatorId.value) return null

    return fsq(
      collection(db, AppStorage.collection, resolvedAppId.value, SupplierStorage.overlayCollection),
      where('team_ids', 'array-contains', filterOperatorId.value)
    ) as Query<AppSupplierOverlay>
  })
  const overlayOperatorSource = firestoreQuery<AppSupplierOverlay>(
    overlayOperatorQuery,
    undefined,
    computed(() =>
      resolvedAppId.value
        ? `${AppStorage.collection}/${resolvedAppId.value}/${SupplierStorage.overlayCollection}`
        : ''
    )
  )
  const overlayTeamSource = firestoreQuery<AppSupplierOverlay>(
    overlayTeamQuery,
    undefined,
    computed(() =>
      resolvedAppId.value
        ? `${AppStorage.collection}/${resolvedAppId.value}/${SupplierStorage.overlayCollection}`
        : ''
    )
  )
  const overlaySource = computed<AppSupplierOverlay[]>(() => {
    const byId = new Map<string, AppSupplierOverlay>()

    for (const overlay of [
      ...(overlayOperatorSource.value ?? []),
      ...(overlayTeamSource.value ?? []),
    ]) {
      const id = resolveSupplierId(overlay)
      if (id) byId.set(id, { ...overlay, id })
    }

    return [...byId.values()]
  })
  const liveRootSource = firestoreFetchCollection<SupplierCollectionDoc>(
    liveRootCollectionPath
  )
  const allowedSupplierIds = computed(() =>
    (overlaySource.value ?? [])
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
  const liveRootDocs = firestoreLoadDocsByIds<SupplierCollectionDoc>({
    collectionPath: liveDocumentCollectionPath,
    ids: targetedSupplierIds,
  })

  const liveItems = computed<SupplierCollectionDoc[]>(() => {
    const rootById = new Map<string, SupplierCollectionDoc>()
    const overlayById = new Map<string, AppSupplierOverlay>()

    for (const supplier of liveRootDocs.docs.value ?? []) {
      const id = resolveSupplierId(supplier)
      if (!id) continue
      rootById.set(id, {
        ...supplier,
        id,
      })
    }

    for (const overlay of overlaySource.value ?? []) {
      const id = resolveSupplierId(overlay)
      if (!id) continue
      overlayById.set(id, {
        ...overlay,
        id,
      })
    }

    const merged: SupplierCollectionDoc[] = []
    const seen = new Set<string>()

    for (const supplier of liveRootDocs.docs.value ?? []) {
      const id = resolveSupplierId(supplier)
      if (!id || seen.has(id)) continue
      seen.add(id)

      const item = surface({
        supplier: {
          ...(rootById.get(id) ?? {}),
          id,
        },
        overlay: overlayById.get(id) ?? {},
      })
      if (item) merged.push(item)
    }

    for (const overlay of overlaySource.value ?? []) {
      const id = resolveSupplierId(overlay)
      if (!id || seen.has(id)) continue
      seen.add(id)

      const item = surface({
        supplier: {
          ...(rootById.get(id) ?? {}),
          id,
        },
        overlay: overlayById.get(id) ?? {},
      })
      if (item) merged.push(item)
    }

    return merged
  })

  const collectionItems = computed<SupplierCollectionDoc[]>(() => {
    if (sourceMode.value === 'demo') return []
    if (sourceMode.value === 'test') return testSource.value ?? []
    if (!usesTargetedRootRead.value) return liveRootSource.value ?? []
    return liveItems.value
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
      (hasOperatorFilter.value && (
        overlayOperatorSource.pending.value ||
        overlayTeamSource.pending.value
      ))
    )
  })
  const error = computed<unknown | undefined>(() => {
    if (sourceMode.value === 'demo') return undefined
    if (sourceMode.value === 'test') return testSource.error.value
    if (!usesTargetedRootRead.value) return liveRootSource.error.value
    if (hasOperatorFilter.value && !filterOperatorId.value) return undefined
    return (hasOperatorFilter.value
      ? overlayOperatorSource.error.value ?? overlayTeamSource.error.value
      : undefined) ?? liveRootDocs.error.value
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
