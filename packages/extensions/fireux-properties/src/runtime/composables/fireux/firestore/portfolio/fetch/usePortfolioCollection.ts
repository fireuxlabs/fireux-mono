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
import {
  PortfolioStorage,
  type Portfolio,
} from '../../../../../models/portfolio.model'
import { usePortfolioInterface } from '../utils/view/usePortfolioInterface'

type PortfolioCollectionDoc = Partial<Portfolio> & {
  id?: string
  operator_ids?: string[]
  team_ids?: string[]
}
type AppPortfolioOverlay = PortfolioCollectionDoc & {
  operator_ids?: string[]
  team_ids?: string[]
}

const DEFAULT_COLLECTION_PATH = PortfolioStorage.rootCollection
const TEST_COLLECTION_PATH = 'test-portfolios'

export type PortfolioCollectionFilterValue = string | number | null | undefined
export type PortfolioCollectionFilter = {
  ids?: PortfolioCollectionFilterValue[] | null | undefined
  operatorId?: PortfolioCollectionFilterValue
  teamId?: PortfolioCollectionFilterValue
}
export type PortfolioCollectionSource = 'live' | 'demo' | 'test'

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

function resolvePortfolioId(portfolio: Partial<PortfolioCollectionDoc> | null | undefined) {
  return normalizeString(portfolio?.id)
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
  const testSource = firestoreFetchCollection<PortfolioCollectionDoc>(TEST_COLLECTION_PATH)
  const resolvedAppId = computed(() => normalizeString(appId))
  const overlayQuery = computed<Query<AppPortfolioOverlay> | null>(() => {
    if (sourceMode.value !== 'live' || !resolvedAppId.value) return null

    if (!hasOperatorFilter.value || !filterOperatorId.value) return null

    return fsq(
      collection(db, AppStorage.collection, resolvedAppId.value, PortfolioStorage.overlayCollection),
      where('operator_ids', 'array-contains', filterOperatorId.value)
    ) as Query<AppPortfolioOverlay>
  })
  const overlaySource = firestoreQuery<AppPortfolioOverlay>(
    overlayQuery,
    undefined,
    computed(() =>
      resolvedAppId.value
        ? `${AppStorage.collection}/${resolvedAppId.value}/${PortfolioStorage.overlayCollection}`
        : ''
    )
  )
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
  const allowedPortfolioIds = computed(() =>
    (overlaySource.value ?? [])
      .map((portfolio) => resolvePortfolioId(portfolio))
      .filter(Boolean)
  )
  const liveRootSource = firestoreFetchCollection<PortfolioCollectionDoc>(
    DEFAULT_COLLECTION_PATH
  )
  const liveRootDocs = firestoreLoadDocsByIds<PortfolioCollectionDoc>({
    collectionPath: DEFAULT_COLLECTION_PATH,
    ids: allowedPortfolioIds,
  })

  const liveItems = computed<PortfolioCollectionDoc[]>(() => {
    const rootById = new Map<string, PortfolioCollectionDoc>()
    const overlayById = new Map<string, AppPortfolioOverlay>()

    for (const portfolio of liveRootDocs.docs.value ?? []) {
      const id = resolvePortfolioId(portfolio)
      if (!id) continue
      rootById.set(id, {
        ...portfolio,
        id,
      })
    }

    for (const overlay of overlaySource.value ?? []) {
      const id = resolvePortfolioId(overlay)
      if (!id) continue
      overlayById.set(id, {
        ...overlay,
        id,
      })
    }

    const merged: PortfolioCollectionDoc[] = []
    const seen = new Set<string>()

    for (const portfolio of liveRootDocs.docs.value ?? []) {
      const id = resolvePortfolioId(portfolio)
      if (!id || seen.has(id)) continue
      seen.add(id)

      const item = surface({
        portfolio: {
          ...(rootById.get(id) ?? {}),
          id,
        },
        overlay: overlayById.get(id) ?? {},
      })
      if (item) merged.push(item)
    }

    for (const overlay of overlaySource.value ?? []) {
      const id = resolvePortfolioId(overlay)
      if (!id || seen.has(id)) continue
      seen.add(id)

      const item = surface({
        portfolio: {
          ...(rootById.get(id) ?? {}),
          id,
        },
        overlay: overlayById.get(id) ?? {},
      })
      if (item) merged.push(item)
    }

    return merged
  })

  const collectionItems = computed<PortfolioCollectionDoc[]>(() => {
    if (sourceMode.value === 'demo') return []
    if (sourceMode.value === 'test') return testSource.value ?? []
    if (!hasOperatorFilter.value) return liveRootSource.value ?? []
    return liveItems.value
  })

  const portfolios = computed<PortfolioCollectionDoc[]>(() =>
    collectionItems.value.reduce<PortfolioCollectionDoc[]>((acc, portfolio) => {
      const id = resolvePortfolioId(portfolio)
      if (!id) return acc
      if (hasFilter.value && !filterIdSet.value.has(id)) return acc
      if (hasOperatorFilter.value) {
        if (!filterOperatorId.value) return acc
        const operatorIds = Array.isArray(portfolio?.operator_ids)
          ? portfolio.operator_ids.map((value) => normalizeString(value))
          : []
        if (!operatorIds.includes(filterOperatorId.value)) return acc
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
    if (sourceMode.value === 'test') return testSource.value === undefined
    if (!hasOperatorFilter.value) return liveRootSource.value === undefined
    return (
      liveRootDocs.docs.value === undefined ||
      liveRootDocs.pending.value ||
      overlaySource.value === undefined
    )
  })

  return {
    portfolios,
    count,
    pending,
  }
}
