import { useFirestoreManager } from '../../useFirestoreManager'
import type { BlogPost } from '../../../../models/blogPost.model'

export function useBlogPostCreate() {
  const { setDocument } = useFirestoreManager()

  const createBlogPost = async (
    postData: Partial<BlogPost>,
    slug: string
  ): Promise<string> => {
    // Use the slug as the document ID
    return setDocument('blogs', slug, postData).then(() => slug)
  }

  return { createBlogPost }
}
