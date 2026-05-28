import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead.ts'
import type { Ref } from 'vue'
import {
  BlogPostStorage,
  type BlogPost,
} from '../../../../../models/blogPost.model'

export function useBlogFetch() {
  const { firestoreFetchDoc } = useFirestoreRead()

  const fetchBySlug = async (
    slug: string
  ): Promise<Ref<BlogPost | null | undefined>> => {
    if (!slug) {
      throw new Error('Blog post slug is required')
    }
    return firestoreFetchDoc<BlogPost>(BlogPostStorage.collection, slug) as Ref<
      BlogPost | null | undefined
    >
  }

  return { fetchBySlug }
}
