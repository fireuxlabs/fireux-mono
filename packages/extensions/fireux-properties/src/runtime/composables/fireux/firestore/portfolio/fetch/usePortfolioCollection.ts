import { computed, isRef, type Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import type { Portfolio } from '../../../../../models/portfolio.model'

type PortfolioCollectionDoc = Partial<Portfolio> & {
  id?: string
  team_ids?: string[]
}
type AppPortfolioOverlay = PortfolioCollectionDoc & {
  team_ids?: string[]
}

const DEFAULT_COLLECTION_PATH = 'portfolios'
const TEST_COLLECTION_PATH = 'test-portfolios'

export type PortfolioCollectionFilterValue = string | number | null | undefined
export type PortfolioCollectionFilter = {
  ids?: PortfolioCollectionFilterValue[] | null | undefined
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
  const { firestoreFetchCollection } = useFirestoreRead()
  const { appId } = useFireUXConfig()
  const sourceMode = computed<PortfolioCollectionSource>(() => {
    if (isRef(options.source)) return options.source.value ?? 'live'
    return options.source ?? 'live'
  })
  const liveSource = computed(() => {
    if (sourceMode.value !== 'live') return null
    return firestoreFetchCollection<PortfolioCollectionDoc>(DEFAULT_COLLECTION_PATH)
  })
  const testSource = computed(() => {
    if (sourceMode.value !== 'test') return null
    return firestoreFetchCollection<PortfolioCollectionDoc>(TEST_COLLECTION_PATH)
  })
  const resolvedAppId = computed(() => normalizeString(appId))
  const overlaySource = computed(() => {
    if (sourceMode.value !== 'live' || !resolvedAppId.value) return null
    return firestoreFetchCollection<AppPortfolioOverlay>(
      `apps/${resolvedAppId.value}/${DEFAULT_COLLECTION_PATH}`
    )
  })
  const resolvedFilter = computed<PortfolioCollectionFilter | undefined>(() => {
    if (isRef(options.filter)) return options.filter.value ?? undefined
    return options.filter ?? undefined
  })
  const hasFilter = computed(() => Array.isArray(resolvedFilter.value?.ids))
  const filterTeamId = computed(() =>
    normalizeString(resolvedFilter.value?.teamId)
  )
  const hasTeamFilter = computed(() =>
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

  const liveItems = computed<PortfolioCollectionDoc[]>(() => {
    const rootById = new Map<string, PortfolioCollectionDoc>()
    const overlayById = new Map<string, AppPortfolioOverlay>()

    for (const portfolio of liveSource.value?.value ?? []) {
      const id = resolvePortfolioId(portfolio)
      if (!id) continue
      rootById.set(id, {
        ...portfolio,
        id,
      })
    }

    for (const overlay of overlaySource.value?.value ?? []) {
      const id = resolvePortfolioId(overlay)
      if (!id) continue
      overlayById.set(id, {
        ...overlay,
        id,
      })
    }

    const merged: PortfolioCollectionDoc[] = []
    const seen = new Set<string>()

    for (const portfolio of liveSource.value?.value ?? []) {
      const id = resolvePortfolioId(portfolio)
      if (!id || seen.has(id)) continue
      seen.add(id)

      merged.push({
        ...(rootById.get(id) ?? {}),
        ...(overlayById.get(id) ?? {}),
        id,
      })
    }

    for (const overlay of overlaySource.value?.value ?? []) {
      const id = resolvePortfolioId(overlay)
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

  const collectionItems = computed<PortfolioCollectionDoc[]>(() => {
    if (sourceMode.value === 'demo') return []
    if (sourceMode.value === 'test') return testSource.value?.value ?? []
    return liveItems.value
  })

  const portfolios = computed<PortfolioCollectionDoc[]>(() =>
    collectionItems.value.reduce<PortfolioCollectionDoc[]>((acc, portfolio) => {
      const id = resolvePortfolioId(portfolio)
      if (!id) return acc
      if (hasFilter.value && !filterIdSet.value.has(id)) return acc
      if (hasTeamFilter.value) {
        if (!filterTeamId.value) return acc
        const teamIds = Array.isArray(portfolio?.team_ids)
          ? portfolio.team_ids.map((value) => normalizeString(value))
          : []
        if (!teamIds.includes(filterTeamId.value)) return acc
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
    if (sourceMode.value === 'test') return testSource.value?.value === undefined
    return (
      liveSource.value?.value === undefined ||
      (overlaySource.value ? overlaySource.value.value === undefined : false)
    )
  })

  return {
    portfolios,
    count,
    pending,
  }
}
