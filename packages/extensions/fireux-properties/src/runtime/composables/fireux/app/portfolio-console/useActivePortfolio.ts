import { computed, type Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { usePortfolioFetch } from '../../firestore/portfolio/fetch/usePortfolioFetch'
import { usePortfolioSelection } from './usePortfolioSelection'
import {
  resolvePortfolioConsoleCollectionPath,
  resolveRuntimePortfolioPath,
} from './shared'

/**
 * Live portfolio loader.
 * Loads the selected portfolio document from `portfolios/<id>`.
 */
export function useActivePortfolio() {
  const { selectedId: id } = usePortfolioSelection()
  const { portfolio: fetchPortfolio, pending } = usePortfolioFetch()
  const livePortfolio = fetchPortfolio(id)

  const portfolio = computed(() => {
    if (!id.value) return null
    return livePortfolio.value ?? null
  })

  return {
    id,
    portfolio,
    pending,
  }
}

export type RuntimePortfolioRef = ReturnType<typeof useActivePortfolio>

export function useRuntimePortfolioPath(
  portfolioConsole: RuntimePortfolioRef,
  suffix: string
): Ref<string> {
  const { appId } = useFireUXConfig()
  const collectionPath = computed(() => resolvePortfolioConsoleCollectionPath(appId))

  return computed(() => {
    const portfolioId = String(portfolioConsole.id.value || '').trim()
    if (!portfolioId) return ''
    return resolveRuntimePortfolioPath(collectionPath.value, portfolioId, suffix)
  })
}
