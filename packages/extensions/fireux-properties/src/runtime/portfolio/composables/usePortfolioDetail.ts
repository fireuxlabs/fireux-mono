import type { PortfolioDetailResponse } from '../models/portfolio-read.model.ts'
import type { Ref } from 'vue'

export async function usePortfolioDetail(id: Ref<string>) {
  const state = await useAsyncData<PortfolioDetailResponse | null>(
    () => `portfolio-detail:${id.value}`,
    () => $fetch(`/api/portfolios/${encodeURIComponent(id.value)}`),
    { default: () => null, watch: [id] }
  )
  if (state.error.value) throw state.error.value
  return {
    portfolio: computed(() => state.data.value?.portfolio || null),
    pending: state.pending,
    error: state.error,
  }
}
