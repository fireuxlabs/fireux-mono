import { useAsyncData } from 'nuxt/app'

import { computed } from 'vue'
import type { BlogDetailResponse } from '../../models/blog-directory.model.ts'
import { useBlogLanguage } from './useBlogLanguage'

export function useBlogDetail(slug: string) {
  const blogLanguage = useBlogLanguage()
  const state = useAsyncData<BlogDetailResponse>(
    `blog-detail:${slug}`,
    async (_nuxtApp, { signal }) => {
      const fetchRead = $fetch.create({ signal, cache: 'no-store' })
      return fetchRead<BlogDetailResponse>(
        `/api/blogs/${encodeURIComponent(slug)}`,
        {
          query: blogLanguage.query.value,
        }
      )
    },
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
