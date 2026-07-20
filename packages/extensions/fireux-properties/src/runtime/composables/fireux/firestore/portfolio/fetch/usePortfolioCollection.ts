// Concurrent edit — 2026-07-20 16:34 CEST — Console Spine pass: avoid eager full-root reads for targeted Portfolio consoles.
// Concurrent edit — 2026-07-20 22:57 CEST — Both-Entity Authority — Portfolio: expose only complete, current-App root/support target pairs.
// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: name exact App access-record joins directly.
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
import { targetHasConsoleAccess } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleAccess'
import type { ConsoleSource } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import {
  PortfolioStorage,
  type AppPortfolio,
  type Portfolio,
} from '../../../../../models/portfolio.model'
import {
  usePortfolioInterface,
  type PortfolioSurface,
} from '../utils/view/usePortfolioInterface'

type PortfolioCollectionDoc = Partial<Portfolio> & {
  id?: string
}
type PortfolioCollectionItem = PortfolioSurface & { id?: string }

const DEFAULT_COLLECTION_PATH = PortfolioStorage.rootCollection
const TEST_COLLECTION_PATH = 'test-portfolios'

export type PortfolioCollectionFilterValue = string | number | null | undefined
export type PortfolioCollectionFilter = {
  ids?: PortfolioCollectionFilterValue[] | null | undefined
  operatorId?: PortfolioCollectionFilterValue
  teamId?: PortfolioCollectionFilterValue
}
export type PortfolioCollectionSource = ConsoleSource

type UsePortfolioCollectionOptions = {
  source?:
    | PortfolioCollectionSource
    | Ref<PortfolioCollectionSource | null | undefined>
    | null
  filter?:
    | PortfolioCollectionFilter
    | Ref<PortfolioCollectionFilter | null | undefined>
    | null
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

function resolvePortfolioId(portfolio: { id?: unknown } | null | undefined) {
  return normalizeString(portfolio?.id)
}

function portfolioRootBelongsToApp(
  portfolio: PortfolioCollectionDoc,
  appId: string
) {
  const state = normalizeFireuxAppScopeState(portfolio.app_scope_state)
  return (
    (state === 'parent_app' || state === 'tenant_app') &&
    normalizeString(portfolio.app_scope_app_id) === appId
  )
}

export function usePortfolioCollection(
  options: UsePortfolioCollectionOptions = {}
) {
  const db = useFirestore()
  const { firestoreFetchCollection, firestoreLoadDocsByIds, firestoreQuery } = useFirestoreRead()
  const { appId } = useFireUXConfig()
  const { surface } = usePortfolioInterface()
  const sourceMode = computed<PortfolioCollectionSource>(() => {
    if (isRef(options.source)) return options.source.value ?? 'live'
    return options.source ?? 'live'
  })
  const resolvedFilter = computed<PortfolioCollectionFilter | undefined>(() => {
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
  const testSource = firestoreFetchCollection<PortfolioCollectionDoc>(
    testCollectionPath
  )
  const resolvedAppId = computed(() => normalizeString(appId))
  const appSupportCollectionPath = computed(() =>
    resolvedAppId.value
      ? `${AppStorage.collection}/${resolvedAppId.value}/${PortfolioStorage.appSupportCollection}`
      : ''
  )
  const targetedAppSupportCollectionPath = computed(() =>
    sourceMode.value === 'live' && hasFilter.value && !hasOperatorFilter.value
      ? appSupportCollectionPath.value
      : ''
  )
  const targetedAppSupportSource = firestoreLoadDocsByIds<AppPortfolio>({
    collectionPath: targetedAppSupportCollectionPath,
    ids: computed(() => [...filterIdSet.value]),
  })
  const appSupportOperatorQuery = computed<Query<AppPortfolio> | null>(() => {
    if (sourceMode.value !== 'live' || !resolvedAppId.value) return null

    if (!hasOperatorFilter.value || !filterOperatorId.value) return null

    return fsq(
      collection(db, AppStorage.collection, resolvedAppId.value, PortfolioStorage.appSupportCollection),
      where('operator_ids', 'array-contains', filterOperatorId.value)
    ) as Query<AppPortfolio>
  })
  const appSupportTeamQuery = computed<Query<AppPortfolio> | null>(() => {
    if (sourceMode.value !== 'live' || !resolvedAppId.value) return null

    if (!hasOperatorFilter.value || !filterOperatorId.value) return null

    return fsq(
      collection(db, AppStorage.collection, resolvedAppId.value, PortfolioStorage.appSupportCollection),
      where('team_ids', 'array-contains', filterOperatorId.value)
    ) as Query<AppPortfolio>
  })
  const appSupportOperatorSource = firestoreQuery<AppPortfolio>(
    appSupportOperatorQuery,
    undefined,
    appSupportCollectionPath
  )
  const appSupportTeamSource = firestoreQuery<AppPortfolio>(
    appSupportTeamQuery,
    undefined,
    appSupportCollectionPath
  )
  const appSupportSource = computed<AppPortfolio[]>(() => {
    const byId = new Map<string, AppPortfolio>()

    for (const appSupport of [
      ...(targetedAppSupportSource.docs.value ?? []),
      ...(appSupportOperatorSource.value ?? []),
      ...(appSupportTeamSource.value ?? []),
    ]) {
      const id = resolvePortfolioId(appSupport)
      if (id) byId.set(id, { ...appSupport, id })
    }

    return [...byId.values()]
  })
  const allowedPortfolioIds = computed(() =>
    (appSupportSource.value ?? [])
      .map((portfolio) => resolvePortfolioId(portfolio))
      .filter(Boolean)
  )
  const targetedPortfolioIds = computed(() => {
    const ids = hasOperatorFilter.value
      ? allowedPortfolioIds.value
      : [...filterIdSet.value]

    return hasFilter.value
      ? ids.filter((id) => filterIdSet.value.has(id))
      : ids
  })
  const liveRootSource = firestoreFetchCollection<PortfolioCollectionDoc>(
    liveRootCollectionPath
  )
  const liveRootDocs = firestoreLoadDocsByIds<PortfolioCollectionDoc>({
    collectionPath: liveDocumentCollectionPath,
    ids: targetedPortfolioIds,
  })

  const liveItems = computed<PortfolioCollectionItem[]>(() => {
    const rootById = new Map<string, PortfolioCollectionDoc>()
    const appSupportById = new Map<string, AppPortfolio>()

    for (const portfolio of liveRootDocs.docs.value ?? []) {
      const id = resolvePortfolioId(portfolio)
      if (!id) continue
      rootById.set(id, {
        ...portfolio,
        id,
      })
    }

    for (const appSupport of appSupportSource.value ?? []) {
      const id = resolvePortfolioId(appSupport)
      if (!id) continue
      appSupportById.set(id, {
        ...appSupport,
        id,
      })
    }

    const merged: PortfolioCollectionItem[] = []
    const seen = new Set<string>()

    for (const portfolio of liveRootDocs.docs.value ?? []) {
      const id = resolvePortfolioId(portfolio)
      if (!id || seen.has(id)) continue
      seen.add(id)

      const root = {
        ...(rootById.get(id) ?? {}),
        id,
      }
      const appSupport = appSupportById.get(id)
      if (
        !appSupport ||
        !resolvedAppId.value ||
        !portfolioRootBelongsToApp(root, resolvedAppId.value)
      ) continue

      const item = surface({
        portfolio: root,
        appSupport,
      })
      if (item) merged.push(item)
    }

    return merged
  })

  const normalizeRootItems = (items: PortfolioCollectionDoc[]) =>
    items.reduce<PortfolioCollectionItem[]>((normalized, portfolio) => {
      const item = surface({ portfolio })
      if (item) normalized.push(item)
      return normalized
    }, [])

  const collectionItems = computed<PortfolioCollectionItem[]>(() => {
    if (sourceMode.value === 'demo') return []
    if (sourceMode.value === 'test') {
      return normalizeRootItems(testSource.value ?? [])
    }
    if (!usesTargetedRootRead.value) {
      return normalizeRootItems(liveRootSource.value ?? [])
    }
    return liveItems.value
  })

  const portfolios = computed<PortfolioCollectionItem[]>(() =>
    collectionItems.value.reduce<PortfolioCollectionItem[]>((acc, portfolio) => {
      const id = resolvePortfolioId(portfolio)
      if (!id) return acc
      if (hasFilter.value && !filterIdSet.value.has(id)) return acc
      if (hasOperatorFilter.value) {
        if (!filterOperatorId.value) return acc
        if (!targetHasConsoleAccess(portfolio, filterOperatorId.value)) return acc
      }

      acc.push({
        ...portfolio,
        id,
      })

      return acc
    }, [])
  )

  const count = computed(() => portfolios.value.length)
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
  const danglingAppSupportIds = computed(() => {
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
      liveRootDocs.error.value ||
      (liveRootDocs.outcome.value !== 'ready' &&
        liveRootDocs.outcome.value !== 'empty')
    ) {
      return []
    }

    const rootIds = new Set(
      (liveRootDocs.docs.value ?? [])
        .map((portfolio) => resolvePortfolioId(portfolio))
        .filter(Boolean)
    )

    return appSupportSource.value
      .map((appSupport) => resolvePortfolioId(appSupport))
      .filter(Boolean)
      .filter((id) => !rootIds.has(id))
  })
  const danglingAppSupportError = computed<Error | undefined>(() => {
    if (!danglingAppSupportIds.value.length) return undefined

    return new Error(
      `AppPortfolio support record references missing canonical root: ${danglingAppSupportIds.value.join(', ')}`
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
        .map((portfolio) => resolvePortfolioId(portfolio))
        .filter(Boolean)
    )
    const appSupportIds = new Set(
      (targetedAppSupportSource.docs.value ?? [])
        .map((appSupport) => resolvePortfolioId(appSupport))
        .filter(Boolean)
    )
    const missingRoots = [...filterIdSet.value].filter((id) => !rootIds.has(id))
    const missingAppRecords = [...filterIdSet.value].filter(
      (id) => !appSupportIds.has(id)
    )
    if (!missingRoots.length && !missingAppRecords.length) return undefined

    return new Error(
      `Incomplete requested Portfolio target pair; missing root: ${missingRoots.join(', ') || 'none'}; missing AppPortfolio: ${missingAppRecords.join(', ') || 'none'}`
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
        .map((appSupport) => resolvePortfolioId(appSupport))
        .filter(Boolean)
    )
    const mismatches = (liveRootDocs.docs.value ?? [])
      .filter((portfolio) => appSupportIds.has(resolvePortfolioId(portfolio)))
      .filter(
        (portfolio) => !portfolioRootBelongsToApp(portfolio, resolvedAppId.value)
      )
      .map((portfolio) => resolvePortfolioId(portfolio))
      .filter(Boolean)
    if (!mismatches.length) return undefined

    return new Error(
      `Portfolio root/AppPortfolio scope mismatch: ${mismatches.join(', ')}`
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
      requestedTargetPairError.value ??
      rootScopeError.value ??
      danglingAppSupportError.value
  })
  const { outcome } = useFirestoreCollectionState({
    count,
    error,
    pending,
  })

  return {
    portfolios,
    count,
    pending,
    error,
    outcome,
  }
}
