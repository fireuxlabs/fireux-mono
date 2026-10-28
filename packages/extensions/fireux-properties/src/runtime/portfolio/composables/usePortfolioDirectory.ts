import { useAsyncData } from 'nuxt/app'
import { readPages } from 'fireux-core/runtime/composables/http/readPages'

import { computed, ref } from 'vue'
import type { PortfolioDirectoryPage } from '../models/portfolio-read.model.ts'

export function usePortfolioDirectory() {
  const pageCount = ref(1)
  const state = useAsyncData<PortfolioDirectoryPage>(
    'portfolio-collection',
    async (_nuxtApp, { signal }) => {
      const fetchRead = $fetch.create({ signal, cache: 'no-store' })
      return readPages<PortfolioDirectoryPage>(
        fetchRead,
        '/api/portfolios',
        pageCount.value
      )
    },
    { default: () => ({ items: [] }) }
  )
  const nextCursor = computed(() => state.data.value?.nextCursor || '')
  const loadingMore = ref(false)
  const loadMoreError = ref<unknown>()
  const portfolios = computed(() => state.data.value?.items || [])
  const pending = computed(
    () =>
      state.pending.value && !(loadingMore.value && portfolios.value.length > 0)
  )
  const error = computed(() =>
    portfolios.value.length > 0 &&
    (loadingMore.value ||
      (loadMoreError.value && state.error.value === loadMoreError.value))
      ? undefined
      : state.error.value
  )
  const loadMore = async () => {
    if (!nextCursor.value || loadingMore.value) return
    loadingMore.value = true
    pageCount.value++
    try {
      await state.refresh()
      loadMoreError.value = state.error.value
      if (state.error.value) pageCount.value--
    } catch (cause) {
      loadMoreError.value = cause
      pageCount.value--
    } finally {
      loadingMore.value = false
    }
  }
  return {
    portfolios,
    pending,
    error,
    outcome: computed(() =>
      error.value
        ? 'error'
        : pending.value
          ? 'pending'
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
