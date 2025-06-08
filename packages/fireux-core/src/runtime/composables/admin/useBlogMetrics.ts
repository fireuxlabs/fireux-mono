import { computed } from 'vue'
import { useBlogPosts } from '../firestore/objects/Blog/useBlogPosts'
import type { BlogPost } from '../../models/blogPost.model'

export async function useBlogMetrics() {
  const { blogPostsCollection } = await useBlogPosts()

  const metrics = {
    totalPosts: computed(() => blogPostsCollection.value?.length ?? 0),
    articlePosts: computed(() =>
      blogPostsCollection.value?.filter(
        (post: BlogPost) => post.type === 'article'
      )
    ),
    productPosts: computed(() =>
      blogPostsCollection.value?.filter(
        (post: BlogPost) => post.type === 'product'
      )
    ),
  }

  return metrics
}
