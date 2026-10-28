import { useAsyncData } from 'nuxt/app'
import { resolveHttpDocumentOutcome } from 'fireux-core/runtime/utils/http-document-outcome'

import type { PortfolioDetailResponse } from '../models/portfolio-read.model.ts'
import { computed, type Ref } from 'vue'

export function usePortfolioDetail(id: Ref<string>) {
  const portfolioId = computed(() => id.value.trim())
  const state = useAsyncData<PortfolioDetailResponse | null>(
    () => `portfolio-detail:${portfolioId.value || 'none'}`,
    async (_nuxtApp, { signal }) => {
      const fetchRead = $fetch.create({ signal, cache: 'no-store' })
      return portfolioId.value
        ? fetchRead(`/api/portfolios/${encodeURIComponent(portfolioId.value)}`)
        : null
    },
    { default: () => null, watch: [portfolioId] }
  )
  const outcome = computed(() => {
    if (!portfolioId.value) return 'idle'
    if (
      state.data.value &&
      state.data.value.portfolio?.id !== portfolioId.value
    )
      return 'pending'
    return resolveHttpDocumentOutcome({
      enabled: Boolean(portfolioId.value),
      pending: state.pending.value,
      error: state.error.value,
      present: state.data.value?.portfolio?.id === portfolioId.value,
    })
  })
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
