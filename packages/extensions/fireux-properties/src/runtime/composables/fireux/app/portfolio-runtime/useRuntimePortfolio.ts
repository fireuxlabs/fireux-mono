import { computed, type Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useRuntimePortfolioSelection } from './state'
import {
  resolveRuntimePortfolioDataCollectionPath,
  resolveRuntimePortfolioDocumentCollectionPath,
  resolveRuntimePortfolioPath,
} from './shared'
import { useRuntimePortfolioDocument } from './useRuntimePortfolioDocument'

export { useRuntimePortfolioSelection } from './state'
export type { RuntimePortfolioMode } from './shared'

/**
 * Canon portfolio console seam.
 *
 * Root portfolio identity stays at `/portfolios/<id>`.
 * Console-owned data lives under the app-hosted portfolio scope.
 */
export function useRuntimePortfolio() {
  const { appId } = useFireUXConfig()
  const selection = useRuntimePortfolioSelection()
  const id = selection.selectedId
  const mode = selection.mode
  const isReadOnly = computed(() => mode.value === 'read-only')
  const documentCollectionPath = computed(() =>
    resolveRuntimePortfolioDocumentCollectionPath(mode.value)
  )
  const portfolioCollectionPath = computed(() =>
    resolveRuntimePortfolioDataCollectionPath(mode.value, appId)
  )
  const { doc, pending, scenario } = useRuntimePortfolioDocument({
    id,
    isReadOnly,
    documentCollectionPath,
  })
  const isLoading = computed(() => Boolean(pending.value))
  const isReady = computed(() => {
    if (!id.value) return false
    if (isLoading.value) return false
    return Boolean(doc.value)
  })

  return {
    id,
    mode,
    isReadOnly,
    collectionPath: portfolioCollectionPath,
    documentCollectionPath,
    portfolioCollectionPath,

    doc,
    pending,
    isLoading,
    isReady,

    portfolio: doc,
    scenario,
  }
}

export type RuntimePortfolioRef = ReturnType<typeof useRuntimePortfolio>

export function useRuntimePortfolioPath(
  portfolioConsole: RuntimePortfolioRef,
  suffix: string
): Ref<string> {
  return computed(() => {
    const portfolioId = String(portfolioConsole.id.value || '').trim()
    if (!portfolioId || portfolioConsole.isReadOnly.value) return ''
    return resolveRuntimePortfolioPath(
      portfolioConsole.collectionPath.value,
      portfolioId,
      suffix
    )
  })
}
