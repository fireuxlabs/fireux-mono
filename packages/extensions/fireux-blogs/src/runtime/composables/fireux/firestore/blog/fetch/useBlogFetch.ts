import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed, type Ref } from 'vue'
import {
  BlogPostStorage,
  type BlogPost,
} from '../../../../../models/blogPost.model'
import { isBlogPostInRuntimeScope } from '../utils/blogScope'
import { normalizeBlogPost } from '../../../../../utils/normalize-blog-post'

export function useBlogFetch() {
  const fireux = useFireUXConfig()
  const { firestoreFetchDoc } = useFirestoreRead()

  const fetchBySlug = async (
    slug: string
  ): Promise<Ref<BlogPost | null | undefined>> => {
    if (!slug) {
      throw new Error('Blog post slug is required')
    }
    const source = firestoreFetchDoc<BlogPost>(
      BlogPostStorage.collection,
      slug
    ) as Ref<BlogPost | null | undefined>
    return computed(() => {
      const post = source.value ? normalizeBlogPost(slug, source.value) : source.value
      if (!post || isBlogPostInRuntimeScope(post, fireux)) return post
      return null
    })
  }

  return { fetchBySlug }
}
