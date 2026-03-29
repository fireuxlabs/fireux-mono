import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead.ts'
import { computed, type Ref } from 'vue'
import type { BlogPost } from '../../../../../models/blogPost.model'
import { useBlogCollection } from './useBlogCollection'

const timestampToMillis = (value: unknown): number => {
  if (!value) return 0
  if (typeof value === 'string') return new Date(value).getTime()
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'object' && value !== null) {
    const seconds = Number((value as { seconds?: unknown }).seconds ?? 0)
    const nanoseconds = Number((value as { nanoseconds?: unknown }).nanoseconds ?? 0)
    return seconds * 1000 + Math.floor(nanoseconds / 1_000_000)
  }
  return 0
}

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
      const createdA = timestampToMillis(a.created?.at)
      const createdB = timestampToMillis(b.created?.at)
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
