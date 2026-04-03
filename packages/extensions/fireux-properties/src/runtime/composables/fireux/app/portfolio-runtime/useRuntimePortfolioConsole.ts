import { computed } from 'vue'
import { usePortfolioInterface } from '../../firestore/portfolio/utils/view/usePortfolioInterface'
import { getReadOnlyPortfolioScenarios } from './read-only-scenarios'
import { useRuntimePortfolio } from './useRuntimePortfolio'
import { useRuntimePortfolioSelection } from './state'
import type { Portfolio } from '../../../models/portfolio.model'

/**
 * Demo-only portfolio console.
 */
export function useRuntimePortfolioConsole() {
  const runtime = useRuntimePortfolio()
  const { setRuntimePortfolio } = useRuntimePortfolioSelection()
  const { pill } = usePortfolioInterface()
  const scenarios = computed(getReadOnlyPortfolioScenarios)

  const toPortfolioPill = (
    portfolio: Partial<Portfolio> | null | undefined,
    options: { id?: string; imageUrl?: unknown } = {}
  ) => {
    const card = pill({
      ...(portfolio ?? {}),
      ...(options.id ? { id: options.id } : {}),
    } as Portfolio)

    if (!card) return null

    const imageUrl = String(options.imageUrl || '').trim()
    return imageUrl ? { ...card, imageUrl } : card
  }

  const scenarioPills = computed(() =>
    scenarios.value
      .map((entry) =>
        toPortfolioPill(entry.portfolio, {
          id: entry.id,
          imageUrl:
            String((entry as any)?.manager?.avatar_url || '').trim() ||
            String((entry as any)?.image_url || '').trim(),
        })
      )
      .filter((entry): entry is NonNullable<ReturnType<typeof pill>> & { imageUrl: string } => Boolean(entry))
  )

  const activePortfolioPill = computed(() =>
    toPortfolioPill(runtime.portfolio.value)
  )
  const showSelector = computed(() => scenarios.value.length > 1)

  const setActiveScenario = (portfolioId: string) => {
    const resolvedId = String(portfolioId || '').trim()
    if (!resolvedId) return
    setRuntimePortfolio({
      portfolioId: resolvedId,
      mode: 'read-only',
    })
  }

  return {
    runtime,
    scenarios,
    scenarioPills,
    activePortfolioPill,
    showSelector,
    setActiveScenario,
  }
}
