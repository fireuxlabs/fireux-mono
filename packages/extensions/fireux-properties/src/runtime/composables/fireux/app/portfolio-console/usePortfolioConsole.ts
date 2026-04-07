import { computed } from 'vue'
import { useConsoleState } from 'fireux-core/runtime/composables/fireux/console/useConsoleState'
import type { Portfolio } from '../../../models/portfolio.model'
import { usePortfolioSelection } from './usePortfolioSelection'
import { useActivePortfolio } from './useActivePortfolio'
import { usePortfolioInterface } from '../../firestore/portfolio/utils/view/usePortfolioInterface'

type UseRuntimePortfolioConsoleOptions = {
  publishHeader?: boolean
}

const normalizeString = (value: unknown): string => String(value || '').trim()

/**
 * Portfolio console adapter.
 * Keeps only the active pill, header data, and shared console-state wiring.
 */
export function usePortfolioConsole(
  options: UseRuntimePortfolioConsoleOptions = {}
) {
  const runtime = useActivePortfolio()
  const portfolioSelection = usePortfolioSelection()
  const { pill: toPortfolioCard } = usePortfolioInterface()

  const activePortfolioPill = computed(() =>
    toPortfolioCard(runtime.portfolio.value as Portfolio | null)
  )

  const headerData = computed(() =>
    activePortfolioPill.value
      ? {
          imageUrl: activePortfolioPill.value.avatarUrl,
          title: activePortfolioPill.value.title,
          subtitle:
            normalizeString(activePortfolioPill.value.subtitle) ||
            normalizeString(runtime.portfolio.value?.id),
        }
      : null
  )

  const consoleState = useConsoleState({
    family: 'portfolio',
    selectedId: runtime.id,
    mode: computed(() => 'live'),
    setMode: () => {},
    clearSelection: portfolioSelection.clearRuntimePortfolio,
    header: headerData,
    publishHeader: options.publishHeader,
    modeOptions: [{ value: 'live', label: 'Real' }],
  })

  return {
    runtime,
    activePortfolioPill,
    headerData,
    consoleState,
  }
}
