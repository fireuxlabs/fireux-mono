// filepath: /Users/danielwatson/Developer/FireUX/packages/fireux-core/composables/firestore/objects/Blog/useBlogPosts.ts
import { computed, type Ref } from 'vue'
import { useFirestoreManager } from '../../useFirestoreManager'
import type { BlogPost } from '../../../../models/blogPost.model'
import { useBlogCreate } from './useBlogCreate'
import { useBlogDelete } from './useBlogDelete'
import { useBlogUpdate } from './useBlogUpdate'
import { useBlogValidation } from './utils/useBlogValidation'
import { useBlogFormatting } from './utils/useBlogFormatting'

export async function useBlogs() {
  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreManager()

  const blogsCollection = await firestoreFetchCollection<BlogPost>('blogs')

  const sortedBlogsCollection = computed(() => {
    const posts = blogsCollection.value
    return posts?.slice().sort((a: BlogPost, b: BlogPost) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  })

  async function fetchBlog(
    slug: string
  ): Promise<Ref<BlogPost | null | undefined>> {
    return (await firestoreFetchDoc('blogs', slug)) as Ref<
      BlogPost | null | undefined
    >
  }

  // Child composables
  const blogCreate = useBlogCreate()
  const blogUpdate = useBlogUpdate()
  const blogDelete = useBlogDelete()
  const blogValidation = useBlogValidation()
  const blogFormatting = useBlogFormatting()

  return {
    blogsCollection: sortedBlogsCollection,
    fetchBlog,
    ...blogCreate,
    ...blogUpdate,
    ...blogDelete,
    ...blogValidation,
    ...blogFormatting,
  }
}
