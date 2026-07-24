import { useAsyncData } from '#imports'
import { computed } from 'vue'
import type { PublicBlogDetailResponse } from '../../../../models/blogPost-public.model'

export function usePublicBlogFetch(slug: string) {
  const state = useAsyncData<PublicBlogDetailResponse>(
    `public-blog:${slug}`,
    () => $fetch<PublicBlogDetailResponse>(`/api/public/blogs/${encodeURIComponent(slug)}`)
  )
  return {
    post: computed(() => state.data.value?.item),
    pending: state.pending,
    error: state.error,
    ready: state.then(() => undefined),
  }
}
