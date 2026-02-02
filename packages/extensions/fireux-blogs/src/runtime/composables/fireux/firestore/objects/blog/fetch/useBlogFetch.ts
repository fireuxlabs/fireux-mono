import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead.ts'
import { computed, type Ref } from 'vue'
import type { BlogPost } from '../../../../../../models/objects/blogPost.model'
import { useBlogCollection } from './useBlogCollection'

/**
 * Fetch helpers for blog posts (list + single).
 */
export function useBlogFetch() {
  const { firestoreFetchDoc } = useFirestoreRead()
  const { collection } = useBlogCollection()

  const items = computed(() => {
    const posts = collection.value
    if (!posts) return posts
    return posts.slice().sort((a, b) => {
      const createdA = new Date(a.created_at ?? '').getTime()
      const createdB = new Date(b.created_at ?? '').getTime()
      return createdB - createdA
    })
  })

  const fetchBySlug = async (
    slug: string
  ): Promise<Ref<BlogPost | null | undefined>> => {
    if (!slug) {
      throw new Error('Blog post slug is required')
    }
    return firestoreFetchDoc<BlogPost>('blogs', slug) as Ref<
      BlogPost | null | undefined
    >
  }

  return { items, fetchBySlug }
}
