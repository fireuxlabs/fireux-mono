import { useAsyncData } from '#imports'
import { computed, ref, watch } from 'vue'
import type {
  BlogDirectoryPage,
  BlogDirectoryEntry,
} from '../../../../models/blog-directory.model'
import { useBlogLanguage } from './useBlogLanguage'

export function useBlogDirectory() {
  const blogLanguage = useBlogLanguage()
  const state = useAsyncData<BlogDirectoryPage>(
    'blog-directory',
    () =>
      $fetch<BlogDirectoryPage>('/api/blogs', {
        query: blogLanguage.query.value,
      }),
    {
      watch: [blogLanguage.language],
    }
  )
  const additionalItems = ref<BlogDirectoryEntry[]>([])
  const nextCursor = ref('')
  const loadingMore = ref(false)
  const loadMoreError = ref<Error | null>(null)

  watch(
    () => state.data.value,
    (page: BlogDirectoryPage | null | undefined) => {
      additionalItems.value = []
      nextCursor.value = page?.nextCursor ?? ''
      loadMoreError.value = null
    },
    { immediate: true }
  )

  const collection = computed(() => {
    const seen = new Set<string>()
    return [
      ...(state.data.value?.items ?? []),
      ...additionalItems.value,
    ].filter((item) => {
      if (!item.id || seen.has(item.id)) return false
      seen.add(item.id)
      return true
    })
  })
  const count = computed(() => collection.value.length)
  const hasMore = computed(() => Boolean(nextCursor.value))
  const outcome = computed(() => {
    if (state.pending.value) return 'pending'
    if (state.error.value || !state.data.value) return 'error'
    return collection.value.length ? 'ready' : 'empty'
  })

  async function loadMore() {
    if (!nextCursor.value || loadingMore.value) return

    loadingMore.value = true
    loadMoreError.value = null
    try {
      const page = await $fetch<BlogDirectoryPage>('/api/blogs', {
        query: {
          cursor: nextCursor.value,
          ...blogLanguage.query.value,
        },
      })
      additionalItems.value = [...additionalItems.value, ...page.items]
      nextCursor.value = page.nextCursor ?? ''
    } catch (error) {
      loadMoreError.value =
        error instanceof Error
          ? error
          : new Error('More stories could not be loaded.')
    } finally {
      loadingMore.value = false
    }
  }

  async function refresh() {
    additionalItems.value = []
    nextCursor.value = ''
    loadMoreError.value = null
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
