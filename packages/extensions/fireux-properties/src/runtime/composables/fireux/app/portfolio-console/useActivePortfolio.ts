import { computed, type Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { usePortfolioFetch } from '../../firestore/portfolio/fetch/usePortfolioFetch'
import { usePortfolioSelection } from './usePortfolioSelection'
import {
  resolvePortfolioConsoleCollectionPath,
  resolveRuntimePortfolioPath,
} from './shared'

export { usePortfolioSelection } from './usePortfolioSelection'

/**
 * Live portfolio loader.
 * Loads the selected portfolio document from `portfolios/<id>`.
 * Keeps the app-scoped collection path because portfolio child data depends on it.
 */
export function useActivePortfolio() {
  const { appId } = useFireUXConfig()
  const { selectedId: id } = usePortfolioSelection()
  const { portfolio: fetchPortfolio, pending } = usePortfolioFetch()
  const livePortfolio = fetchPortfolio(id)

  const portfolio = computed(() => {
    if (!id.value) return null
    return livePortfolio.value ?? null
  })
  const collectionPath = computed(() => resolvePortfolioConsoleCollectionPath(appId))

  return {
    id,
    portfolio,
    pending,
    collectionPath,
  }
}

export type RuntimePortfolioRef = ReturnType<typeof useActivePortfolio>

export function useRuntimePortfolioPath(
  portfolioConsole: RuntimePortfolioRef,
  suffix: string
): Ref<string> {
  return computed(() => {
    const portfolioId = String(portfolioConsole.id.value || '').trim()
    if (!portfolioId) return ''
    return resolveRuntimePortfolioPath(
      portfolioConsole.collectionPath.value,
      portfolioId,
      suffix
    )
  })
}
