import { useFirestoreUpdate } from '../../useFirestoreUpdate'
import type { BlogPost } from '../../../../models/blogPost.model'

export function useBlogUpdate() {
  const { updateDocument } = useFirestoreUpdate()

  async function updateBlogPost(
    postId: string,
    updates: Partial<BlogPost>
  ): Promise<boolean> {
    if (!postId) throw new Error('No BlogPost ID provided.')
    if (!updates || typeof updates !== 'object')
      throw new Error('Invalid update payload. Must be an object.')

    try {
      await updateDocument('blogs', postId, updates)
      console.log(
        `✅ BlogPost Updated Successfully: ${JSON.stringify(updates)}`
      )
      return true
    } catch (error) {
      console.error('❌ Error Updating BlogPost:', error)
      throw error
    }
  }

  return { updateBlogPost }
}
