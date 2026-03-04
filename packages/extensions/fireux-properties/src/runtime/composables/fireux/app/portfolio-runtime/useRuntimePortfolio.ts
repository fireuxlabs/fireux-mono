import { computed, type Ref } from 'vue'
import { useRuntimePortfolioSelection } from './state'
import { resolveRuntimePortfolioCollectionPath } from './shared'
import {
  useRuntimePortfolioContext,
  type UseRuntimePortfolioParams,
} from './useRuntimePortfolioContext'
import { useRuntimePortfolioDocument } from './useRuntimePortfolioDocument'
import { useRuntimePortfolioData } from './useRuntimePortfolioData'

export { useRuntimePortfolioSelection } from './state'
export type { RuntimePortfolioMode } from './shared'

export function useRuntimePortfolio(params?: UseRuntimePortfolioParams) {
  const selection = useRuntimePortfolioSelection()
  const { id, mode, isReadOnly } = useRuntimePortfolioContext(params, selection)
  const collectionPath = computed(() => resolveRuntimePortfolioCollectionPath(mode.value))
  const { doc, pending, scenario } = useRuntimePortfolioDocument({
    id,
    isReadOnly,
    collectionPath,
  })
  const data = useRuntimePortfolioData({
    id,
    pending,
    doc,
    scenario,
  })
  const isLoading = computed(() => data.isLoading.value)
  const isReady = computed(() => data.isReady.value)

  return {
    id,
    mode,
    isReadOnly,
    collectionPath,

    // Canon runtime contract
    doc,
    pending,
    isLoading,
    isReady,
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
