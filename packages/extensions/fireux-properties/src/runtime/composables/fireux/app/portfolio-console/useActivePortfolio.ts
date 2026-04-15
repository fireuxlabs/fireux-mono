import { computed, type Ref } from 'vue'
import { usePortfolioFetch } from '../../firestore/portfolio/fetch/usePortfolioFetch'
import { getDemoPortfolioScenario } from './demo-scenarios'
import { usePortfolioSelection } from './usePortfolioSelection'
import {
  resolvePortfolioConsoleCollectionPath,
  resolveRuntimePortfolioPath,
} from './shared'

/**
 * Portfolio loader.
 * Resolves the selected portfolio as the console uses it:
 * - demo scenario when in demo mode
 * - otherwise live portfolio document
 */
export function useActivePortfolio() {
  const { selectedId: id, mode } = usePortfolioSelection()
  const isDemo = computed(() => mode.value === 'demo')
  const firestorePortfolioId = computed(() => (isDemo.value ? '' : id.value))
  const { portfolio: livePortfolio, pending: livePending } =
    usePortfolioFetch(firestorePortfolioId)

  const scenario = computed(() => {
    if (!isDemo.value || !id.value) return null
    return getDemoPortfolioScenario(id.value)
  })

  const entity = computed(() => {
    if (!id.value) return null
    if (isDemo.value) return scenario.value?.portfolio ?? null
    return livePortfolio.value ?? null
  })

  const pending = computed(() => {
    if (!id.value) return false
    if (isDemo.value) return false
    return livePending.value
  })

  return {
    id,
    mode,
    isDemo,
    entity,
    scenario,
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
