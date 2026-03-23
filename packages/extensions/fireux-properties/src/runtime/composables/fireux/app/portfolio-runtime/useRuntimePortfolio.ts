import { computed, unref, type Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useRuntimePortfolioSelection } from './state'
import {
  resolveRuntimePortfolioDataCollectionPath,
  resolveRuntimePortfolioDocumentCollectionPath,
  resolveRuntimePortfolioPath as resolveRuntimePortfolioScopedPath,
} from './shared'
import {
  useRuntimePortfolioContext,
  type UseRuntimePortfolioParams,
} from './useRuntimePortfolioContext'
import { useRuntimePortfolioDocument } from './useRuntimePortfolioDocument'
import { useRuntimePortfolioData } from './useRuntimePortfolioData'

export { useRuntimePortfolioSelection } from './state'
export type { RuntimePortfolioMode } from './shared'

export function useRuntimePortfolio(params?: UseRuntimePortfolioParams) {
  const { appId } = useFireUXConfig()
  const selection = useRuntimePortfolioSelection()
  const { id, mode, isReadOnly } = useRuntimePortfolioContext(params, selection)
  const documentCollectionPath = computed(() => {
    if (params?.collectionPath !== undefined) {
      const explicitPath = String(unref(params.collectionPath) || '').trim()
      if (explicitPath) return explicitPath
    }
    return resolveRuntimePortfolioDocumentCollectionPath(mode.value)
  })
  const portfolioCollectionPath = computed(() =>
    resolveRuntimePortfolioDataCollectionPath(mode.value, appId)
  )
  const { doc, pending, scenario } = useRuntimePortfolioDocument({
    id,
    isReadOnly,
    documentCollectionPath,
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
    collectionPath: portfolioCollectionPath,
    documentCollectionPath,
    portfolioCollectionPath,

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
    return resolveRuntimePortfolioScopedPath(
      runtimePortfolio.collectionPath.value,
      portfolioId,
      suffix
    )
  })
}
