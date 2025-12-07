import { computed, type Ref } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead.ts'
import type { BlogPost } from '../../../../models/objects/blogPost.model.ts'
import { useBlogCreate } from './useBlogCreate.ts'
import { useBlogDelete } from './useBlogDelete.ts'
import { useBlogUpdate } from './useBlogUpdate.ts'
import { useBlogPostUtils } from './useBlogPostUtils.ts'

/**
 * Aggregates blog post helpers with collection/doc accessors.
 */
export async function useBlogPosts() {
  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreRead()

  const blogPostsCollection = firestoreFetchCollection<BlogPost>('blogs')

  const blogPostsSorted = computed(() => {
    const posts = blogPostsCollection.value
    if (!posts) return posts
    return posts.slice().sort((a, b) => {
      const createdA = new Date(a.created_at ?? '').getTime()
      const createdB = new Date(b.created_at ?? '').getTime()
      return createdB - createdA
    })
  })

  const fetchBlogPost = async (
    slug: string
  ): Promise<Ref<BlogPost | null | undefined>> => {
    if (!slug) {
      throw new Error('Blog post slug is required')
    }
    return firestoreFetchDoc<BlogPost>('blogs', slug) as Ref<
      BlogPost | null | undefined
    >
  }

  return {
    blogPostsCollection: blogPostsSorted,
    fetchBlogPost,
    ...useBlogCreate(),
    ...useBlogDelete(),
    ...useBlogUpdate(),
    ...useBlogPostUtils(),
  }
}
