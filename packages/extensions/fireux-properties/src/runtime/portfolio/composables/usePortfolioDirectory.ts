import { readLivePages } from 'fireux-core/runtime/composables/fireux/firestore/readLivePages'
import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import { computed, ref } from 'vue'
import type { PortfolioDirectoryPage } from '../models/portfolio-read.model.ts'

export function usePortfolioDirectory() {
  const pageCount = ref(1)
  const state = useLiveAsyncData<PortfolioDirectoryPage>(
    'portfolio-collection',
    (liveFetch) =>
      readLivePages<PortfolioDirectoryPage>(
        liveFetch,
        '/api/portfolios',
        pageCount.value
      ),
    { default: () => ({ items: [] }) }
  )
  const nextCursor = computed(() => state.data.value?.nextCursor || '')
  const loadingMore = ref(false)
  const loadMoreError = ref<unknown>()
  const portfolios = computed(() => state.data.value?.items || [])
  const loadMore = async () => {
    if (!nextCursor.value || loadingMore.value) return
    loadingMore.value = true
    pageCount.value++
    try {
      await state.refresh()
      loadMoreError.value = state.error.value
    } finally {
      loadingMore.value = false
    }
  }
  return {
    portfolios,
    pending: state.pending,
    error: state.error,
    outcome: computed(() =>
      state.pending.value
        ? 'pending'
        : state.error.value
          ? 'error'
          : portfolios.value.length
            ? 'ready'
            : 'empty'
    ),
    hasMore: computed(() => Boolean(nextCursor.value)),
    loadingMore,
    loadMoreError,
    loadMore,
    refresh: state.refresh,
  }
}
