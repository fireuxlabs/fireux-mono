import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import type { PortfolioDetailResponse } from '../models/portfolio-read.model.ts'
import type { Ref } from 'vue'

export function usePortfolioDetail(id: Ref<string>) {
  const state = useLiveAsyncData<PortfolioDetailResponse | null>(
    () => `portfolio-detail:${id.value}`,
    (liveFetch) => liveFetch(`/api/portfolios/${encodeURIComponent(id.value)}`),
    { default: () => null, watch: [id] }
  )
  return {
    portfolio: computed(() => state.data.value?.portfolio || null),
    ready: state.then(() => undefined),
    pending: state.pending,
    error: state.error,
  }
}
