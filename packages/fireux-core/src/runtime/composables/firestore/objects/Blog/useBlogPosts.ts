// filepath: /Users/danielwatson/Developer/FireUX/packages/fireux-core/composables/firestore/objects/Blog/useBlogPosts.ts
import { computed, type Ref } from 'vue'
import { useFirestoreRead } from '../../useFirestoreRead'
import type { BlogPost } from '../../../../models/blogPost.model'
import { useBlogPostCreate } from './useBlogPostCreate'
import { useBlogPostDelete } from './useBlogPostDelete'
import { useBlogPostUpdate } from './useBlogPostUpdate'
import { useBlogPostUtils } from './useBlogPostUtils'

export async function useBlogPosts() {
  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreRead()

  const blogPostsCollection = await firestoreFetchCollection<BlogPost>('blogs')

  const sortedBlogPostsCollection = computed(() => {
    const posts = blogPostsCollection.value
    return posts?.slice().sort((a: BlogPost, b: BlogPost) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  })

  async function fetchBlogPost(
    slug: string
  ): Promise<Ref<BlogPost | null | undefined>> {
    return (await firestoreFetchDoc('blogs', slug)) as Ref<
      BlogPost | null | undefined
    >
  }

  return {
    blogPostsCollection: sortedBlogPostsCollection,
    fetchBlogPost,
    ...useBlogPostCreate(),
    ...useBlogPostDelete(),
    ...useBlogPostUpdate(),
    ...useBlogPostUtils(),
  }
}
