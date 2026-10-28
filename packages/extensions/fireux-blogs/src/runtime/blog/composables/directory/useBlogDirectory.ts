import { useAsyncData } from 'nuxt/app'
import { readPages } from 'fireux-core/runtime/composables/http/readPages'

import { computed, ref, watch } from 'vue'
import type { BlogDirectoryPage } from '../../models/blog-directory.model.ts'
import { useBlogLanguage } from './useBlogLanguage'

export function useBlogDirectory() {
  const blogLanguage = useBlogLanguage()
  const pageCount = ref(1)
  const state = useAsyncData<BlogDirectoryPage>(
    'blog-directory',
    async (_nuxtApp, { signal }) => {
      const fetchRead = $fetch.create({ signal, cache: 'no-store' })
      return readPages<BlogDirectoryPage>(
        fetchRead,
        '/api/blogs',
        pageCount.value,
        {
          query: blogLanguage.query.value,
        }
      )
    },
    {
      watch: [blogLanguage.language],
    }
  )
  const nextCursor = computed(() => state.data.value?.nextCursor || '')
  const loadingMore = ref(false)
  const loadMoreError = ref<Error | null>(null)
  watch(
    blogLanguage.language,
    () => {
      pageCount.value = 1
    },
    { flush: 'sync' }
  )
  const collection = computed(() => state.data.value?.items || [])
  const count = computed(() => collection.value.length)
  const hasMore = computed(() => Boolean(nextCursor.value))
  const outcome = computed(() => {
    if (state.pending.value) return 'pending'
    if (state.error.value || !state.data.value) return 'error'
    return collection.value.length ? 'ready' : 'empty'
  })

  async function loadMore() {
    if (!hasMore.value || loadingMore.value) return
    loadingMore.value = true
    pageCount.value++
    try {
      await state.refresh()
      loadMoreError.value = state.error.value || null
    } finally {
      loadingMore.value = false
    }
  }
  async function refresh() {
    await state.refresh()
  }

  return {
    collection,
    count,
    pending: state.pending,
    error: state.error,
    outcome,
    hasMore,
    loadingMore,
    loadMoreError,
    loadMore,
    refresh,
    ready: state.then(() => undefined),
  }
}
