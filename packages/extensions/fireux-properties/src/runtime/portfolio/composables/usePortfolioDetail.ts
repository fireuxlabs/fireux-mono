import { resolveReadOutcome } from 'fireux-core/runtime/composables/fireux/firestore/operations/read-outcome'
import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import type { PortfolioDetailResponse } from '../models/portfolio-read.model.ts'
import { computed, type Ref } from 'vue'

export function usePortfolioDetail(id: Ref<string>) {
  const portfolioId = computed(() => id.value.trim())
  const state = useLiveAsyncData<PortfolioDetailResponse | null>(
    () => `portfolio-detail:${portfolioId.value || 'none'}`,
    (liveFetch) =>
      portfolioId.value
        ? liveFetch(`/api/portfolios/${encodeURIComponent(portfolioId.value)}`)
        : null,
    { default: () => null, watch: [portfolioId] }
  )
  const outcome = computed(() =>
    resolveReadOutcome({
      active: Boolean(portfolioId.value),
      current:
        !state.data.value ||
        state.data.value.portfolio?.id === portfolioId.value,
      pending: state.pending.value,
      error: state.error.value,
      kind: 'document',
      present: state.data.value?.portfolio?.id === portfolioId.value,
    })
  )
  return {
    portfolio: computed(() =>
      outcome.value === 'ready' ? (state.data.value?.portfolio ?? null) : null
    ),
    ready: state.then(() => undefined),
    pending: computed(() => outcome.value === 'pending'),
    error: state.error,
    outcome,
  }
}
