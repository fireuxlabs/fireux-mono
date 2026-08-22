import { computed, ref } from 'vue'
import type { PortfolioDirectoryPage } from '../models/portfolio-read.model.ts'

export function usePortfolioDirectory() {
  const state = useAsyncData<PortfolioDirectoryPage>('portfolio-directory', () =>
    $fetch('/api/portfolios'), { default: () => ({ items: [] }) }
  )
  const extra = ref<PortfolioDirectoryPage['items']>([])
  const nextCursor = ref('')
  watchEffect(() => { nextCursor.value = state.data.value?.nextCursor || '' })
  const loadingMore = ref(false)
  const loadMoreError = ref<unknown>()
  const portfolios = computed(() => [...(state.data.value?.items || []), ...extra.value])
  const loadMore = async () => {
    if (!nextCursor.value || loadingMore.value) return
    loadingMore.value = true
    loadMoreError.value = undefined
    try {
      const page = await $fetch<PortfolioDirectoryPage>('/api/portfolios', { query: { cursor: nextCursor.value } })
      const known = new Set(portfolios.value.map(item => item.id))
      extra.value.push(...page.items.filter(item => !known.has(item.id)))
      nextCursor.value = page.nextCursor || ''
    } catch (error) { loadMoreError.value = error } finally { loadingMore.value = false }
  }
  return {
    portfolios,
    pending: state.pending,
    error: state.error,
    outcome: computed(() => state.pending.value ? 'pending' : state.error.value ? 'error' : portfolios.value.length ? 'ready' : 'empty'),
    hasMore: computed(() => Boolean(nextCursor.value)),
    loadingMore,
    loadMoreError,
    loadMore,
    refresh: state.refresh,
  }
}
