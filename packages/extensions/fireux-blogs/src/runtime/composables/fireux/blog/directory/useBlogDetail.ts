import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import { computed } from 'vue'
import type { BlogDetailResponse } from '../../../../models/blog-directory.model'
import { useBlogLanguage } from './useBlogLanguage'

export function useBlogDetail(slug: string) {
  const blogLanguage = useBlogLanguage()
  const state = useLiveAsyncData<BlogDetailResponse>(
    `blog-detail:${slug}`,
    (liveFetch) =>
      liveFetch<BlogDetailResponse>(`/api/blogs/${encodeURIComponent(slug)}`, {
        query: blogLanguage.query.value,
      }),
    {
      watch: [blogLanguage.language],
    }
  )
  return {
    post: computed(() => state.data.value?.item),
    pending: state.pending,
    error: state.error,
    ready: state.then(() => undefined),
  }
}
