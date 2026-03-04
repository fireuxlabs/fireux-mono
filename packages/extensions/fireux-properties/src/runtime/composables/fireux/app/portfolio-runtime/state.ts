import { useCookie, useState } from '#imports'
import { computed } from 'vue'
import { normalizeMode, normalizeString, type RuntimePortfolioMode } from './shared'

type RuntimePortfolioSelectionState = {
  portfolioId: string
  mode: RuntimePortfolioMode
}

const COOKIE_KEY = 'fireux_runtime_portfolio'

const normalizeSelectionState = (value: unknown): RuntimePortfolioSelectionState => {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  return {
    portfolioId: normalizeString(source.portfolioId),
    mode: normalizeMode(source.mode) ?? 'live',
  }
}

export function useRuntimePortfolioSelection() {
  const cookie = useCookie<RuntimePortfolioSelectionState>(COOKIE_KEY, {
    default: () => ({ portfolioId: '', mode: 'live' }),
    path: '/',
    sameSite: 'lax',
  })

  const runtimePortfolioState = useState<RuntimePortfolioSelectionState>(COOKIE_KEY, () =>
    normalizeSelectionState(cookie.value)
  )

  cookie.value = normalizeSelectionState(runtimePortfolioState.value)

  const setRuntimePortfolio = (selection: Partial<RuntimePortfolioSelectionState> = {}) => {
    const next: RuntimePortfolioSelectionState = {
      portfolioId:
        selection.portfolioId !== undefined
          ? normalizeString(selection.portfolioId)
          : runtimePortfolioState.value.portfolioId,
      mode:
        selection.mode !== undefined
          ? normalizeMode(selection.mode) ?? runtimePortfolioState.value.mode
          : runtimePortfolioState.value.mode,
    }

    runtimePortfolioState.value = next
    cookie.value = next
  }

  const clearRuntimePortfolio = () => {
    const next: RuntimePortfolioSelectionState = { portfolioId: '', mode: 'live' }
    runtimePortfolioState.value = next
    cookie.value = next
  }

  return {
    runtimePortfolioId: computed(() => runtimePortfolioState.value.portfolioId),
    runtimePortfolioMode: computed(
      () => normalizeMode(runtimePortfolioState.value.mode) ?? 'live'
    ),
    setRuntimePortfolio,
    clearRuntimePortfolio,
  }
}
