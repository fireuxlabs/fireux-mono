import { computed, type Ref } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import type { Portfolio } from '../../../../models/portfolio.model'
import {
  getReadOnlyPortfolioScenario,
  type ReadOnlyPortfolioScenario,
} from './read-only-scenarios'
import { useRuntimePortfolioSelection } from './state'
import { resolveRuntimePortfolioCollectionPath } from './shared'
import {
  useRuntimePortfolioContext,
  type UseRuntimePortfolioParams,
} from './useRuntimePortfolioContext'

export { useRuntimePortfolioSelection } from './state'
export type { RuntimePortfolioMode } from './shared'

export function useRuntimePortfolio(params?: UseRuntimePortfolioParams) {
  const selection = useRuntimePortfolioSelection()
  const { id, mode, isReadOnly } = useRuntimePortfolioContext(params, selection)
  const { firestoreFetchCollection } = useFirestoreRead()
  const collectionPath = computed(() => resolveRuntimePortfolioCollectionPath(mode.value))

  const livePortfolios = firestoreFetchCollection<Portfolio>(collectionPath.value)

  const scenario = computed<ReadOnlyPortfolioScenario | null>(() => {
    if (!isReadOnly.value || !id.value) return null
    return getReadOnlyPortfolioScenario(id.value)
  })

  const portfolio = computed<Portfolio | null>(() => {
    if (!id.value) return null
    if (isReadOnly.value) return scenario.value?.portfolio ?? null

    return (
      (livePortfolios.value ?? []).find(
        (entry) => String(entry.id || '').trim() === id.value
      ) ?? null
    )
  })

  const pending = computed(() => {
    if (!id.value) return false
    if (isReadOnly.value) return false
    return livePortfolios.value === undefined
  })

  const doc = computed<Portfolio | null>(() => portfolio.value)
  const data = computed(() => ({
    scenario: scenario.value,
  }))

  return {
    id,
    mode,
    isReadOnly,
    collectionPath,

    // Canon runtime contract
    doc,
    pending,
    data,

    // Backward-compatible aliases
    portfolio: doc,
    scenario,
  }
}

export type RuntimePortfolioRef = ReturnType<typeof useRuntimePortfolio>

export function useRuntimePortfolioPath(
  runtimePortfolio: RuntimePortfolioRef,
  suffix: string
): Ref<string> {
  return computed(() => {
    const portfolioId = String(runtimePortfolio.id.value || '').trim()
    if (!portfolioId || runtimePortfolio.isReadOnly.value) return ''
    return `portfolios/${portfolioId}/${suffix}`
  })
}
