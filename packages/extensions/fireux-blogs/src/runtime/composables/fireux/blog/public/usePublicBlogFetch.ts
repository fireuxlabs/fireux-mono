import { useAsyncData } from '#imports'
import { computed } from 'vue'
import type { PublicBlogDetailResponse } from '../../../../models/blogPost-public.model'
import { usePublicBlogLanguage } from './usePublicBlogLanguage'

export function usePublicBlogFetch(slug: string) {
  const blogLanguage = usePublicBlogLanguage()
  const state = useAsyncData<PublicBlogDetailResponse>(
    `public-blog:${slug}`,
    () => $fetch<PublicBlogDetailResponse>(
      `/api/public/blogs/${encodeURIComponent(slug)}`,
      { query: blogLanguage.query.value }
    ),
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
