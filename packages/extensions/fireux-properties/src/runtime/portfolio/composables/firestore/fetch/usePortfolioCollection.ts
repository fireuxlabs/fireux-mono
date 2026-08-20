import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import {
  readWorkspaceTargetAuthority,
  targetHasWorkspaceAccess,
} from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceAccess'
import {
  PortfolioStorage,
  type AppPortfolio,
} from '../../../models/portfolio.model.ts'
import { usePortfolioInterface } from '../utils/view/usePortfolioInterface'
import { useAppSupportAccessQueries } from '../../../../composables/fireux/firestore/app-support-collection'
import { useTargetCollectionSelection } from '../../../../composables/fireux/firestore/collection-selection'
import { composePortfolioCollectionTargets } from './portfolio-collection-projection'
import {
  DEFAULT_COLLECTION_PATH,
  UNSUPPORTED_TEST_SOURCE_MESSAGE,
  normalizeString,
  portfolioRootBelongsToApp,
  resolvePortfolioId,
  type PortfolioCollectionDoc,
  type PortfolioCollectionItem,
  type UsePortfolioCollectionOptions,
} from './portfolio-collection-contract'
export type {
  PortfolioCollectionFilter,
  PortfolioCollectionFilterValue,
  PortfolioCollectionSource,
} from './portfolio-collection-contract'

export function usePortfolioCollection(
  options: UsePortfolioCollectionOptions = {}
) {
  const db = useFirestore()
  const {
    sourceMode,
    hasFilter,
    filterOperatorId,
    hasOperatorFilter,
    filterIdSet,
  } = useTargetCollectionSelection(options, 'live')
  const { firestoreFetchCollection, firestoreLoadDocsByIds, firestoreQuery } =
    useFirestoreRead()
  const { appId, ecosystem } = useFireUXConfig()
  const { surface } = usePortfolioInterface()

  const usesTargetedRootRead = computed(
    () => hasFilter.value || hasOperatorFilter.value
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
  const resolvedAppId = computed(() => normalizeString(appId))
  const acceptsAppSupport = (
    root: PortfolioCollectionDoc,
    appSupport: AppPortfolio | undefined
  ) => {
    if (
      !appSupport ||
      !readWorkspaceTargetAuthority(appSupport) ||
      !resolvedAppId.value ||
      !portfolioRootBelongsToApp(root, resolvedAppId.value, ecosystem)
    ) {
      return false
    }
    return true
  }
  const appSupportAccessEnabled = computed(
    () =>
      sourceMode.value === 'live' &&
      hasOperatorFilter.value &&
      Boolean(filterOperatorId.value)
  )
  const {
    collectionPath: appSupportCollectionPath,
    operatorQuery: appSupportOperatorQuery,
    teamQuery: appSupportTeamQuery,
  } = useAppSupportAccessQueries<AppPortfolio>({
    db,
    appId: resolvedAppId,
    collectionName: PortfolioStorage.appSupportCollection,
    accessId: filterOperatorId,
    enabled: appSupportAccessEnabled,
  })
  const targetedAppSupportCollectionPath = computed(() =>
    sourceMode.value === 'live' && hasFilter.value && !hasOperatorFilter.value
      ? appSupportCollectionPath.value
      : ''
  )
  const targetedAppSupportSource = firestoreLoadDocsByIds<AppPortfolio>({
    collectionPath: targetedAppSupportCollectionPath,
    ids: computed(() => [...filterIdSet.value]),
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

    return hasFilter.value ? ids.filter((id) => filterIdSet.value.has(id)) : ids
  })
  const liveRootSource = firestoreFetchCollection<PortfolioCollectionDoc>(
    liveRootCollectionPath
  )
  const liveRootDocs = firestoreLoadDocsByIds<PortfolioCollectionDoc>({
    collectionPath: liveDocumentCollectionPath,
    ids: targetedPortfolioIds,
  })

  const collectionItems = computed<PortfolioCollectionItem[]>(() =>
    composePortfolioCollectionTargets({
      source: sourceMode.value,
      usesTargetedRead: usesTargetedRootRead.value,
      roots: usesTargetedRootRead.value
        ? (liveRootDocs.docs.value ?? [])
        : (liveRootSource.value ?? []),
      appSupport: appSupportSource.value ?? [],
      surface,
      acceptAppSupport: acceptsAppSupport,
    })
  )

  const portfolios = computed<PortfolioCollectionItem[]>(() =>
    collectionItems.value.reduce<PortfolioCollectionItem[]>(
      (acc, portfolio) => {
        const id = resolvePortfolioId(portfolio)
        if (!id) return acc
        if (hasFilter.value && !filterIdSet.value.has(id)) return acc
        if (hasOperatorFilter.value) {
          if (!filterOperatorId.value) return acc
          if (!targetHasWorkspaceAccess(portfolio, filterOperatorId.value))
            return acc
        }

        acc.push({
          ...portfolio,
          id,
        })

        return acc
      },
      []
    )
  )

  const count = computed(() => portfolios.value.length)
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

    const ids = appSupportSource.value
      .filter((appSupport) => !readWorkspaceTargetAuthority(appSupport))
      .map((appSupport) => resolvePortfolioId(appSupport))
      .filter(Boolean)
    if (!ids.length) return undefined
    return new Error(`Malformed AppPortfolio authority: ${ids.join(', ')}`)
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
        (portfolio) =>
          !portfolioRootBelongsToApp(
            portfolio,
            resolvedAppId.value,
            ecosystem
          )
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
