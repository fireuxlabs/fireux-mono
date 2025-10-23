import { useFirestoreManager } from '../../operations/useFirestoreManager.ts'
import type { BlogPost } from '../../../../models/objects/blogPost.model.ts'

export function useBlogCreate() {
  const { setDocument } = useFirestoreManager()

  const createBlogPost = async (
    postData: Partial<BlogPost>,
    slug: string
  ): Promise<string> => {
    if (!slug) {
      throw new Error('No blog post slug provided.')
    }

    await setDocument('blogs', slug, postData)
    return slug
  }

  return { createBlogPost }
}
